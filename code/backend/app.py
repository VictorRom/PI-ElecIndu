from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from pydantic.fields import *
from datetime import datetime, timedelta
import pymongo as pm
import math
from random import random
import requests

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

    return distance # in km

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

mongodb_connection_string = 'mongodb://root:example@localhost:27017'
client = pm.MongoClient(mongodb_connection_string)
db = client['elecindu']
gps_collection = db['gps']
stats_collection = db['stats']

class GPSData(BaseModel):
    type: str
    geometry: dict
    properties: dict

app = FastAPI()

##############
# GET ROUTES #
##############
@app.get("/")
async def root():
    print("Hello World")
    return {"message": "Hello World"}

# Route live retourne ça :
# {
    # "points": [[lat, lon], [lat, lon], ...]
    # "timestamps": [...],
    # "speeds": [...],
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

    results = list(gps_collection.find(query))

    points = []; timestamps = []; speeds = []
    for day in results:
        # get the index of the first and last point that is in the time range
        first_index = -1
        last_index = -1
        for i in range(len(day["properties"]["timestamp"])):
            if day["properties"]["timestamp"][i] == dts:
                first_index = i
            if day["properties"]["timestamp"][i] == dte:
                last_index = i
                break

        # do something cause error if no point in the time range
        if first_index == -1 or last_index == -1:
            pass

        for i in range(first_index, last_index):
            # add the points, timestamps, speeds and elevations to the lists
            points.append(day["geometry"]["coordinates"][i])
            timestamps.append(day["properties"]["timestamp"][i])
            speeds.append(day["properties"]["speed"][i])

    # get the number of minutes since the last point was added to the database
    minutes_since_last_point = (datetime.now() - timestamps[-1]).total_seconds() / 60

    return {
        "points": points,
        "timestamps": timestamps,
        "speeds": speeds,
        "device_last_update": minutes_since_last_point
    }

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
    # verify that the dates are valid
    if dts > dte:
        return {"message": "Invalid dates"}

    # round the dates to the nearest 10 minutes
    dts = dts.replace(minute=dts.minute - dts.minute % 10, second=0, microsecond=0)
    dte = dte.replace(minute=dte.minute - dte.minute % 10, second=0, microsecond=0)

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

    results = list(gps_collection.find(query))

    # compute some statistics on the data (distance, avg speed, total time) and create the arrays for the return
    time_sum_second = 0; distance_sum_km = 0
    points = []; timestamps = []; speeds = []; elevations = []

    best_segment = ({"distance": 0, "speed": 0,"elevation": 0}, -1) # tuple (segment_info, score)
    worst_segment = ({"distance": 999, "speed": 999,"elevation": 999}, -1)
    total_time = 0
    for day in results:
        # get the index of the first and last point that is in the time range
        first_index = -1
        last_index = -1
        for i in range(len(day["properties"]["timestamp"])): # >= just to be sure but == should be enough
            if day["properties"]["timestamp"][i] == dts:
                first_index = i
            if day["properties"]["timestamp"][i] == dte:
                last_index = i
                break

        # do something cause error if no point in the time range
        if first_index == -1 or last_index == -1:
            return {"message": "No data in the time range or invalid dates"}

        total_time = (day["properties"]["timestamp"][last_index] - day["properties"]["timestamp"][first_index]).total_seconds()
        time_sum_second += total_time # if multiple days, this will be the sum of all the days

        # compute the distance between each lat/lon in the coordinates list
        for i in range(first_index, last_index):
            point1 = day["geometry"]["coordinates"][i]
            point2 = day["geometry"]["coordinates"][i+1]
            distance = haversine(point1[1], point1[0], point2[1], point2[0])
            distance_sum_km += distance

            # additionnaly, add the points, timestamps, speeds and elevations to the lists
            points.append(day["geometry"]["coordinates"][i])
            timestamps.append(day["properties"]["timestamp"][i])
            speeds.append(day["properties"]["speed"][i])
            elevations.append(day["properties"]["elevation"][i])

            # get the best and worse segments of 10 minutes
            coeff_distance = 0.5; coeff_speed = 0.3; coeff_elevation = 0.2
            segment_score = distance * coeff_distance + day["properties"]["speed"][i] * coeff_speed + day["properties"]["elevation"][i] * coeff_elevation
            if best_segment[1] < segment_score or best_segment[1] != -1:
                best_segment = ({ "distance": distance, "speed": day["properties"]["speed"][i], "elevation": day["properties"]["elevation"][i] }, segment_score)
            if worst_segment[1] > segment_score or worst_segment[1] == -1:
                worst_segment = ({ "distance": distance, "speed": day["properties"]["speed"][i], "elevation": day["properties"]["elevation"][i] }, segment_score)

    # compute the average speed in km/h
    avg_speed = 0 if time_sum_second == 0 else distance_sum_km / (time_sum_second / 3600) 

    # get the global stats from the database
    res_stats = stats_collection.find_one({"prototype": proto})
    # check the return
    if res_stats is None:
        # error do something
        pass

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
    }


###############
# POST ROUTES #
###############

# TODO on va recevoir les données de la dernière heures, donc 6 points. On va devoir mettre à jour la dernière entrée de la base de données en ajoutant les 6 points à la fin de la liste de points (aussi speed et timestamp)

@app.post("/gps", response_description="GPS data received")
async def receive_gps_data(data: bytes):
    # TODO process the data, convert to GeoJSON, and store in MongoDB
    tls_key = "key.pem"
    # decode the data using the tls key

    # process information from data : request_elevation()

    # update global stats in the database

    return {"message": "Data received"}


# Fonction de test pour les devs

@app.get("/insert_data")
async def insert_data():
    data = []
    for i in range(10):
        date = datetime(2023, 4, 15 + i, 0, 0, 0)
        coordinates = [[6.0 + random() / 2, 45 + random() / 2] for i in range(144)]
        timestamps = [date + timedelta(minutes=10 * i) for i in range(144)]
        speeds = [random() * 100 for i in range(144)]
        elevations = [random() * 1000 for i in range(144)]
        data.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": coordinates}, "properties": {"speed": speeds, "timestamp": timestamps, "prototype": 1, "elevation": elevations}})

    date_today = datetime.now()
    date_today = date_today.replace(minute=date_today.minute - date_today.minute % 10, second=0, microsecond=0)
    coordinates = [[6.0 + random() / 2, 45 + random() / 2] for i in range(144)]
    timestamps = [date_today + timedelta(minutes=10 * i) for i in range(144)]
    speeds = [random() * 100 for i in range(144)]
    elevations = [random() * 1000 for i in range(144)]
    data.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": coordinates}, "properties": {"speed": speeds, "timestamp": timestamps, "prototype": 1, "elevation": elevations}})

    date_yesterday = datetime.now() - timedelta(days=1)
    date_yesterday = date_yesterday.replace(minute=date_yesterday.minute - date_yesterday.minute % 10, second=0, microsecond=0)
    coordinates = [[6.0 + random() / 2, 45 + random() / 2] for i in range(144)]
    timestamps = [date_yesterday + timedelta(minutes=10 * i) for i in range(144)]
    speeds = [random() * 100 for i in range(144)]
    elevations = [random() * 1000 for i in range(144)]
    data.append({"type": "Feature", "geometry": {"type": "Point", "coordinates": coordinates}, "properties": {"speed": speeds, "timestamp": timestamps, "prototype": 1, "elevation": elevations}})

    gps_collection.insert_many(data)

    # insert stats for prototypes
    stats_collection.insert_one({"prototype": 1, "distance": 500, "speed": 2, "elevation": 60})
    stats_collection.insert_one({"prototype": 2, "distance": 650, "speed": 3, "elevation": 70})

    return {"message": "Data inserted"}


#################
# DELETE ROUTES #
#################
@app.delete("/gps/delete/dts={dts}&dte={dte}&proto={proto}", response_description="GPS data deleted")
async def delete_gps_data(dts: datetime, dte: datetime, proto: int):

    dts = dts.replace(minute=dts.minute - dts.minute % 10, second=0, microsecond=0)
    dte = dte.replace(minute=dte.minute - dte.minute % 10, second=0, microsecond=0)

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

    results = list(gps_collection.find(query))
    cnt_error = 0

    for day in results:
        # get the index of the first and last point that is in the time range
        first_index = -1
        last_index = -1
        for i in range(len(day["properties"]["timestamp"])): # >= just to be sure but == should be enough
            if day["properties"]["timestamp"][i] == dts:
                first_index = i
            if day["properties"]["timestamp"][i] == dte:
                last_index = i
                break
        
        # remove the values insides the array with the indexes
        day["geometry"]["coordinates"] = day["geometry"]["coordinates"][:first_index] + day["geometry"]["coordinates"][last_index + 1:]
        day["properties"]["speed"] = day["properties"]["speed"][:first_index] + day["properties"]["speed"][last_index + 1:]
        day["properties"]["timestamp"] = day["properties"]["timestamp"][:first_index] + day["properties"]["timestamp"][last_index + 1:]

        # update the data in the database
        res = gps_collection.update_one({"_id": day["_id"]}, {"$set": day})

        # test if the update worked
        if res.modified_count != 1:
            cnt_error += 1

    return {"message": f"Data updated with {cnt_error} errors on {len(results)}"}

if __name__ == "__main__":
    origins = ['http://localhost:3000']
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    uvicorn.run("app:app", host="0.0.0.0", port=5050, reload=True)#, ssl_keyfile="key.pem", ssl_certfile="cert.pem")

