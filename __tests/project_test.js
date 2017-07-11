// require('../config.js');
var db = require('../models/db.js');

var errorReportAndClose = function(err){
  console.error(err);
  db.dbConnection.close(function(){
    console.log("Test finished");
  });
}

//1. Create project
//2. Create file
//3. Create another one
//4. Attach comment
var createTestStructure = function() {
  db.connect(function(err){
    if (err) return errorReportAndClose(err);
    console.log("==Connection opened");
    db.createProject('Test', function (err, project){
      if (err) return errorReportAndClose(err);
      console.log('==Test project created')
      console.log(project)
      db.createFile(project, 'test.py', function (err, file){
        if (err) return errorReportAndClose(err);
        console.log('==Test.py created')
        console.log(file);
        db.createDirectory(project,"newDir", function (err, dir){
          if (err) return errorReportAndClose(err);
          console.log('==newDir created')
          console.log(dir);
          db.createFile(dir, 'test2.py', function (err, file){
            if (err) return errorReportAndClose(err);
            console.log('==Test2.py in newDir created')
            console.log(file);
            db.attachComment(file, "testBlock", "//Same crap here", function (err, comment){
              if (err) return errorReportAndClose(err);
              console.log('==Test2.py comment created')
              console.log(comment);
              db.dbConnection.close(function(){
                console.log("==Connection closed, test finished");
              });
            })
          });
        });
      });
    });
  })
}

var retriveDirectoryTest = function() {
  db.connect(function(err){
    if (err) return errorReportAndClose(err);
    console.log("==Connection opened");
    db.getFileTree("Test",function(err,tree) {
      console.log("==Test tree retrieved");
      console.log(tree)
      db.dbConnection.close(function(){
        console.log("==Connection closed, test finished");
      });
    })
  })
}

var testDumb = function() {
  db.getFileTree('newD',function (err, tree){
    if (err) return errorReportAndClose(err);
    console.log(tree);
  })
}

createTestStructure();