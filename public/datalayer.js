
var deasync = require('deasync');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

var method = DataLayer.prototype;
function DataLayer(){
}

method.getDatabaseList = function(){  
    var response = null;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.db('test').admin().listDatabases().then(function(result){
            response = result.databases;
          }
        );
      });   
    deasync.loopWhile(function(){return response === null;});
    return JSON.stringify({"databases":response});
};

method.getCollectionList = function(databaseName){
    var response = null;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databaseName);
        dbo.listCollections().toArray(function(err, collections){
            response = collections;
      });
    });
    deasync.loopWhile(function(){return response === null;});
    return JSON.stringify({"collections":response});
};
 
method.getData = function(databaseName, collectionName){
    var response = null;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db(databaseName);
        dbo.collection(collectionName).find({}).toArray(function(err, result) {
          if (err) throw err;
          response = result;
          db.close();
        });
      });
    deasync.loopWhile(function(){return response === null;});
    return JSON.stringify({"data":response});
};

module.exports = DataLayer;