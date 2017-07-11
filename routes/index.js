// acquire packages
var express = require('express');
var router = express.Router();

/* GET home page. */


var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
}

var projectsIfAuthed = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/projects');
  } else {
    next();
  }
}

//Routes are not set up correctly yet!!!
var passportRouter = function(passport) {

    router.get('/', projectsIfAuthed);

    //GET login page
    router.get('/login', projectsIfAuthed, function(req, res) {
      res.render('login', { message: req.flash('message')});
    });

    //Handle login POST
    router.post('/login', passport.authenticate('local-login', {
      successRedirect: '/projects', //Go to the projects page
      failureRedirect: '/login', //Back to login
      failureFlash: true
    }));

    //GET registration page
    router.get('/signup', projectsIfAuthed, function(req, res){
      res.render('register', {message: req.flash('message')});
    });

    //GET projects page
    router.get('/projects', isAuthenticated, function(req, res){
      res.render('projects', {
        title: 'Synnefo' 
      });
    });

    //GET editor page
    router.get('/editor', isAuthenticated, function(req, res){
      res.render('editor', {
        title: 'Synnefo' 
      });
    });

    //GET password reset page
    router.get('/update_password', isAuthenticated, function(req, res){
      res.render('password', {
        message: req.flash('message'),
        title: 'Reset Password'
      });
    });

    router.post('/update_password', isAuthenticated, function(req, res) {
      // check that newpassword1 and newpassword2 and equal
      // update password
      if (req.body.newpassword1 === req.body.newpassword2) {
        req.user.updatePassword(req.body.oldpassword, req.body.newpassword1, function(err) {
          if (err) {
            req.flash('message', err);
          } else {
            req.flash('message', 'Password updated');
          }

          res.redirect('/update_password');
        });
      } else {
        req.flash('message', 'Password\'s don\'t match');
        res.redirect('/update_password');
      }
    });

    //Handle register POST
    router.post('/signup', passport.authenticate('local-signup', {
      successRedirect: '/projects', //Use the app
      failureRedirect: '/signup', //Try to sign up again
      failureFlash: true
    }));


    //Handle logout
    router.get('/signout', function(req, res) { 
      req.logout(); //Log user out
      res.redirect('/'); //Back to login page
    });

    return router;
}

// return
module.exports = passportRouter;
