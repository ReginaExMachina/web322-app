
const Sequelize = require('sequelize');

var sequelize = new Sequelize('d38m999qv8ds7f', 'blpukoropsahyc', '4b008739258eb7c856bcd5aeefb0a18293e63f3afb3457b35c08ca09ef153adf', {
  host: 'ec2-23-23-241-119.compute-1.amazonaws.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
     ssl: true
  }
});

/***************************************

 * Models

 ***************************************/

var Employee = sequelize.define('Employee', {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  department: Sequelize.INTEGER,
  hiredate: Sequelize.STRING
});

var Department = sequelize.define('Department', {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  departmentName: Sequelize.STRING
});


 /***************************************

 * Functions

 ***************************************/

module.exports.initialize = function () {
  return new Promise((resolve, reject)=>{
    sequelize.sync().then(()=>{
        console.log("Connected to database.");
        resolve();
    }).catch(()=>{
        reject("Unable to sync the database");
    });
  });
};

 /******** EMPLOYEE FUNCTIONS *******************************/

module.exports.getAllEmployees = function() {
  return new Promise((resolve, reject)=>{
    Employee.findAll({
        order: ['employeeNum']
    }).then((data)=>{
        resolve(data);
    }).catch(()=>{
        reject("No results returned");
    });
  });
};

module.exports.getEmployeesByStatus = function(status){
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"],
      where: {
          status: status
      }
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};

module.exports.getEmployeesByDepartment = function(department){
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"],
      where: {
          department: department
      }
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};

module.exports.getEmployeesByManager = function(manager){
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"],
      where: {
        employeeManagerNum: manager
      }
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};

module.exports.getEmployeesByNum = function(num){
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"],
      where: {
        employeeNum: num
      }
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};


 /******** MANAGERS FUNCTIONS *******************************/

module.exports.getAllManagers = function() {
  return new Promise(function(resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"],
      where: {
        isManager: true
      }
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};


 /******** DEPARTMENT FUNCTIONS *******************************/

module.exports.getAllDepartments = function() {
  return new Promise(function(resolve, reject) {
    Department.findAll({
      order: ["departmentId"]
    }).then((data)=>{
      resolve(data);
    }).catch(()=>{
      reject("No results returned");
    });
  });
};

module.exports.getDepartmentById = function (num){
  return new Promise(function (resolve, reject) {
      Departments.findAll({
          where:{departmentId:num}
      })
      .then((data)=>{
          resolve(data[0]);
      })
      .catch(()=>{
          reject("No results returned.");
      })
  });
};


 /******** ADDING... *******************************/

module.exports.addEmployee = function(employeeData) {
  return new Promise(function(resolve, reject) {
    employeeData.isManager = (employeeData.isManager) ? true : false;

    // Ensure blank inputs are NULLs
    for (let i in employeeData) {
      if (employeeData[i] == "") {
          employeeData[i] = null;
      }
    }

    Employee.create({
      firstName: employeeData.firstName,
      last_name: employeeData.last_name,
      email: employeeData.email,
      SSN: employeeData.SSN,
      addressStreet: employeeData.addressStreet,
      addresCity: employeeData.addresCity,
      addressState: employeeData.addressState,
      addressPostal: employeeData.addressPostal,
      maritalStatus: employeeData.maritalStatus,
      isManager: employeeData.isManager,
      employeeManagerNum: employeeData.employeeManagerNum,
      status: employeeData.status,
      department: employeeData.department,
      hireDate: employeeData.hireDate
    }).then(()=>{
      console.log("Employee created.");
      resolve();
    }).catch(()=>{
      reject("Unable to create employee");
    });
  });
};


module.exports.addDepartment = function(departmentData){
  return new Promise(function (resolve, reject) {
      for (const n in departmentData) {
          if (departmentData[n] == "") departmentData[n] = null;
      };
      Departments.create({
          departmentId: departmentData.departmentId,
          departmentName: departmentData.departmentName
      })
      .then(()=>{
          console.log("Created department.");
          resolve(Departments[1]);
      })
      .catch(()=>{
          reject("Unable to create department.");
      });   
  });
};

 /******** UPDATING... *******************************/

module.exports.updateEmployee = (employeeData) => {
  employeeData.isManager = (employeeData.isManager) ? true : false;
  
  for (let i in employeeData) {
      if (employeeData[i] == "") {
          employeeData[i] = null;
      }
  }
  
  return new Promise((resolve, reject)=> {
      Employee.update({
          firstName: employeeData.firstName,
          last_name: employeeData.last_name,
          email: employeeData.email,
          SSN: employeeData.SSN,
          addressStreet: employeeData.addressStreet,
          addresCity: employeeData.addresCity,
          addressState: employeeData.addressState,
          addressPostal: employeeData.addressPostal,
          maritalStatus: employeeData.maritalStatus,
          isManager: employeeData.isManager,
          employeeManagerNum: employeeData.employeeManagerNum,
          status: employeeData.status,
          department: employeeData.department,
          hireDate: employeeData.hireDate
      }, {
          where: {
              employeeNum: employeeData.employeeNum
          }
      }).then(()=> {
          resolve();
      }).catch(()=> {
          reject("Unable to update employee.");
      });
  });
};

module.exports.updateDepartment = function(departmentData){
  return new Promise(function (resolve, reject) {
      for (const n in departmentData) {
          if (departmentData[n] == "") departmentData[n] = null;
      };
      Departments.update(
      {
          departmentId: departmentData.departmentId,
          departmentName: departmentData.departmentName
      },
      {
          where:{departmentId:departmentData.departmentId}
      })
      .then(()=>{
          console.log("Department updated.");
          resolve(Departments);
      })
      .catch(()=>{
          reject("Unable to update department.");
      });   
  });
};

 /******** DELETING... *******************************/

module.exports.deleteEmployeeByNum = function(num){
    return new Promise(function (resolve,reject){
        Employees.destroy({
            where:{employeeNum:num}
        })
        .then(()=>{
            resolve("Employee Deleted.");
        })
        .catch(()=>{
            reject("Failed to delete employee.");
        })
    })
}
