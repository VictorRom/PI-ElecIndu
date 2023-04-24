from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from pydantic.fields import *
from datetime import datetime, timedelta
import pymongo as pm


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
    return {"message": "Hello World"}

@app.get("/live")
async def live_page():
    # TODO get the last 6 * 24 points from the database and return them (1 point every 10 minutes for the last 24 hours or for the last day)
    # return {"a": "1"}
    query = {"properties.timestamp": {"$gte": datetime.now() - timedelta(days=1)}}
    results = collection.find(query)

    return {"points": list(results)}

@app.get("/trail/dts={dts}&dte={dte}") # on passe les data en json sans passer par le body ?
async def trail_page(dts: datetime, dte: datetime):
    # TODO get the points between dts and dte from the database and return them
    # verify that the dates are valid (dts < dte)
    query = {"properties.timestamp": {"$gte": dts, "$lte": dte}}
    results = collection.find(query)

    # TODO compute some statistics on the data (distance, avg speed, total time) and return them 

    return {"points": list(results), "statistics": {"distance": 0, "avg_speed": 0, "total_time": 0}}

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

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8080)#, ssl_keyfile="key.pem", ssl_certfile="cert.pem")

