var mongodb = require('./db');

function User(user){
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback){ //save the user info
    //the user info
    var user = {
        name:this.name,
        password:this.password,
        email:this.email
    }

    //open the db
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        // read the users collection

        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //insert the user info to ther users collection
            collection.insert(user,{safe:true},function(err,user){
                mongodb.close();
                callback(err,user);  //success! return the inserted user info
            });
        });
    });
}

User.get = function(name,callback){ //get the user info
    //open the db
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }

        //read the users collection
        db.collection('users',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }

            //find the name is "name" user.
            collection.findOne({
                name:name
            },function(err,doc){
                mongodb.close();
                if(doc){
                    var user = new User(doc);
                    callback(err,user); //success! return the query user
                }else{
                    callback(err,null); //error,return null;
                }
            });
        });
    });
}