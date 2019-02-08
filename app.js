

'use strict';
'use global';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
var fs = require('fs'); // local file system 
var Typo = require('./public/typo.js'); // spell check library
var axios = require('axios');
var Feedback = require('./public/feedback.js'); // watson feedback storage
var DataLayer = require('./public/datalayer.js'); // watson feedback visualization by retrieving from database 
var spawn = require("child_process").spawn; // Child process to invoke python scripts

var app = express();
var typoObj = new Typo();
var feedbackObj = new Feedback();
var dataLayerObj = new DataLayer();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

var conversationData = null;

// Create the service wrapper
var conversation = new Conversation({
  // If unspecified here, the CONVERSATION_USERNAME and CONVERSATION_PASSWORD env properties will be checked
  // After that, the SDK will fall back to the bluemix-provided VCAP_SERVICES environment property
  'username': process.env.CONVERSATION_USERNAME,
  'password': process.env.CONVERSATION_PASSWORD,
  // 'version_date': '2017-05-26'
  'version_date': '2018-02-16'
});

// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {
  var workspace = process.env.WORKSPACE_ID || '<workspace-id>';
  if (!workspace || workspace === '<workspace-id>') {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the in order to get a working application.'
      }
    });
  }

  var payload = {
    workspace_id: workspace,
    context: req.body.context || {},
    input: req.body.input || {}
  };

  // Send the input to the conversation service
  conversation.message(payload, function(err, data) {
    if (err) {
      return res.status(err.code || 500).json(err);
    }
    if (data.output.text.length > 0) {
      return res.json(updateMessage(payload, data));  
    }else{
      data.output.text = "Sorry.. I didn't get your meaning";
      return res.send(data);
    }
  });
});

// Endpoint to be call from the client side for thumbs-up feedback
app.post('/api/thumbs-up', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.body) {
    var mongoResponse =   feedbackObj.insertClassified(conversationData);
    conversationData = null;
    if (mongoResponse == "inserted") {
      return res.json({"output":"thumbs up logged"});      
    }
  }else{
    return res.json({"error":"Error while logging"});
  }
});


// Endpoint to be call from the client side for thumbs-down feedback
app.post('/api/thumbs-down', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.body.input == "thumbs-down" & conversationData != null | undefined) {
    var mongoResponse = null;
    if (conversationData.intents.length > 0) {
      mongoResponse = feedbackObj.insertMisclassified(conversationData);          
    }else if (conversationData.intents.length == 0) {
      mongoResponse = feedbackObj.insertUnclassified(conversationData);                
    }    
    conversationData = null;
    if (mongoResponse == "inserted") {
      return res.json({"output":"thumbs down logged"});      
    }
  }else{
    return res.json({"error":"Error while logging"});
  }  
});

// Spell check for the user typing
app.post('/api/spell-check', function(req, res) {
  var suggestions = req.body.input == null ? "" : typoObj.getSpellingSuggestions(req.body.input);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (process.env.TYPO_CHECK === "true" && suggestions.suggestion !== false) {
    return res.json(suggestions.corrections);
  }
  else{
    return res.json({"error": "No Results"});
  }
});

// Endpoint to be call from the client side to get databases
app.post('/api/getDatabases', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.body) {
    // var process = spawn('python',["datalayer.py", "getDatabaseList"]);
    // process.stdout.on('data', function (data){
    //   return res.json(data.toString());
    // });
    var mongoResponse = dataLayerObj.getDatabaseList();
    if (mongoResponse != null | undefined) {
      return res.send(mongoResponse);      
    }
  }else{
    return res.json({"error":"Error while fetching"});
  }
});

// Endpoint to be call from the client side to get collections
app.post('/api/getCollections', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.body) {
    // var process = spawn('python',["datalayer.py", "getCollectionList", req.body.database]);
    // process.stdout.on('data', function (data){
    //   return res.json(data.toString());
    // });
    var mongoResponse = dataLayerObj.getCollectionList(req.body.database);
    if (mongoResponse != null | undefined) {
      return res.send(mongoResponse);      
    }
  }else{
    return res.json({"error":"Error while fetching"});
  }
});

// Endpoint to be call from the client side to get collection data
app.post('/api/getData', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  if (req.body) {
    // var process = spawn('python',["datalayer.py", "getData", req.body.database, req.body.collection]);
    // process.stdout.on('data', function (data){
    //   return res.send(data.toString());
    // });
    var mongoResponse = dataLayerObj.getData(req.body.database, req.body.collection);
    if (mongoResponse != null | undefined) {
      return res.send(mongoResponse);      
    }
  }else{
    return res.json({"error":"Error while fetching"});
  }
});


/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;

  // Suggestions Box at the start
  if (response.output.text[0].includes('Conversation_start_message')) {
    var startData =  response.output.text[0].split('<br>');
    for (var index = 2; index < startData.length; index++) {
      if (index == 2) {
        startData[index] = '<br>'
          .concat(startData[index])
            .concat('<br><div class="container"><div class="list-group">');
      }
      else{
        startData[index] = '<a class="list-group-item">'
          .concat(startData[index]).concat('</a>');
      }
    }
    response.output.text[0] = startData
                                .slice(1,startData.length)
                                  .concat("</div></div>").join("");
  }

  // Sap service portal
  if (response.output.text[0].includes('sap_choice_box')) {
    var startDatasap =  response.output.text[0].split('<br>');
    for (var i = 2; i < startDatasap.length; i++) {
      if (i == 2) {
        startDatasap[i] = '<br>'
          .concat(startDatasap[i])
            .concat('<br><div class="container1"><div class="list-group">');
      }
      else{
        startDatasap[i] = '<a class="list-group-item">'
          .concat(startDatasap[i]).concat('</a>');
      }
    }
    response.output.text[0] = startDatasap
                                .slice(1,startDatasap.length)
                                  .concat("</div></div>").join("");
  }

  // Creating service now ticket
  if (response.output.text[0].includes('service_now_ticket')) {
    var incident_number = "INC12345";
    var requestBody = "{\"caller_id\":\"12345Bot\",\"short_description\":\"Bot testing through REST\",\"description\":\"Bot testing through REST\"}"; 

    axios.post('https://service-now.com/api/now/table/incident',
      requestBody,
      {
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Basic ' + Buffer.from('admin'+':'+'password').toString('base64'),
              // 'Authorization': 'Basic '+btoa('admin'+':'+'admin'),
            }
      })
      .then(function (response) {
          console.log(response.data.result);
          incident_number = response.data.result.number; 
          console.log("Here you go! " + response.status + ' ' + response.statusText
              + '\n' + response.data.result.number);
      })
      .catch(function (error) {
          response.output.text = "Sorry... Not able to create service now ticket";
          console.log("===========********========= ERROR ===========********=========", error);
      });
  }

  if (!response.output) {
    response.output = {};
  } else {
    responseText = response.output.text[0]

    if(!(responseText.includes('table-bordered')) && responseText.includes('Ticket')){
      responseText = 'Sorry....I am not able to find any data regarding \
                      this Ticket number....for more details on Ticket number \
                      you can visit the following link.....\
                      <a target="_blank" href="https://www.google.com">Ticket Order</a>';
    }
  }

  // Feedback thumbs up and thumbs-down adding to text
  responseText += '<div class="container-icon">\
                      <div class="icon-wrapper">\
                        <span class="icon"><i class="fa feedback-thumbs-up fa-thumbs-up"></i></span>\
                        <span class="icon"><i class="fa feedback-thumbs-down fa-thumbs-down"></i></span>\
                        <div class="border"><span></span></div>\
                        <div class="satellite">\
                          <span></span>\
                          <span></span>\
                          <span></span>\
                          <span></span>\
                          <span></span>\
                          <span></span>\
                        </div>\
                      </div>\
                    </div>';
  
  response.output.text = responseText;
  conversationData = response;
  return response;
}

module.exports = app;
