import cbor2 as cb2
import CborToJson

# transform a cbor file to geojson

dict = {"coordinates": [
          8.134863519050327,
          47.02492394298815
        ],
        "serial" : 123,
        "other" : "test"}

rawdata = cb2.dumps(dict)

assert(CborToJson.getJSON(rawdata) == {'type': 'Feature', 'properties': {}, 'geometry': {'coordinates': [8.134863519050327, 47.02492394298815], 'type': 'Point'}})

