/*post model*/

var mongodb = require('./db');

function Post(name, title, post) {
    this.name = name;
    this.title= title;
    this.post = post;
}

module.exports = Post;

Post.prototype.save = function(callback) {  //save a post
    var date = new Date();
    //save mutil type of the time;
    var time = {
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth()+1),
        day : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes()
    }
    //ready to save info
    var post = {
        name: this.name,
        time: time,
        title:this.title,
        post: this.post
    };
    //open db
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //get the posts collection
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            collection.insert(post, {
                safe: true
            }, function (err,post) {
                mongodb.close();
                callback(null);
            });
        });
    });
};

Post.get = function(name, callback) {//get the post
    //open db
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //get the post collection
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if (name) {
                query.name = name;
            }

            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                    mongodb.close();
                    if (err) {
                        callback(err, null);
                    }
                    callback(null, docs);
                });
        });
    });
};