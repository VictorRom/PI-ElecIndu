from fastapi import FastAPI, status, HTTPException
import uvicorn
import ssl
from pydantic import BaseModel
from datetime import datetime, timedelta
import pymongo as pm
import math
from random import random
import requests
from starlette.requests import Request
import logging

logging.basicConfig(level=logging.INFO)

def haversine(lat1, lon1, lat2, lon2):
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of the Earth in kilometers
    radius = 6371

    # Calculate the distance
    distance = c * radius

    return distance  # in km


def request_elevations(latitudes, longitudes):
    # make request to API for elevation
    # e.g. request : https://api.open-meteo.com/v1/elevation?latitude=52.52,48.85&longitude=13.41,2.35
    concatenated_latitude = ""; concatenated_longitude = ""
    for lat,long in zip(latitudes, longitudes):
        concatenated_latitude += str(lat) + ","
        concatenated_longitude += str(long) + ","
    concatenated_latitude = concatenated_latitude[:-1] # remove the last comma
    concatenated_longitude = concatenated_longitude[:-1] # remove the last comma
    request = f"https://api.open-meteo.com/v1/elevation?latitude={concatenated_latitude}&longitude={concatenated_longitude}"
    response = requests.get(request)

    return [] if response.status_code != 200 else response.json()["elevation"]


mongodb_connection_string = 'mongodb://root:example@mongo:27017'
client = pm.MongoClient(mongodb_connection_string)
db = client['elecindu']
gps_collection = db['gps']
stats_collection = db['stats']


class GPSData(BaseModel):
    type: str
    geometry: dict
    properties: dict


app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET","DELETE"],
    allow_headers=["*"],
)

##############
# GET ROUTES #
##############
@app.get("/")
async def root():
    print("GET /")

    return {"message": "Hello"}


# Route live retourne ça :
# {
# "points": [[lat, lon], [lat, lon], ...]
# "timestamps": [...],
# "speeds": [...],
# "device_last_update": int, # minutes
# }

@app.get("/live/proto={proto}")
async def live_page(proto: int):
    dts = datetime.now() - timedelta(days=1)
    dts = dts.replace(minute=dts.minute - dts.minute % 10, second=0, microsecond=0)
    dte = datetime.now()
    dte = dte.replace(minute=dte.minute - dte.minute % 10, second=0, microsecond=0)

    query = {
        "properties.timestamp": {
            "$elemMatch": {
                "$gte": dts,
            }
        },
        "properties.prototype": {
            "$eq": proto
        }
    }

    try:
        results = list(gps_collection.find(query))

        if len(results) == 0:
            return {"message": "No data found"}, status.HTTP_404_NOT_FOUND

        points = [];
        timestamps = [];
        speeds = []
        for day in results:
            # get the index of the first and last point that is in the time range
            first_index = -1;
            last_index = -1
            # we go through the timestamps of the day, but the dts and dte aren't in the same day
            for i in range(len(day["properties"]["timestamp"])):
                # so if we find the dts, we start at this index and we take all the points until the end of the day
                if day["properties"]["timestamp"][i] >= dts:
                    first_index = i
                    last_index = len(day["properties"]["timestamp"])
                    break
                # inversely, if we find the dte, we take all the points from the beginning of the day until this index
                if day["properties"]["timestamp"][i] <= dte:
                    first_index = 0
                    last_index = i
                    break

            # do something cause error if no point in the time range
            if first_index == -1 or last_index == -1:
                return {"message": "Error with the data"}, status.HTTP_500_INTERNAL_SERVER_ERROR

            for i in range(first_index, last_index):
                # add the points, timestamps, speeds and elevations to the lists
                points.append(day["geometry"]["coordinates"][i])
                timestamps.append(day["properties"]["timestamp"][i])
                speeds.append(day["properties"]["speed"][i])

        # get the number of minutes since the last point was added to the database
        minutes_since_last_point = (datetime.now() - timestamps[-1]).total_seconds() / 60

        # sort the points, timestamps and speeds by timestamp
        points, timestamps, speeds = zip(*sorted(zip(points, timestamps, speeds), key=lambda x: x[1]))

        return {
            "points": points,
            "timestamps": timestamps,
            "speeds": speeds,
            "device_last_update": minutes_since_last_point
        }, status.HTTP_200_OK

    except pm.errors.PyMongoError as e:
        print(e)
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    except Exception as e:
        print(e)
        return {"message": "An general error occured"}, status.HTTP_500_INTERNAL_SERVER_ERROR


# Route trail retourne ça :
# {
# "points": [[lat, lon], [lat, lon], ...]
# "timestamps": [...],
# "speeds": [...],
# "elevations": [...],
# "statistics": {
# "distance": float,
# "avg_speed": float,
# "total_time": float,
# }
# "global_stats": {
#    "distance": float,
#    "avg_speed": float,
#    "total_time": float,
# }
# "segments": {
#    "best": {
#       "distance": float,
#       "speed": float,
#       "elevation": float,
#   },
#   "worst": {
#       "distance": float,
#       "speed": float,
#       "elevation": float,
#   },
# }
# }

# on passe les data en json sans passer par le body ?
@app.get("/trail/dts={dts}&dte={dte}&proto={proto}")
async def trail_page(dts: datetime, dte: datetime, proto: int):
    # round the dates to the nearest 10 minutes
    dts = dts.replace(minute=dts.minute - dts.minute % 10, second=0, microsecond=0)
    dte = dte.replace(minute=dte.minute - dte.minute % 10, second=0, microsecond=0)

    # verify that the dates are valid
    if dts >= dte:
        return {"message": "Invalid dates"}, status.HTTP_400_BAD_REQUEST

    # get the database entry days between dts and dte from the database and return them
    query = {
        "properties.timestamp": {
            "$elemMatch": {
                "$gte": dts,
                "$lte": dte
            }
        },
        "properties.prototype": {
            "$eq": proto
        }
    }

    try:
        results = list(gps_collection.find(query))

        if len(results) == 0:
            return {"message": "No data found"}, status.HTTP_404_NOT_FOUND

        # compute some statistics on the data (distance, avg speed, total time) and create the arrays for the return
        time_sum_second = 0;
        distance_sum_km = 0
        points = [];
        timestamps = [];
        speeds = [];
        elevations = []

        best_segment = ({"distance": 0, "speed": 0, "elevation": 0}, -1)  # tuple (segment_info, score)
        worst_segment = ({"distance": 999, "speed": 999, "elevation": 999}, -1)

        for day in results:
            # get the index of the first and last point that is in the time range
            first_index = -1; last_index = -1
            #return {"message": f"{ day['properties']['timestamp'] } {dte} "}, status.HTTP_404_NOT_FOUND
            for i in range(len(day["properties"]["timestamp"])):
                # we use <= and >= because it's possible that some data points may be missing due to the delete route
                if day["properties"]["timestamp"][i] >= dts and first_index == -1:
                    first_index = i
                if day["properties"]["timestamp"][i] <= dte:
                    last_index = i
                    break

            # do something cause error if no point in the time range
            if first_index == -1 or last_index == -1:
                return {"message": "No data in the time range or invalid dates"}, status.HTTP_400_BAD_REQUEST

            total_time = (day["properties"]["timestamp"][last_index] - day["properties"]["timestamp"][
                first_index]).total_seconds()
            time_sum_second += total_time  # if multiple days, this will be the sum of all the days

            # compute the distance between each lat/lon in the coordinates list
            for i in range(first_index, last_index):
                point1 = day["geometry"]["coordinates"][i]
                point2 = day["geometry"]["coordinates"][i + 1]
                distance = haversine(point1[1], point1[0], point2[1], point2[0])
                distance_sum_km += distance

                # additionnaly, add the points, timestamps, speeds and elevations to the lists
                points.append(day["geometry"]["coordinates"][i])
                timestamps.append(day["properties"]["timestamp"][i])
                speeds.append(day["properties"]["speed"][i])
                elevations.append(day["properties"]["elevation"][i])

                # get the best and worse segments of 10 minutes
                coeff_distance = 0.5;
                coeff_speed = 0.3;
                coeff_elevation = 0.2
                segment_score = distance * coeff_distance + day["properties"]["speed"][i] * coeff_speed + \
                                day["properties"]["elevation"][i] * coeff_elevation
                if best_segment[1] < segment_score or best_segment[1] != -1:
                    best_segment = ({"distance": distance, "speed": day["properties"]["speed"][i],
                                     "elevation": day["properties"]["elevation"][i]}, segment_score)
                if worst_segment[1] > segment_score or worst_segment[1] == -1:
                    worst_segment = ({"distance": distance, "speed": day["properties"]["speed"][i],
                                      "elevation": day["properties"]["elevation"][i]}, segment_score)

        # compute the average speed in km/h
        avg_speed = 0 if time_sum_second == 0 else distance_sum_km / (time_sum_second / 3600)

        try:
            # get the global stats from the database
            res_stats = stats_collection.find_one({"prototype": proto})
            # check the return
            if res_stats is None:
                return {"message": "No global stats found"}, status.HTTP_404_NOT_FOUND

            return {
                "points": points,
                "timestamps": timestamps,
                "speeds": speeds,
                "elevations": elevations,
                "statistics": {
                    "distance": distance_sum_km,
                    "avg_speed": avg_speed,
                    "total_time": total_time
                },
                "global_stats": {
                    "distance": res_stats['distance'],
                    "speed": res_stats['speed'],
                    "elevation": res_stats['elevation']
                },
                "segments": {
                    "best": best_segment[0],
                    "worst": worst_segment[0]
                },
            }, status.HTTP_200_OK

        except pm.errors.PyMongoError as e:
            print(e)
            return {"message": "Database error when getting global stats"}, status.HTTP_500_INTERNAL_SERVER_ERROR
        except Exception as e:
            print(e)
            return {
                "message": "A general error occured when getting global stats"}, status.HTTP_500_INTERNAL_SERVER_ERROR

    except pm.errors.PyMongoError as e:
        print(e)
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    except Exception as e:
        print(e)
        return {"message": "A general error occured"}, status.HTTP_500_INTERNAL_SERVER_ERROR


###############
# POST ROUTES #
###############

# TODO on va recevoir les données de la dernière heures, donc 6 points.
#  On va devoir mettre à jour la dernière entrée de la base de données en ajoutant les 6 points à la fin de
#  la liste de points (aussi speed et timestamp)

@app.post("/gps", response_description="GPS data received")
async def receive_gps_data(data: GPSData):
    # Extract information from the received data
    coordinates = data.geometry['coordinates']
    timestamps = data.properties['timestamp']
    speeds = data.properties['speed']

    # Calculate the elevations for the received coordinates
    elevations = request_elevations(coordinates[:, 1], coordinates[:, 0])

    # Update the last entry in the database with the received data
    try:
        last_entry = gps_collection.find_one(sort=[("properties.timestamp", pm.DESCENDING)])
        if last_entry:
            # Append the new data to the existing lists
            last_entry['geometry']['coordinates'].extend(coordinates)
            last_entry['properties']['timestamp'].extend(timestamps)
            last_entry['properties']['speed'].extend(speeds)
            last_entry['properties']['elevation'].extend(elevations)
            # Update the entry in the database
            gps_collection.update_one({'_id': last_entry['_id']}, {"$set": last_entry})
        else:
            # Create a new entry in the database with the received data
            new_entry = {
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": coordinates.tolist()},
                "properties": {
                    "speed": speeds,
                    "timestamp": timestamps,
                    "prototype": 1,
                    "elevation": elevations
                }
            }
            gps_collection.insert_one(new_entry)

        return {"message": "Data received"}, status.HTTP_200_OK

    except pm.errors.PyMongoError as e:
        print(e)
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    except Exception as e:
        print(e)
        return {"message": "A general error occurred"}, status.HTTP_500_INTERNAL_SERVER_ERROR


# Fonction de test pour les devs

@app.get("/insert_data")
async def insert_data():
    # data for trail page
    data = create_data(datetime(2023, 4, 15, 0, 0, 0), 10, 144, 1)

    # data for live page
    date_yesterday = datetime.now() - timedelta(days=1)
    date_yesterday = date_yesterday.replace(minute=date_yesterday.minute - date_yesterday.minute % 10, second=0, microsecond=0)
    data.extend(create_data(date_yesterday, 2, 144, 1))

    try:
        gps_collection.insert_many(data)
    except pm.errors.PyMongoError as e:
        print(e)
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR

    except Exception as e:
        print(e)
        return {"message": "A general error occured"}, status.HTTP_500_INTERNAL_SERVER_ERROR

    try:
        # insert stats for prototypes
        stats_collection.insert_one({"prototype": 1, "distance": 500, "speed": 2, "elevation": 60})
        stats_collection.insert_one({"prototype": 2, "distance": 650, "speed": 3, "elevation": 70})
    except pm.errors.PyMongoError as e:
        print(e)
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    except Exception as e:
        print(e)
        return {"message": "A general error occured"}, status.HTTP_500_INTERNAL_SERVER_ERROR

    return {"message": "Data inserted"}, status.HTTP_200_OK


#################
# DELETE ROUTES #
#################
@app.delete("/gps/delete/dts={dts}&dte={dte}&proto={proto}", response_description="GPS data deleted")
async def delete_gps_data(dts: datetime, dte: datetime, proto: int):
    print(dts, dte, proto)
    dts = dts.replace(minute=dts.minute - dts.minute % 10, second=0, microsecond=0)
    dte = dte.replace(minute=dte.minute - dte.minute % 10, second=0, microsecond=0)

    # verify that the dates are valid
    if dts >= dte:
        return {"message": "Invalid dates"}, status.HTTP_400_BAD_REQUEST

    # Get the data from the database to update it locally
    query = {
        "properties.timestamp": {
            "$elemMatch": {
                "$gte": dts,
                "$lte": dte
            }
        },
        "properties.prototype": {
            "$eq": proto
        }
    }

    try:
        results = list(gps_collection.find(query))

        if len(results) == 0:
            return {"message": "No data found"}, status.HTTP_404_NOT_FOUND

        cnt_error = 0
        for day in results:
            # get the index of the first and last point that is in the time range
            first_index = -1; last_index = -1
            for i in range(len(day["properties"]["timestamp"])):
                # we use <= and >= because it's possible that some data points may be missing due to the delete route
                if day["properties"]["timestamp"][i] >= dts and first_index == -1:
                    first_index = i
                if day["properties"]["timestamp"][i] <= dte:
                    last_index = i

            if first_index == -1 or last_index == -1:
                return {"message": "Invalid dates"}, status.HTTP_400_BAD_REQUEST

            # delete the whole day
            try:
                if first_index == 0 and last_index == len(day["properties"]["timestamp"]) - 1:

                    res = gps_collection.delete_one({"_id": day["_id"]})

                    # test if the update worked
                    if res.deleted_count != 1:
                        cnt_error += 1

                else :
                    # remove the values insides the array with the indexes
                    day["geometry"]["coordinates"] = day["geometry"]["coordinates"][:first_index] + day["geometry"]["coordinates"][last_index + 1:]
                    day["properties"]["speed"] = day["properties"]["speed"][:first_index] + day["properties"]["speed"][last_index + 1:]
                    day["properties"]["timestamp"] = day["properties"]["timestamp"][:first_index] + day["properties"]["timestamp"][last_index + 1:]

                    res = gps_collection.update_one({"_id": day["_id"]}, {"$set": day})

                    # test if the update worked
                    if res.modified_count != 1:
                        cnt_error += 1

            except pm.errors.PyMongoError as e:
                logging.error(f"error mongo {e}")
                return {"message": "Database error during update"}, status.HTTP_500_INTERNAL_SERVER_ERROR
            except Exception as e:
                logging.error(f"general error {e}")
                return {"message": "An general error occured during update"}, status.HTTP_500_INTERNAL_SERVER_ERROR

        return {"message": f"Data updated with {cnt_error} errors on {len(results)}"}, status.HTTP_200_OK

    except pm.errors.PyMongoError as e:
        logging.error(f"error mongo {e}")
        return {"message": "Database error"}, status.HTTP_500_INTERNAL_SERVER_ERROR
    except Exception as e:
        logging.error(f"general error {e}")
        return {"message": "An general error occured"}, status.HTTP_500_INTERNAL_SERVER_ERROR


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0",
                port=5050,
                reload=True,
                ssl_certfile="./certs/drominger.ddns.net.pem",
                ssl_keyfile="./certs/drominger.ddns.net-key.pem",
                ssl_ca_certs="./certs/rootCA.pem",
                ssl_cert_reqs=2,
                log_level="debug")
