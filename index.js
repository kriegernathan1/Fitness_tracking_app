'use strict'

// A server that uses a database. 

// express provides basic server functions
const express = require("express");

// our database operations
const dbo = require('./databaseOps');

// object that provides interface for express
const app = express();

// use this instead of the older body-parser
app.use(express.json());

// make all the files in 'public' available on the Web
app.use(express.static('public'))

// when there is nothing following the slash in the url, return the main page of the app.
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/public/index.html");
});

// This is where the server recieves and responds to POST requests
app.post('/store', function(request, response, next) {
  console.log("Server recieved a post request at", request.url);
  let data = request.body;

  //add data to DB
  if(request.body.scalar < 0)
  {
    dbo.addRowFutureActivities(data)
  }
  else
  {
    dbo.addRowPastActivities(data);   
  }

  response.send(data)
});

//reminder data handling 
app.get("/reminder", (request, response, next) => {
  console.log("Server recieved a post request at", request.url);

  //print DB for debug
  // dbo.printDB();

  //Get data from database 
  dbo.getPlannedActivites()
    // .then(data => console.log(data))
    .then(data => response.send(JSON.stringify(data)))
    .catch(error => console.log("error when retreiving planned activites: ", error))

});

//handle query strings
app.get("/week", (request, response, next) => {

  if(Object.keys(request.query).length === 0) 
  {
    console.log("The query was empty so not much to do");
    response.sendStatus(400);
  }
  
  if(!request.query.hasOwnProperty('activity'))
    request.query.activity = "";

  dbo.getPastWeekActivities(request.query.date, request.query.activity)
    .then(data => response.send(JSON.stringify(data)))
    .catch(error => console.log("An error occurred getting activites for chart: ", error))
  
});

app.get('/delete', (request, response, next) => {
  if(Object.keys(request.query).length === 0) 
  {
        console.log("/delete: No Row id was given to delete so returning with error");
        response.sendStatus(400);
  }
  else 
  {
    dbo.deleteByRowID(request.query.rowID)
      .then(() => response.sendStatus(200));     
  }

})



// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});


// call the async test function for the database
// this is an example showing how the database is used
// you will eventually delete this call.
// dbo.testDB().catch(
//   function (error) {
//     console.log("error:",error);}
// );


