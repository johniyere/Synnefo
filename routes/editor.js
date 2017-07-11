// acquire packages
var express = require('express');
var router = express.Router();
var File = require('../models/file.js');
var db = require('../models/db.js');
var mkdir = require('mkdirp').sync;
var fs = require('fs');
var exec = require('child_process').exec;


/* GET home page. */
router.get(['/','/:projectName','/:projectName/:fileID'], function(req, res, next) {
  var projectName = req.params.projectName || "Test";
  db.getFileTree(projectName,req.user,function(err,response){
    if (typeof req.params.fileID != "undefined"){
      var fileToOpenID = req.params.fileID;
      File.findById(fileToOpenID, function(err, file) {
        if(err) return res.send(err);
        res.render('editor', {title: 'EditorPage',
                              tree : JSON.stringify(response),
                              fileToOpen : JSON.stringify(file),
                              projectName: projectName});
      });
    } // if
    else
      res.render('editor', {title: 'EditorPage',
                            tree : JSON.stringify(response),
                            fileToOpen : 'null',
                            projectName: projectName});
  })
});

var runTheCode = function(callback){
  
  fileToBeRunPath = fileToBeRunPath.replace(' ', '\\ ');
  exec('python ' + fileToBeRunPath, {timeout: 3000}, function(err, stdout, stderr){
    if(err)
      console.log(err);
    callback(err, stdout, stderr);
  });
}

var createFileStructure = function(tree, pathObj, callback){

  //console.log(tree);
  //console.log("path is: ")
  //console.log(pathObj.array.join('/'));

  //special case when the name of the file or folder has spaces
  var name = tree.name.replace(' ', '\ ');

  var currentPath = pathObj.array.join('/');

  if(tree.type === 'Directory'){
    //This is a directory. Modify the path and go down the tree with the new path
    
    pathObj.array.push(name);
    
    //Create folder synchronously
    mkdir(pathObj.array.join('/'));
    
    //Go into the subfolder
    for(var child in tree.children)
      createFileStructure(tree.children[child], pathObj, callback);
  }
  else{
    //This is a file
    console.log('file content is ' + tree.content);
    if(tree.content == undefined)
      content = '';

    //Write the file synchronously
    fs.writeFileSync(currentPath + '/' + name, tree.content);

    writtenFiles++;

    //We have found in the project the file which is going to be run
    //It will run only when the whole project is completed
    if(fileToBeRunID == tree.id){
      console.log(pathObj.array);
      fileToBeRunPath = currentPath + '/' + name;
    }
    if(writtenFiles == numberOfFiles)
      callback(fileToBeRunPath); 
  }
}

//global variables used to find out when all the files have been written
//and code can be runed
var numberOfFiles = 0;
var writtenFiles = 0;
var fileToBeRunPath = '';
var fileToBeRunID = -1;

//Gets the number of files in the tree
var getNumberOfFiles = function(tree){
  var nrfiles = 0;

  if(tree.type === 'Directory'){
    for(var child in tree.children)
      nrfiles += getNumberOfFiles(tree.children[child]);
  }
  else
    return 1;

  return nrfiles;
}

router.post('/getTree', function(req, res, next) {
  var projectName = req.body.projectName;
  fileToBeRunID = req.body.fileToBeRunID;

  db.getFileTree(projectName,req.user,function(err,response){
    if (typeof req.params.fileID != "undefined"){
      var fileToOpenID = req.params.fileID;
      File.findById(fileToOpenID, function(err, file) {
        if(err) return res.send(err);
      });
    } // if
    else{

      //Get the number of files in the tree
      numberOfFiles = getNumberOfFiles(response);

      //Initialize the number of written files
      writtenFiles = 0;

      //Create the file structure at the given path... /tmp/code/
      createFileStructure(response, {array: ['/tmp', 'code']}, function(runFilePath){
        runTheCode(function(err, stdout, stderr){
          res.json({tree: response, err: err, stdout: stdout, stderr: stderr});
        })
      });
      
      //Delete everything after one hour
      setTimeout(function(){
        exec('rm -rf /tmp/code/' + response.name.replace(' ', '\\ '));
      },3600000);
    }
  })
});

// return
module.exports = router;
