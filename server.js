/*********************************************************************************
*  WEB322 – Assignment 04
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

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('.hbs', exphbs({ 
   extname: '.hbs',
   defaultLayout: 'main',
   helpers: {
      navLink: function(url, options){return '<li' + ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
      '><a href="' + url + '">' + options.fn(this) + '</a></li>';
      },
      equal: function (lvalue, rvalue, options) {
         if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
         if (lvalue != rvalue) {
            return options.inverse(this);
         } 
         else {
            return options.fn(this); 
         }
      }
   }
}));

app.set('view engine', '.hbs');

var HTTP_PORT = process.env.PORT || 8080;

const storage = multer.diskStorage({
   destination: "./public/images/uploaded",
   filename : function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
   }
});

var upload = multer({ storage: storage });

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// ******** GET METHODS **************************************************

app.get("/", function(req,res) {
   res.render("home");
});

app.get("/about", function(req,res){
   res.render("about");
});

//  EMPLOYEE

app.get("/employee/:empNum", (req, res) => {

   // initialize an empty object to store the values
   let viewData = {};
   dataService.getEmployeeByNum(req.params.empNum)
       .then((data) => {
           viewData.data = data;
       }).catch(() => {
           viewData.data = null;
       }).then(dataService.getDepartments)
       .then((data) => {
           viewData.departments = data;
           for (let i = 0; i < viewData.departments.length; i++) {
               if (viewData.departments[i].departmentId == viewData.data.department) {
                   viewData.departments[i].selected = true;
               }
           }
       }).catch(() => {
           viewData.departments = [];
       }).then(() => {
           if (viewData.data == null) {
               res.status(404).send("Employee Not Found");
           } else {
               res.render("employee", { viewData: viewData });      
           }
       });
});

app.get("/employees", function(req,res) {
   if (req.query.status) {
      dataService.getEmployeesByStatus(req.query.status).then( function(data) {
         res.render("employees", {employees: data});
      }).catch(() => { res.render({ message: "no results" }); });      
   }
   else if (req.query.department) {
      dataService.getEmployeesByDepartment(req.query.department).then( function(data) {
         res.render("employees", {employees: data});
      }).catch(() => { res.render({ message: "no results" }); });      
   }
   else if (req.query.manager) {
      dataService.getEmployeesByManager(req.query.manager).then( function(data) {
         res.render("employees", {employees: data});
      }).catch(() => { res.render({ message: "no results" }); });      
   }
   else {
      dataService.getAllEmployees().then( function(data) {
         return res.render("employees", {employees: data});
      }).catch(() => { res.render({ message: "no results" }); });
   }
});

app.get("/employees/add", (req, res) => {
    dataService.getAllDepartments()
    .then((data)=> {
        res.render("addEmployee", {departments: data});
    })
    .catch(()=> {
        res.render("addEmployee", {departments: []}) 
    });
});

app.get("/managers", function(req,res) {
   dataService.getAllManagers().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get("/employee/delete/:empNum", (req, res) => {
   dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
       res.redirect("/employees");
   }).catch((err) => {
       res.status(500).send("Unable to Remove Employee / Employee not found");
   });
});

// ******** IMAGES ********************************************** //
app.get("/images", function (req,res) {
    fs.readdir("./public/images/uploaded", function(err, data) {
        res.render('images', {images:data});
    });
});

app.get("/images/add", function(req,res) {
   res.render("addImage");
});

// DEPARTMENTS
app.get("/department/:departmentId", (req, res) => {
   dataService.getDepartmentById(req.params.departmentId).then((data) => {
       res.render("department", { data: data });
   }).catch((err) => {
       res.status(404).send("Department Not Found");
   });
});


app.get("/departments", function(req,res) {
   dataService.getAllDepartments().then( function(data) {
      return res.render("departments",{departments: data});
   }).catch((err) => { "Error: " + err });
});

app.get("/departments/add", function(req,res) {
   res.render("addDepartment");
});

// 404
app.get('*', function(req, res){
  res.render("404");
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
   dataService.updateEmployee(req.body).then (
      res.redirect("/employees")
   ).catch((err) => { "Error: " + err});
});

app.post("/departments/add", (req, res) => {
   dataService.addDepartment(req.body).then(() => {
       res.redirect("/departments");
   }).catch((err) => { "Error: " + err});
});

app.post("/department/update", (req, res) => {
   dataService.updateDepartment(req.body).then (
      res.redirect("/departments")
   ).catch((err) => { "Error: " + err});
});


// ******** SERVER LISTENS **************************************************

dataService.initialize().then(
   app.listen(HTTP_PORT, onHttpStart)
)
.catch((err)=> { console.log("Error: " + err)
});
