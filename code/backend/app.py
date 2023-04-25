from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from pydantic.fields import *
from datetime import datetime, timedelta
import pymongo as pm
import math


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

    return distance



mongodb_connection_string = 'mongodb://localhost:27017'
client = pm.MongoClient(mongodb_connection_string)
db = client['elecindu']
collection = db['gps']

# class GPSData(BaseModel):
#     lat: float
#     lon: float
#     speed: float

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

@app.get("/live")
async def live_page():
    date = datetime.now() - timedelta(days=1) # get the date of the last 24 hours from now

    query = {"properties.timestamp": {
        "$elemMatch": {
                "$gte": date,
            }
        }
    }

    results = list(collection.find(query))

    # convert the objectid to a string
    for res in results:
        res["_id"] = str(res["_id"])

    # print(results)
    return {"points": results}

# on passe les data en json sans passer par le body ?
@app.get("/trail/dts={dts}&dte={dte}") 
async def trail_page(dts: datetime, dte: datetime):
    # TODO get the points between dts and dte from the database and return them
    
    # verify that the dates are valid 
    if dts > dte:
        return {"message": "Invalid dates"}

    query = {"properties.timestamp": {
        "$elemMatch": {
                "$gte": dts,
                "$lte": dte
            }
        }
    }

    results = list(collection.find(query))

    # convert the objectid to a string
    for res in results:
        res["_id"] = str(res["_id"])

    # TODO compute some statistics on the data (distance, avg speed, total time) and return them 
    total_time = 0
    distance_sum = 0
    for point in results:
        begin = point["properties"]["timestamp"][0]
        end = point["properties"]["timestamp"][-1]
        total_time += (end - begin).total_seconds()
        
        # compute the distance between each lat/lon in the coordinates list
        for i in range(len(point["geometry"]["coordinates"])-1):
            distance_sum += haversine(point["geometry"]["coordinates"][i][0], point["geometry"]["coordinates"][i][1], point["geometry"]["coordinates"][i+1][0], point["geometry"]["coordinates"][i+1][1])

    # compute the average speed
    # total_time = total_time
    avg_speed = distance_sum / total_time

    return {"points": results, "statistics": {"distance": distance_sum, "avg_speed": avg_speed, "total_time": total_time}}

@app.get("/sessions") # A VOIR SI ON FAIT TJR ÇA ?
async def sessions_page():
    # TODO get the points from the database grouped by session (day ?) and return them
    return


###############
# POST ROUTES #
###############
@app.post("/gps", response_description="GPS data received")
async def receive_gps_data(data: bytes):
    # TODO process the data, convert to GeoJSON, and store in MongoDB
    tls_key = "key.pem"
    # decode the data using the tls key
    # transfer the data to the transformer
    return {"message": "Data received"}

@app.get("/insert_date")
async def insert_date():

    # create a date for the 25.04.2023 at 16:00
    date = datetime(2023, 4, 25, 16, 0, 0)
    date2 = date + timedelta(hours=1)
    date3 = date + timedelta(hours=2)

    collection.insert_many(
        [
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701]]}, "properties": {"sensor1": ["value0", "value1","value2","value3","value4","value5"], "sensor2": ["val0", "val1", "val2", "val3", "val4", "val5"], "speed": [0, 1, 2, 3, 4, 5], "timestamp": [date, date + timedelta(minutes=10), date + timedelta(minutes=20), date + timedelta(minutes=30), date + timedelta(minutes=40), date + timedelta(minutes=50)]}},
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701]]}, "properties": {"sensor1": ["value0", "value1","value2","value3","value4","value5"], "sensor2": ["val0", "val1", "val2", "val3", "val4", "val5"], "speed": [50, 51, 52, 53, 54, 55], "timestamp": [date2, date2 + timedelta(minutes=10), date2 + timedelta(minutes=20), date2 + timedelta(minutes=30), date2 + timedelta(minutes=40), date2 + timedelta(minutes=50)]}},
        {"type": "Feature", "geometry": {"type": "Point", "coordinates": [[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701],[6.58968, 45.39701]]}, "properties": {"sensor1": ["value0", "value1","value2","value3","value4","value5"], "sensor2": ["val0", "val1", "val2", "val3", "val4", "val5"], "speed": [100, 100, 200, 300, 400, 500], "timestamp": [date3, date3 + timedelta(minutes=10), date3 + timedelta(minutes=20), date3 + timedelta(minutes=30), date3 + timedelta(minutes=40), date3 + timedelta(minutes=50)]}}
        ]
    )

    return {"message": "Data inserted"}


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8080, reload=True)#, ssl_keyfile="key.pem", ssl_certfile="cert.pem")

