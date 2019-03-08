/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rachel Day      Student ID: 100057181            Date: 01/28/2019
*
*  Online (Heroku) Link: border: https://salty-depths-49587.herokuapp.com/
*
********************************************************************************/ 

var dataService = require('./data-service.js');

const path = require("path");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const fs = require('fs');

var app = express();

var HTTP_PORT = process.env.PORT || 8080;


// ******** MULTER **************************************************

const storage = multer.diskStorage({
   destination: "./public/images/uploaded",
   filename : function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
   }
});

var upload = multer({ storage: storage });


// ******** SET UP **************************************************

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
   let route = req.baseUrl + req.path;
   app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/,"");
   next();
});

app.engine('.hbs', exphbs({   extname: '.hbs', 
                              defaultLayout: 'main', 
                              helpers: {
                                          navLink: function(url, options){
                                                   return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                                          '><a href="' + url + '">' + options.fn(this) + '</a></li>'; 
                                          },
                                          equal: function (lvalue, rvalue, options) {
                                             if (arguments.length < 3)
                                                throw new Error("Handlebars Helper equal needs 2 parameters");
                                             if (lvalue != rvalue) {
                                                return options.inverse(this);
                                             } else {
                                                return options.fn(this);
                                             }
                                          }
                              } 
                           })
);

app.set('view engine', '.hbs');


// ******** Listening function **************************************************

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}


// ******** GET METHODS **************************************************

app.get("/", function(req,res){
   res.render('home');
});

app.get("/about", function(req,res){
   res.render('about');
});

app.get("/employees/add", function(req,res) {
   res.render('addEmployee');
});

app.get("/images/add", function(req,res) {
   res.render('addImage');
});

// 404
app.get('*', function(req, res){
   res.render('404');
 });


// ******** Employee  **************************************************

app.get('/employee/:employeeNum', (req, res) => {
   dataService.getEmployeesByNum(req.params.employeeNum)
   .then((data) => {
      res.json(data);
   })
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
         res.render("employees", {employees: data});
      }).catch((err) => { "Error: " + err });
   }
});

// ******** Images ********************************************** //

app.get("/images", function (req,res) {
    fs.readdir("./public/images/uploaded", function(err, data) {
      res.render("images", {images:data});
    });
});


// ******** Departments **************************************************

app.get("/departments", function(req,res) {
   dataService.getAllDepartments().then( function(data) {
      res.render("departments", {departments: data});
   }).catch((err) => { "Error: " + err });
});


// ******** POST METHODS **************************************************

app.post("/images/add", upload.single("imageFile"), (req, res) => {
   res.redirect("/images");
});

app.post("/employees/add", (req, res) => {
   dataService.addEmployee(req.body).then (
      res.redirect("/employees")
   ).catch((err) => { "Error: " + err});
});

app.post("/employee/update", (req, res) => {
   data_service.updateEmployee(req.body).then((data) => {
       console.log(req.body);
       res.redirect("/employees");
   }).catch((err) => {
       console.log(err);
   })
});

// ******** SERVER LISTENS **************************************************

dataService.initialize().then(
   app.listen(HTTP_PORT, onHttpStart)
)
.catch((err)=> { console.log("Error: " + err)
});