const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
const feathers = require('@feathersjs/feathers');
const moment = require('moment');
var Data = require('./ideasData.json');
// import Data from './ideasData.json';
var fs = require('fs');

// Idea Service
class IdeaService {
  constructor() {  
    this.ideas = Data;    
  }

  async find() {
    return this.ideas;
  }

  async create(data) {
    const idea = {
      id: this.ideas.length,
      text: data.text,
      tech: data.tech,
      viewer: data.viewer
    }

    idea.time = moment().utcOffset("+05:30").format('h:mm:ss a');

    this.ideas.push(idea);
    writeJSONFile(this.ideas);
    return idea;
  }
}

function writeJSONFile(data){
  var jsonContent = JSON.stringify(data);
    console.log(jsonContent);
    fs.writeFile("ideasData.json", jsonContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
   
      console.log("JSON file has been saved.");
  });
}



const app = express(feathers());

// Parse JSON
app.use(express.json());

// Config Socket.io realtime APIs
app.configure(socketio());

// Enable REST services
app.configure(express.rest());

// Landing service
// app.use('/', "Welcome to FeatherJS Example");

// Register services
app.use('/ideas', new IdeaService());

// New connections connect to stream channel
app.on('connection', conn => app.channel('stream').join(conn));

// Publish events to stream
app.publish(data => app.channel('stream'));

const PORT = process.env.PORT || 3030;

app.listen(PORT).on('listening', () => console.log(`Realtime server running on ${PORT}`));
