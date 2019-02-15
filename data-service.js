
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

module.exports.getAllEmployees = function() {
  return new Promise(function(resolve, reject) {
    employees.length ? resolve(employees) : reject("No results returned for employees.");
  })
}

module.exports.getAllManagers = function() {
  return new Promise(function(resolve, reject) {
    employees.length ? resolve(
      employees.findAll( { where: { isManager: true }
    })) : reject("No results returned for employees.");
  })
}

module.exports.getAllDepartments = function() {
  return new Promise(function(resolve, reject) {
    departments.length ? resolve(departments) : reject("No results returned for departments.");
  })
}

module.exports.addEmployee = function(employeeData){
    return new Promise(function (resolve, reject) {
        var empNum = employeeData.length() + 1; 
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for (const n in employeeData) {
            if (employeeData[n] == "") employeeData[n] = null;
        };
        Employees.create({
            employeeNum: empNUm,
            firstName: employeeData.firstName,
            lastName: employeeData.lastName,
            email: employeeData.email,
            SSN: employeeData.SSN,
            addressStreet: employeeData.addressStreet,
            addressCity: employeeData.addressCity,
            addressState: employeeData.addressState,
            addressPostal: employeeData.addressPostal,
            maritalStatus: employeeData.maritalStatus,
            isManager: employeeData.isManager,
            employeeManagerNum: employeeData.employeeManagerNum,
            status: employeeData.status,
            department: employeeData.department,
            hireDate: employeeData.hireDate
        })
        .then(()=>{
            console.log("Created a new employee");
            resolve(Employees[1]);
        })
        .catch(()=>{
            reject("Failed to create employee");
        });   
    });
};
