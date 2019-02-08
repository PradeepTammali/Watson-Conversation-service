from pymongo import MongoClient
import re
import json
import sys

class DataLayer:
    def getDatabaseList(self):
        client = MongoClient('mongodb://localhost:27017/')
        return {'databases':client.database_names()}

    def getCollectionList(self,database_name):
        client = MongoClient('mongodb://localhost:27017/')
        return {'collections':client[database_name].collection_names(include_system_collections=False)}

    def getData(self, database_name, collection_name):
        client = MongoClient('mongodb://localhost:27017/')
        collection = client[database_name][collection_name]
        cursor = collection.find({}, {'_id':False})
        response = []
        cleaner = re.compile('<.*?>')
        for document in cursor:
            document['timestamp'] = document['timestamp'].isoformat()
            document['output'] = re.sub(cleaner, '', str(document['output']))
            try:
                document['input'] = re.sub(cleaner, '', str(document['input']))
            except KeyError:
                pass
            try:
                document['output'] = str(document['output']).replace("'","`")
            except KeyError:
                pass
            try:
                document['input'] = str(document['input']).replace("'","`")     
            except KeyError:
                pass
            document['intent'] = str(document['intent'])
            document['entity'] = str(document['entity'])
            response.append(document)
        return str(response).replace('"',"'").replace("'", '"').replace("`","\'")

if __name__ == '__main__':
    try:
        if len(sys.argv) > 1:
            if sys.argv[1] == 'getDatabaseList':
                print(DataLayer().getDatabaseList())        
            elif sys.argv[1] == 'getCollectionList':
                print(DataLayer().getCollectionList(sys.argv[2]))      
            elif sys.argv[1] == 'getData':
                print(DataLayer().getData(sys.argv[2], sys.argv[3]))    
    except Exception as e:
        print("Error: error while invoking",e)