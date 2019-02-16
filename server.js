/*********************************************************************************
*  WEB322 – Assignment 03
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
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require('fs');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

var HTTP_PORT = process.env.PORT || 8080;

const storage = multer.diskStorage({
   destination: "/public/images/uploaded",
   filename : function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
   }
});

var upload = multer({ storage: storage });

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// GET METHODS

app.get("/", function(req,res){
   res.sendFile(path.join(__dirname, "/views/home.html"));
});

app.get("/about", function(req,res){
   res.sendFile(path.join(__dirname, "/views/about.html"));
});

app.get("/employees", function(req,res) {
   if (req.query.status) {
      dataService.getEmployeesByStatus(req.query.department).then( function(data) {
         return res.json(data);
      }).catch((err) => { "Error: " + err });      
   }
   else if (req.query.department) {
      dataService.getEmployeesByDepartment(req.query.status).then( function(data) {
         return res.json(data);
      }).catch((err) => { "Error: " + err });      
   }
   else if (req.query.manager) {
      dataService.getEmployeesByManager(req.query.manager).then( function(data) {
         return res.json(data);
      }).catch((err) => { "Error: " + err });      
   }
   else {
      dataService.getAllEmployees().then( function(data) {
         return res.json(data);
      }).catch((err) => { "Error: " + err });
   }
});

app.get("/managers", function(req,res) {
   dataService.getAllManagers().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get("/images", function (req,res) {
    fs.readdir("./public/images/uploaded", function(err, data) {
        res.json({images:data}); 
    });
});

app.get("/employees/add", function(req,res) {
   res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
});

app.get("/images/add", function(req,res) {
   res.sendFile(path.join(__dirname, "/views/addImage.html"));
});

app.get("/departments", function(req,res) {
   dataService.getAllDepartments().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get('*', function(req, res){
  res.sendFile(path.join(__dirname, "/views/404.html"));
});

// POST METHODS

app.post("/images/add", upload.single("photo"), (req, res) => {
   res.redirect("/images");
})

app.post("/employees/add", (req, res) => {
   dataService.addEmployee(req.body).then ( function() {
      res.redirect("/employees");
   }).catch((err) => { "Error: " + err});
});

// setup http server to listen on HTTP_PORT
dataService.initialize().then(
   app.listen(HTTP_PORT, onHttpStart)
)
.catch((err)=> { console.log("Error: " + err)
});