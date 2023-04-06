#send to database

import CborToJson
import cbor2 as cb2
import pymongo as pm

dict = {"coordinates": [
          8.134863519050327,
          47.02492394298815
        ],
        "serial" : 123,
        "other" : "test"}

rawdata = cb2.dumps(dict)

#connect to database
client = pm.MongoClient("mongodb://root:example@localhost:27017")

#select database
db = client["test"]["test"].insert_one(CborToJson.getJSON(rawdata))
