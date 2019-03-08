
 /***************************************

 * Modules

 ***************************************/

const fs = require('fs');

var employees = [];
var departments = [];

module.exports.initialize = function () {
  return new Promise(function(resolve, reject) {
    fs.readFile("./data/employees.json", "utf8", function(error, content) {
      if(error) {
        reject(error);
      } else {
            employees = JSON.parse(content);
            resolve();
          }
        })
        }).then(function() {
          return new Promise(function(resolve, reject) {
            fs.readFile("./data/departments.json", "utf8", function(error, content) {
              if(error) {
                reject(error);
              } else {
                    departments = JSON.parse(content);
                    resolve();
              }        
        })
    })
  }).then(function() {
    return new Promise(function(resolve, reject) {
      resolve();
    })
  })
}

 /******** EMPLOYEE FUNCTIONS *******************************/

module.exports.getAllEmployees = function() {
  return new Promise(function(resolve, reject) {
    employees.length ? resolve(employees) : reject("No results returned for employees.");
  })
}

module.exports.getEmployeesByStatus = function(status){
  return new Promise((resolve, reject) => {
      let filteredEmployees = employees.filter(employees => employees.status == status);
      if(filteredEmployees.length == 0) {
        reject("No results returned");
      }
      resolve(filteredEmployees);
  });
}

module.exports.getEmployeesByDepartment = function(department){
  return new Promise((resolve, reject) => {
      let filteredEmployees = employees.filter(employee => employee.department == department);
      if(filteredEmployees.length == 0) {
        reject("No results returned");
      }
      resolve(filteredEmployees);
  });
}

module.exports.getEmployeesByManager = function(manager){
  return new Promise((resolve, reject) => {
      let filteredEmployees = employees.filter(employee => employee.employeeManagerNum == manager);
      if(filteredEmployees.length == 0) {
        reject("No results returned");
      }
      resolve(filteredEmployees);
  });
}

module.exports.getEmployeesByNum = function(num){
  return new Promise((resolve, reject) => {
      let filteredEmployees = employees.filter(employee => employee.employeeNum == num);
      if(filteredEmployees.length == 0) {
        reject("No results returned");
      }
      resolve(filteredEmployees);
  });
}

// MANAGERS
module.exports.getAllManagers = function(){
  return new Promise((resolve, reject) => {
      let managers = employees.filter(employees => employees.isManager == true);
      resolve(managers);
      if(employees.length == 0)
      reject("No results returned");
  });
};

module.exports.addEmployee = (employeeData) => {
  return new Promise((resolve, reject) => {
    try {
      employeeData.isManager = !(employeeData.isManager == undefined);
      employeeData.employeeNum = employees.length + 1;
      employees.push(employeeData);
      resolve();
    } catch {
      var errorMsg = "Failed to create new employee.";
      reject(errorMsg);
    }
  })
}

module.exports.updateEmployee = (employeeData) => {
  employeeData.isManager = (employeeData.isManager) ? true : false;
  return new Promise((resolve, reject) => {
      for (let i = 0; i < employess.length; i++) {
          if (employess[i].employeeNum == employeeData.employeeNum) {
              employess.splice(employeeData.employeeNum - 1, 1, employeeData);
          }
      }
      if (employess.length == 0) {
          reject("No Result Returned!!!");
      }
      resolve(employess);
  });
}

 /******** DEPARTMENT FUNCTIONS *******************************/

module.exports.getAllDepartments = function() {
  return new Promise(function(resolve, reject) {
    departments.length ? resolve(departments) : reject("No results returned for departments.");
  })
}