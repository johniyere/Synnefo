// acquire packages
var express = require('express');
var router = express.Router();

var db = require('../models/db.js');
var Directory = require('../models/directory.js');
var File = require('../models/file.js');

// get initial page.
router.get('/', function(req, res, next) {
  res.render('projects', {title: 'My Projects'})
});

// Get data.
router.post('/getData', function(req, res, next) {
  db.getProjectNamesByRole(req.body.role, req.user, function(err, names){
    if (names == ""){
      var emptyArray = [];
      res.send(
        (err === null) ? { msg: '', projects: JSON.stringify(emptyArray), role: req.body.role} : { msg: err });
    }
    else{
      if(err) return res.send({ msg: err });
      var projects = [];
      var count = 0;
      var _callback = function(err,response)
      {
        projects.push(response);
        count++;
        if(count >= names.length) {
          res.send(
            (err === null) ? { msg: '', projects: JSON.stringify(projects), role: req.body.role} : { msg: err });
        }
      }
      for(var index in names)
      {
        db.getFileTree(names[index], req.user, _callback);
      }
    }
  });
});

// Push an item to the database.
router.post('/push', function(req, res, next) {
  if (req.body.type == "Project"){
    db.createProject(req.body.name, req.user, function(err,response){
      res.send(
        (err === null) ? { msg: '', returnedProject: response } : { msg: err }
      );
    });
  }
  else{
    Directory.findById(req.body.parent_id, function(err, dir) {
      if (err) return res.send({ msg: err });
      if (req.body.type == "Directory"){
        db.createDirectory(dir, req.body.name, req.user, function(err,response){
          res.send(
            (err === null) ? { msg: '', returnedFolder: response } : { msg: err }
          );
        });
      } // if
      else
      {
        db.createFile(dir, req.body.name, req.user, function(err,response){
          res.send(
            (err === null) ? { msg: '', returnedFolder: response } : { msg: err }
          );
        });
      } // else
    });
  }
});

// Delete an item form the database.
router.post('/delete', function(req, res, next) {
  if (req.body.type == "Directory")
  {
    Directory.findById(req.body.id, function(err, dir) {
      if(err) return res.send({ msg: err });
      db.deleteDirectory(dir, req.user, function(err,response){
        res.send(
          (err === null) ? { msg: '' } : { msg: err }
        );
      });
    });
  } // if
  else
  {
    File.findById(req.body.id, function(err, file) {
      if(err) return res.send({ msg: err });
      db.deleteFile(file, req.user, function(err,response){
        res.send(
          (err === null) ? { msg: '' } : { msg: err }
        );
      });
    });
  } // else
});

// Change default roles on a given object. All the users on default change as well.
router.post('/defaultPermissionsChange', function(req, res, next){
  var _callback = function(err,object)
  {
    if(err) return res.send({ msg: err });
    db.updateDefaultLevel(object, req.body.newDefault, req.user, function(err){
      res.send(
        (err === null) ? { msg: '' } : { msg: err }
      );
    });
  };
  if (req.body.type == "Directory")
  {
    Directory.findById(req.body.objectID, _callback);
  } // if
  else
  {
    File.findById(req.body.objectID, _callback);
  } // else

});

// Change roles on a given user on a given object.
router.post('/permissionsChange', function(req, res, next){
  var _callback = function(err,object)
  {
    if(err) return res.send({ msg: err });
    db.findUsers({'username': req.body.userName}, req.user, function(err,users){
      if(err) return res.send({ msg: err });
      if (users.length == 0)
        res.send({ msg: "No such user found!" });
      else
      {
        db.addUserAsRole(object, users[0]._id, req.body.newRole, req.user, function(err){
          res.send(
            (err === null) ? { msg: '' } : { msg: err }
          );
        });
      } // else
    });
  };
  if (req.body.type == "Directory")
  {
    Directory.findById(req.body.objectID, _callback);
  } // if
  else
  {
    File.findById(req.body.objectID, _callback);
  } // else

});

// Upload files.
router.post('/uploadFiles', function(req, res, next) {

  // Find the directory where the files have to be upladed by the given id.
  Directory.findById(req.body.directoryID, function(err,dir){
    var numOfFilesToUpload = req.files.length;
    if(err) return res.send({ msg: err });
    // Go through all of the given files.
    for (var f in req.files){
      // This does the actual file upload.
      db.uploadFile(dir, req.files[f].originalname, req.files[f].path, req.user, function(err, result){
        if(err) return res.send({ msg: err });
        else
        {
          numOfFilesToUpload--;
          // Reload the page when the upload is done.
          if (numOfFilesToUpload == 0)
          {
            console.log(numOfFilesToUpload);
            // If the upload is complete then send an empty message back.
            res.send(
              (err === null) ? { msg: '' } : { msg: err }
            );
          } // if
        } // else
      })
    } // for
  }); // end of callback.

});

// return
module.exports = router;
