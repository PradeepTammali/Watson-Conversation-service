/* thumbs up and thumbs down feed back is storing to mongodb collections */

var mongoose = require("mongoose");
mongoose.connect("mongodb://"+process.env.IP_ADDRESSS+":27017/"+process.env.DB_NAME);

var db = mongoose.connection;
var Schema = mongoose.Schema;

var collectionSchema = new Schema({
    timestamp: {type: Date, default: Date.now},
    input: String,
    output: String,
    entity: String,
    intent: String  
}, {
    versionKey: false 
});

var Classified = mongoose.model("Classified", collectionSchema);
var Misclassified = mongoose.model("Misclassified", collectionSchema);
var Unclassified = mongoose.model("Unclassified", collectionSchema);

db.on("error", console.error.bind(console, "connection error"));
db.once("open", function(callback) {
    console.log("Connection succeeded.");
});

var method = Feedback.prototype;

function Feedback(){
}

method.insertClassified = function(conversationData){
    var data = null;
    var input_text = null;
    var output_text = null;
    var entities = null;
    var intents = null;

    if (conversationData != null) {
        data = conversationData;
        if (data.entities.length > 0) {    
            for (var i = 0; i < data.entities.length; i++) {
                entities = data.entities[i].entity+':'+data.entities[i].value+',';
            }
            entities = entities.replace(/,$/,"");
        }
        if (data.intents.length > 0) {
            for (var j = 0; j < data.intents.length; j++) {
                intents = data.intents[j].intent+',';
            }
            intents =  intents.replace(/,$/,"");
        }
        try {
            input_text = data.input.text;
            input_text = input_text.replace(/<.*?>/g,"");
        } catch (error) {
            input_text = null;
        }
        try {
            output_text = data.output.text.split('<div class="container-icon">')[0];
            output_text = output_text.replace(/<.*?>/g,"");
        } catch (error) {
            output_text = null;
        }
        
        var ClassifiedData = Classified({
            input: input_text,
            output: output_text,
            entity: entities,
            intent: intents
        });

        ClassifiedData.save(function(error) {
            console.log("Classified data has been saved!");
            if (error) {
                console.error(error);
            }
        });
        return "inserted";
    }
};

method.insertMisclassified = function(conversationData){
    var data = null;
    var input_text = null;
    var output_text = null;
    var entities = null;
    var intents = null;

    if (conversationData != null) {
        data = conversationData;
        if (data.entities.length > 0) {    
            for (var i = 0; i < data.entities.length; i++) {
                entities = data.entities[i].entity+':'+data.entities[i].value+',';
            }
            entities = entities.replace(/,$/,"");
        }
        if (data.intents.length > 0) {
            for (var j = 0; j < data.intents.length; j++) {
                intents = data.intents[j].intent+',';
            }
            intents =  intents.replace(/,$/,"");
        }
        try {
            input_text = data.input.text;
            input_text = input_text.replace(/<.*?>/g,"");
        } catch (error) {
            input_text = null;
        }
        try {
            output_text = data.output.text.split('<div class="container-icon">')[0];
            output_text = output_text.replace(/<.*?>/g,"");
        } catch (error) {
            output_text = null;
        }

        var MisclassifiedData = Misclassified({
            input: input_text,
            output: output_text,
            entity: entities,
            intent: intents
        });

        MisclassifiedData.save(function(error) {
            console.log("Misclassified data has been saved!");
            if (error) {
                console.error(error);
            }
        });
        return "inserted";
    }
};

method.insertUnclassified = function(conversationData){
    var data = null;
    var input_text = null;
    var output_text = null;
    var entities = null;
    var intents = null;

    if (conversationData != null) {
        data = conversationData;
        if (data.entities.length > 0) {    
            for (var i = 0; i < data.entities.length; i++) {
                entities = data.entities[i].entity+':'+data.entities[i].value+',';
            }
            entities = entities.replace(/,$/,"");
        }
        try {
            input_text = data.input.text;
            input_text = input_text.replace(/<.*?>/g,"");
        } catch (error) {
            input_text = null;
        }
        try {
            output_text = data.output.text.split('<div class="container-icon">')[0];
            output_text = output_text.replace(/<.*?>/g,"");
        } catch (error) {
            output_text = null;
        }

        var UnclassifiedData = Unclassified({
            input: input_text,
            output: output_text,
            entity: entities,
            intent: intents
        });

        UnclassifiedData.save(function(error) {
            console.log("Unclassified data has been saved!");
            if (error) {
                console.error(error);
            }
        });
        return "inserted";
    }
};

module.exports = Feedback;