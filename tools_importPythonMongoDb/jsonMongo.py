#!/usr/bin/python3

print('Import JSON to MongoDb')

import pymongo
import json
from pymongo import MongoClient, InsertOne

def importJson():
    client = pymongo.MongoClient('mongodb://172.18.0.3/')
    db = client['paca-search-dev']
    collection = db['products']
    
    requesting = []
    with open(r"test.json") as f:
        for jsonObj in f:
            #print(jsonObj)
            myDict = json.loads(jsonObj)
            requesting.append(InsertOne(myDict))
    
    result = collection.bulk_write(requesting)
    client.close()

importJson()



