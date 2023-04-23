from fastapi import FastAPI
import uvicorn
from pydantic import BaseModel
from pydantic.fields import *
from datetime import datetime
import pymongo as pm

class GPSData(BaseModel):
    lat: float = Field(..., gt=-90, lt=90)
    lon: float = Field(..., gt=-180, lt=180)
    speed: float = Field(..., gt=0)
    dt: datetime = Field(...) # quand on ajoute des données dans la db, on ajoute le timestamp

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
    return

@app.get("/trail/dts={dts}&dte={dte}") # dts = date time start, dte = date time end
async def trail_page(dts: datetime, dte: datetime):
    # TODO get the points between dts and dte from the database and return them
    # TODO compute some statistics on the data (distance, avg speed, total time) and return them 
    return

@app.get("/sessions") # A VOIR SI ON FAIT TJR ÇA ?
async def sessions_page():
    # TODO get the points from the database grouped by session (day ?) and return them
    return


###############
# POST ROUTES #
###############
@app.post("/gps", response_description="GPS data received")
async def receive_gps_data(data: GPSData):
    # TODO process the data, convert to GeoJSON, and store in MongoDB
    return {"message": "Data received"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, ssl_keyfile="key.pem", ssl_certfile="cert.pem")