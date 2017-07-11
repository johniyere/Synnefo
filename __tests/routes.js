// acquire packages
var express = require('express');
var __testRouter = express.Router();

var mongoose = require('mongoose');
var Directory =  require('../models/directory.js');
var File =  require('../models/file.js');
var db = require('../models/db.js');

Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


/* GET upload page. */
__testRouter.get('/project/:name', function(req, res, next) {
  db.createProject(req.params.name, req.user, function(err, project) {
    res.json({err : err, response : project});
  })
});

__testRouter.get(['/'], function(req, res, next) {
  var projectName = req.params.projectName || "Test";
  db.getFileTree(projectName,req.user,function(err,response){
    res.json({err: err, response: response});
  })
});

__testRouter.get('/roles_test', function(req, res, next) {
  db.getProjectNamesByRole(0, req.user, function(err, names){
    res.json({err: err, response: names});
  })
})

__testRouter.get('/add_role', function(req, res, next) {
  Directory.findOne({dirname : "Test", parent : null}, function(err, dir){
    db.addUserAsRole(dir,"56c63a38797b65c91766f654",1,req.user,function(err,response){
      res.json({err: err, response: response});
    })
  })
})

__testRouter.get('/remove_role', function(req, res, next) {
  Directory.findOne({dirname : "Test", parent : null}, function(err, dir){
    db.removeUserAsRole(dir,"56c63a38797b65c91766f654",1,req.user,function(err,response){
      res.json({err: err, response: response});
    })
  })
})

__testRouter.get('/default_role', function(req, res, next) {
  Directory.findOne({dirname : "Test", parent : null}, function(err, dir){
    db.updateDefaultLevel(dir,2,req.user,function(err,response){
      res.json({err: err, response: response});
    })
  })
})

__testRouter.get('/test_structure', function(req, res, next) {
  db.createProject('Test', req.user, function (err, project){
    if (err) return res.json(err);
    console.log('==Test project created')
    console.log(project)
    db.createFile(project, 'test.py', req.user, function (err, file){
      if (err) return res.json(err);
      console.log('==Test.py created')
      console.log(file);
      db.updateFile(file,"Some test\n multipline text", req.user, function(err, file) {
        console.log('==Test.py updated')
        console.log(file);
        db.createDirectory(project,"newDir", req.user, function (err, dir){
          if (err) return res.json(err);
          console.log('==newDir created')
          console.log(dir);
          db.createFile(dir, 'test2.py', req.user, function (err, file){
            if (err) return res.json(err);
            console.log('==Test2.py in newDir created')
            console.log(file);
            db.attachComment(file, "testBlock", req.user, function (err, comment){
              if (err) return res.json(err);
              console.log('==Test2.py comment created')
              console.log(comment);
              res.json("OK");
            })
          });
        });
      });
    });
  });
})

__testRouter.get('/delete_dir/:name', function(req, res, next) {
  Directory.findOne({dirname : req.params.name}, function (err,dir){
    if(err) return res.json(err);
    if(dir == null) return res.json("Directory does not exist");
    db.deleteDirectory(dir,req.user,function(err,result){
      res.json({err : err, response : result});
    })
  })
});

__testRouter.get('/delete_file/:name', function(req, res, next) {
  File.findOne({filename : req.params.name}, function (err,file){
    if(err) return res.json(err);
    if(file == null) return res.json("file does not exist");
    db.deleteFile(file,req.user,function(err,result){
      res.json({err : err, response : result});
    })
  })
});

__testRouter.get('/subdir/:name/:subname', function(req, res, next) {
  Directory.findOne({dirname : req.params.name, parent : null}, function (err,dir){
    if(err) return res.json(err);
    if(dir == null) return res.json("Directory does not exist");
    db.createDirectory(dir, req.params.subname, req.user, function(err,dir) {
      res.json({err : err, response : dir});
    })
  })
});

// return
module.exports = __testRouter;
