/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rachel Day      Student ID: 100057181            Date: 01/28/2019
*
*  Online (Heroku) Link: border: https://lit-scrubland-16272.herokuapp.com/
*
********************************************************************************/ 

var dataService = require('./data-service.js');

const path = require("path");
const express = require("express");
var app = express();
app.use(express.static(__dirname + '/public'));

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
   res.sendFile(path.join(__dirname, "/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function(req,res){
   res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", function(req,res) {
   dataService.getAllEmployees().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get("/managers", function(req,res) {
   dataService.getAllManagers().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get("/departments", function(req,res) {
   dataService.getAllDepartments().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, "/views/404.html"));
});

// setup http server to listen on HTTP_PORT
dataService.initialize().then(
   app.listen(HTTP_PORT, onHttpStart)
)
.catch((err)=> { console.log("Error: " + err)
});