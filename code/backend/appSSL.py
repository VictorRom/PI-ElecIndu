from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
import ssl

app = FastAPI()

class GPSData(BaseModel):
    lat: float
    lon: float
    speed: float

@app.post("/gps")
async def receive_gps_data(data: GPSData):
    # TODO process the data, convert to GeoJSON, and store in MongoDB
    return {"message": "Data received"}

if __name__ == "__main__":
    context = ssl.create_default_context(purpose=ssl.Purpose.CLIENT_AUTH)
    context.load_cert_chain("cert.pem", "key.pem")
    context.options |= ssl.OP_CIPHER_SERVER_PREFERENCE
    context.set_ciphers("ECDHE-ECDSA-AES256-GCM-SHA384")
    context.options |= ssl.OP_NO_TLSv1 | ssl.OP_NO_TLSv1_1 | ssl.OP_NO_COMPRESSION
    context.verify_mode = ssl.CERT_REQUIRED
    context.load_verify_locations(cafile="ca.pem")
    uvicorn.run("main:app", host="exemple.host.name.ch", port=443, ssl_certfile="cert.pem", ssl_keyfile="key.pem", ssl_version=ssl.PROTOCOL_TLSv1_2, ssl_context=context, access_log=False)

