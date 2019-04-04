/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Rachel Day      Student ID: 100057181            Date: 05/04/2019
*
*  Online (Heroku) Link: border: https://salty-depths-49587.herokuapp.com/ 
*
********************************************************************************/ 

var dataService = require('./data-service.js');
var dataServiceAuth = require('./data-service-auth.js');

const path = require("path");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const clientSessions = require("client-sessions");
const fs = require('fs');
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(clientSessions({
   cookieName: "session",
   secret: "web_assignment_web322",
   duration: 2 * 60 * 1000,
   activeDuration: 1000 * 60
 }));

 app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
 });

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

function ensureLogin (req, res, next){
   if (!(req.session.user)){
       res.redirect("/login");
   }
   else{
       next();
   }
}

// ******** LOGIN & REGISTER ********************************************** //
app.get("/login", (req, res) => {
   res.render("login");
});

app.get("/logout", (req, res) => {
   res.session.rest();
   res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
   res.render("userHistory, {user: req.session.user}");
});

app.get("/register", (req, res) => {
   res.render("register");
});

app.post("/login", (req, res) => {
   req.body.userAgent = req.get('User-Agent');
   dataServiceAuth.checkUser(req.body)
   .then((get_user) => {
      req.session.user = {
         userName: get_user.email,
         loginHistory: get_user.loginHistory
      };
      res.redirect('/employees');
   })
   .catch((err) => {
      res.render("login", {errorMessage: err, userName: req.body.userName});
   });
});

app.post("/register", (req,res)=>{
   dataServiceAuth.registerUser(req.body)
   .then(()=>{
       res.render("register", {successMessage: "User created."});
   })
   .catch((err)=>{
       res.render("register",{errorMessage: err, userName: JSON.stringify(req.body.userName)});
   })
});

// ******** GET METHODS **************************************************

app.get("/", function(req,res) {
   res.render("home");
});

app.get("/about", function(req,res){
   res.render("about");
});

//  EMPLOYEE

app.get("/employee/:empNum", ensureLogin, (req, res) => {

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

app.get("/employees", ensureLogin, function(req,res) {
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

app.get("/employees/add", ensureLogin, (req, res) => {
    dataService.getAllDepartments()
    .then((data)=> {
        res.render("addEmployee", {departments: data});
    })
    .catch(()=> {
        res.render("addEmployee", {departments: []}) 
    });
});

app.get("/managers", ensureLogin, function(req,res) {
   dataService.getAllManagers().then( function(data) {
      return res.json(data);
   }).catch((err) => { "Error: " + err });
});

app.get("/employee/delete/:empNum", ensureLogin, (req, res) => {
   dataService.deleteEmployeeByNum(req.params.empNum).then(() => {
       res.redirect("/employees");
   }).catch((err) => {
       res.status(500).send("Unable to Remove Employee / Employee not found");
   });
});

// ******** IMAGES ********************************************** //
app.get("/images", ensureLogin, (req, res) => {
    fs.readdir("./public/images/uploaded", function(err, data) {
        res.render('images', {images:data});
    });
});

app.get("/images/add", ensureLogin, (req, res) => {
   res.render("addImage");
});

// DEPARTMENTS
app.get("/department/:departmentId", ensureLogin, (req, res) => {
   dataService.getDepartmentById(req.params.departmentId).then((data) => {
       res.render("department", { data: data });
   }).catch((err) => {
       res.status(404).send("Department Not Found");
   });
});


app.get("/departments", ensureLogin, (req, res) => {
   dataService.getAllDepartments().then( function(data) {
      return res.render("departments",{departments: data});
   }).catch((err) => { "Error: " + err });
});

app.get("/departments/add", ensureLogin, (req, res) => {
   res.render("addDepartment");
});

// 404
app.get('*', function(req, res){
  res.render("404");
});


// ******** POST METHODS **************************************************

app.post("/images/add", upload.single("imageFile"), ensureLogin, (req, res) => {
   res.redirect("/images");
});

app.post("/employees/add", ensureLogin, (req, res) => {
   dataService.addEmployee(req.body).then (
      res.redirect("/employees")
   ).catch((err) => { "Error: " + err});
});

app.post("/employee/update", ensureLogin, (req, res) => {
   dataService.updateEmployee(req.body).then (
      res.redirect("/employees")
   ).catch((err) => { "Error: " + err});
});

app.post("/departments/add", ensureLogin, (req, res) => {
   dataService.addDepartment(req.body).then(() => {
       res.redirect("/departments");
   }).catch((err) => { "Error: " + err});
});

app.post("/department/update", ensureLogin, (req, res) => {
   dataService.updateDepartment(req.body).then (
      res.redirect("/departments")
   ).catch((err) => { "Error: " + err});
});


// ******** SERVER LISTENS **************************************************

dataService.initialize()
.then(dataServiceAuth.initialize)
.then(
   app.listen(HTTP_PORT, onHttpStart)
)
.catch((err)=> { console.log("Error: " + err)
});
