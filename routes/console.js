// acquire packages
var express = require('express');
var router = express.Router();
var compileAndRun = require('../libs/compilerun.js').compileAndRun;

var buildProject = function(){
  //We have to create the project files
  //and return the path to the temporary directory
  return "";
};

router.get('/', function(req, res){
  //return;

  console.log("Compile request for " + req.params.project);
  var path = buildProject(req.params.project);
  compileAndRun(req.params.file, path, function(stdout){
    res.json({out: stdout});
  });
});

module.exports = router;