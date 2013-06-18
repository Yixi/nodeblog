
/*
 * GET home page.
 *
 */

var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js');

module.exports = function(app){
    app.get('/',function(req,res){
        Post.get(null,function(err,posts){
            if(err){
                posts=[];
            }
            res.render('index',{
                title:"homepage",
                user:req.session.user,
                posts:posts,
                success:req.flash('success').toString(),
                error:req.flash('error').toString()
            });
        });
    });

    app.get('/reg',checkNotLogin);
    app.get('/reg',function(req,res){
        res.render('reg',{
            title:"signup",
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/reg',checkNotLogin);
    app.post('/reg',function(req,res){
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];

        if(password_re!=password){
            req.flash('error',"The password are not the same");
            return res.redirect('/reg');
        }

        //create the password hash
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        var newUser= new User({
            name:req.body.name,
            password:password,
            email:req.body.email
        });

        //check the user is already exist.
        User.get(newUser.name,function(err,user){
            if(user){
                err = 'User is exist.';
            }
            if(err){
                req.flash('error',err);
                return res.redirect('/reg');
            }

            //if user isn't exist so create a new user.
            newUser.save(function(err){
                if(err){
                    req.flash('error',err);
                    return res.redirect('/reg');
                }

                req.session.user = newUser; //save the user info to session.
                req.flash('success',"register successful!");
                res.redirect('/');
            });
        });
    });

    app.get('/login', checkNotLogin);
    app.get('/login',function(req,res){
        res.render('login',{
            title:'signin',
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/login', checkNotLogin);
    app.post('/login',function(req,res){
        //create the password hash
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');

        // check the user is exist.
        User.get(req.body.name,function(err,user){
            if(!user){
                req.flash('error',"User is not exist!");
                return res.redirect('/login');
            }

            //check the password;
            if(user.password != password){
                req.flash('error','password error!');
                return res.redirect('/login');
            }

            //all is right then save the info to the session
            req.session.user = user;
            req.flash('success',"sign in successful!");
            res.redirect("/");
        });
    });

    app.get('/post', checkLogin);
    app.get('/post',function(req,res){
        res.render('post',{
            title:'post',
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
        });
    });

    app.post('/post', checkLogin);
    app.post('/post',function(req,res){
        var currentUser = req.session.user,
            post = new Post(currentUser.name,req.body.title,req.body.post);
        post.save(function(err){
            if(err){
                req.flash('error',err);
                return res.redirect('/');
            }
            req.flash('success','post success!');
            res.redirect('/');
        });
    });

    app.get('/logout', checkLogin);
    app.get('/logout',function(req,res){
        req.session.user = null;
        req.flash('success','sign out successful!');
        res.redirect('/');
    });

};

function checkLogin(req,res,next){
    if(!req.session.user){
        req.flash('error','Not log in!');
        return res.redirect('/login');
    }
    next();
}

function checkNotLogin(req,res,next){
    if(req.session.user){
        req.flash('error','Aready log in!');
        return res.redirect('/');
    }
    next();
}