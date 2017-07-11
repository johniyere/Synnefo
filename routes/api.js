// acquire packages
var express = require('express');
var router = express.Router();
var File = require('../models/file.js');
var db = require('../models/db.js');

router.post('/addsnippet/', function(req, res){
  File.findById(req.body.fileid, function(err, file) {
    if(err){
      console.log(err);
      res.send(err);
    }
    db.attachComment(file,req.body.blockname,req.user,function(err,comment){
      if(err){
        console.log(err);
        res.send(err);
      }
      res.status(200).json(comment);    
    })
  })
})

router.post('/getfilecontent', function(req, res){
  console.log("The id is: " + req.params.fileid);
  File.findById(req.body.fileid, function(err, file) {
    if(err){
      console.log(err);
      res.send(err);
    }
    res.status(200).json(file);    
    
    // comments = [];
    // var count = 0;
    // var _callback = function(err,response)
    // {
    //   comments.push(response);
    //   count++;
    //   if(count >= file.comments.length) {
    //     file.comments = comments;
    //     console.log(comments);
    //     res.status(200).json(file);    
    //   };
    // }
    // for(var v in file.comments)
    // {
    //   File.findById(file.comments[v].Id, _callback);
    // }
  });
});

router.post('/getfilecontent', function(req, res){
  console.log("The id is: " + req.params.fileid);
  File.findById(req.body.fileid, function(err, file) {
    if(err){
      console.log(err);
      res.send(err);
    }
    res.status(200).json(file);    
    
    // comments = [];
    // var count = 0;
    // var _callback = function(err,response)
    // {
    //   comments.push(response);
    //   count++;
    //   if(count >= file.comments.length) {
    //     file.comments = comments;
    //     console.log(comments);
    //     res.status(200).json(file);    
    //   };
    // }
    // for(var v in file.comments)
    // {
    //   File.findById(file.comments[v].Id, _callback);
    // }
  });
});

router.post('/saveFile', function(req, res){
  File.findById(req.body.fileID, function(err, file) {
    if(err){
      console.log(err);
      res.send(err);
    }
    db.updateFile(file, req.body.content, req.user, function(err, file){
      if(err)
        console.log(err);  
      res.status(200).json({newFile: file});
    });    
  });
});

//Ignore this-just for debugging
router.get('/getfilecontent', function(req, res){
  res.render('home');
});

module.exports = router;