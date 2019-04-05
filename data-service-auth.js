const mongoose = require("mongoose");
const Schema  = mongoose.Schema;
const bcrypt = require('bcryptjs');
var userSchema = new Schema({
    "userName":{
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]
});
let User;
module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://dbRday:T3%40c%40k3%24@senecaweb-shard-00-00-cfspd.mongodb.net:27017,senecaweb-shard-00-01-cfspd.mongodb.net:27017,senecaweb-shard-00-02-cfspd.mongodb.net:27017/web322_a6?ssl=true&replicaSet=SenecaWeb-shard-0&authSource=admin&retryWrites=true");
        db.on('error', (err)=>{
            reject(err);
        });
        db.once('open', ()=>{
           User = db.model("Users", userSchema);
           resolve();
        });
    });
};
module.exports.registerUser = function (userData){
    return new Promise(function (resolve, reject) {
        if( userData.password != userData.password2 ){
            reject ("Passwords do not match.");
        }
        else{        
            var newUser = new User(userData);
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err){
                        reject("There was an error encrypting the password.");
                    }
                    else{
                        newUser.password = hash;
                        newUser.save()
                        .then(()=>{
                            resolve();
                        })
                        .catch( (err)=>{
                            if (err.code == 11000){
                                reject("User Name already taken.");                 
                            }
                            else{
                                reject("There was an error creating the user: " + err);
                            }
                        }); 
                    }
                });
            });

        }
    });
}
module.exports.checkUser = function (userData){
    return new Promise(function (resolve, reject){
        User.find({userName: userData.userName})
        .exec()
        .then((selectedUser)=>{
            bcrypt.compare(userData.password, selectedUser[0].password )
            .then((res) => {
                selectedUser[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                User.update({ userName: selectedUser[0].userName},
                            { $set: { loginHistory: selectedUser[0].loginHistory } },
                            { multi: false })
                .exec()
                .then( ()=>{
                    resolve(selectedUser[0]);
                })
                .catch((err)=>{
                    reject("There was an error verifying the user: " + err);
                });
            })
            .catch((err)=>{
                reject("Incorrect Password for user: " + userData.userName);
            })  
        })
        .catch((err)=>{
            reject("Unable to find user: " + userData.userName);
        });
    });
}