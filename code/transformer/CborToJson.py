
# pip install cbor2 : https://pypi.org/project/cbor2/
import cbor2 as cb2

def getJSON(rawdata):
    data = cb2.loads(rawdata)

    coord = data['coordinates']
    # retrieve other infos

    return {"type": "Feature",
        "properties": {},
        "geometry": {
            "coordinates" : coord,
            "type": "Point",
        }
    }