var File = require('./file.js');
var Directory = require('./directory.js');
var User = require('./user.js');
var Account = require('./account');
var mongoose = require('mongoose');

var fs = require('fs');

var dbController = {};

dbController.dbConnection = {};

dbController.chechRole = function (object, user) {
  if (!user) return 6; //Unauthorized

  var privacy = object.roles;
  var id = user._id;

  if (privacy.authors.indexOf(id) != -1) return 0;
  if (privacy.admins.indexOf(id) != -1) return 1;
  if (privacy.editors.indexOf(id) != -1) return 2;
  if (privacy.reviewers.indexOf(id) != -1) return 3;
  if (privacy.viewers.indexOf(id) != -1) return 4;
  return object.defaultLevel;
}

dbController.getProjectNamesByRole = function (role, user, callback) {
  if(!user) return callback("Log in first",null);
  Directory.find({parent : null},function (err, projects){
    var names = [];
    for (var v in projects)
    {
      if (dbController.chechRole(projects[v], user) == role)
        names.push(projects[v].dirname);
    }
    callback(null,names);
  })
}

dbController.connect = function (callback) {
  mongoose.connect('mongodb://localhost/synnefo');

  dbController.dbConnection = mongoose.connection;
  dbController.dbConnection.on('error', callback.bind(console, 'connection error:'));
  dbController.dbConnection.once('open', callback);
}

dbController.createProject = function(name,user,callback) {
  //Check if exists
  if(!user) return callback("Log in first",null);


  Directory.find({dirname : name, parent : null}, function (err,dirs){
    if (err) return callback(err);
    if (dirs.length > 0) return callback("Directory with this name already exists",null);

    //Create new
    var newProject = new Directory({dirname : name, parent : null, roles : { authors : [user._id] }, defaultLevel : 4});
    newProject.save(function (err,newProject) {
      if (err) return callback(err);
      callback(null,newProject);
    })
  })
}

var deleteFileRecursively = function(file){
  for (var v in file.comments)
  {
    File.findById(file.comments[v].Id, function(err,_file){
      deleteFileRecursively(_file);
    })
  }
  file.remove();
}

var deleteDirRecursively = function(dir){
  //All files
  for (var v in dir.childFiles){
    File.findById(dir.childFiles[v],function(err,_file){
      deleteFileRecursively(_file);
    })
  }
  //All dirs
  for (var v in dir.childDirs){
    Directory.findById(dir.childDirs[v],function(err,_dir){
      deleteDirRecursively(_dir);
    })
  }
  //Self
  dir.remove();
}

dbController.deleteDirectory = function(dir,user,callback){
  var levelRequired = (dir.parent == null) ? 0 : 2;
  if (dbController.chechRole(dir, user) > levelRequired) return callback("No permissions", null);

  deleteDirRecursively(dir);
  callback(null,"OK");
}

dbController.deleteFile = function(file,user,callback){
  var levelRequired = 2;
  if (dbController.chechRole(file, user) > levelRequired) return callback("No permissions", null);

  deleteFileRecursively(file);
  callback(null,"OK");
}


dbController.createDirectory = function(parent,name,user,callback){
  //Check if exists
  if (dbController.chechRole(parent, user) > 2) return callback("No permissions", null);

  var _roles = {
    authors : parent.roles.authors.slice(0),
    admins : parent.roles.admins.slice(0),
    editors : parent.roles.editors.slice(0),
    reviewers : parent.roles.reviewers.slice(0),
    viewers : parent.roles.viewers.slice(0),
  };
  _roles.authors.push(user._id);

  Directory.find({dirname : name, parent : parent._id}, function (err,dirs){
    if (err) return callback(err);
    if (dirs.length > 0) return callback("Directory with this name already exists",null);

    //Create new
    var newDir = new Directory({dirname : name, parent : parent._id, roles : _roles, defaultLevel : parent.defaultLevel});
    newDir.save(function (err,newDir) {
      if (err) return callback(err);
      parent.childDirs.push(newDir._id);
      parent.save(function (err,parent){
        if (err) return callback(err);
        callback(null,newDir);
      })
    })
  })
}

dbController.uploadFile = function(dir,filename,filepath,user,callback) {
  if (dbController.chechRole(dir, user) > 2) return callback("No permissions", null);

  fs.readFile(filepath, function(err, fileData){
    if (err) return callback(err);
    dbController.createFile(dir,filename,user, function (err, file){
      if (err) return callback(err);
      file.sourceCode = fileData;
      file.save(function(err, file){
        callback(err,file);
        // console.log(file);
        // wait = false;
      })
    })
  })
}

dbController.createFile = function(dir,name,user,callback) {
  //Check if exists
  if (dbController.chechRole(dir, user) > 2) return callback("No permissions", null);

  var _roles = {
    authors : dir.roles.authors.slice(0),
    admins : dir.roles.admins.slice(0),
    editors : dir.roles.editors.slice(0),
    reviewers : dir.roles.reviewers.slice(0),
    viewers : dir.roles.viewers.slice(0),
  };
  _roles.authors.push(user._id);

  File.find({filename : name, dirId : dir._id}, function (err, files){
    if (err) return callback(err);
    if (files.length > 0) return callback("File with this name already exists within this project",null);

    //Create new
    var newFile = new File({filename : name, dirId : dir._id, roles : _roles, defaultLevel : dir.defaultLevel});
    newFile.save(function (err,newFile) {
      if (err) return callback(err);
      // dir.children.push({Id : newFile._id, type : 'file'});
      dir.childFiles.push(newFile._id);
      dir.save(function (err,project) {
        if (err) return callback(err);
        callback(null,newFile);
      })
    })
  })
}

dbController.updateFile = function(file,sourceCode,user,callback) {
  if (dbController.chechRole(file, user) > 2) return callback("No permissions", null);
  file.sourceCode = sourceCode;
  file.save(function (err,_file){
    if (err) return callback(err);
    callback(null,_file);
  })
}

dbController.attachComment = function(parent,blockname,user,callback) {
  if (dbController.chechRole(parent, user) > 3) return callback("No permissions", null);
  
  var _roles = {
    authors : parent.roles.authors.slice(0),
    admins : parent.roles.admins.slice(0),
    editors : parent.roles.editors.slice(0),
    reviewers : parent.roles.reviewers.slice(0),
    viewers : parent.roles.viewers.slice(0),
  };
  _roles.authors.push(user._id);

  newComment = new File({filename : "<comment>", 
                         parentId : parent._id,
                         roles : _roles,
                         defaultLevel : parent.defaultLevel});
  newComment.save(function (err,newComment){
    if (err) return callback(err);
    parent.comments.push({blockname : blockname, Id : newComment._id});
    parent.save(function (err,parent){
      if (err) return callback(err);
      callback(null,newComment);
    })
  });
}

var _populateFileTree = function(dir,callback) {

  dir.populate('childDirs childFiles', function (err, _dir) {
    // console.log(_dir);

    if (err) return callback(err);
    // console.log(_dir);
    var resultTree = {
      name : _dir.dirname,
      type : 'Directory',
      children : [],
      id : _dir._id,
    };
    //Add files
    for (var index in _dir.childFiles)
    {
        //Added content here. If problems swear at Cristian
        resultTree.children.push({
        name : _dir.childFiles[index].filename,
        type : 'File',
        id : _dir.childFiles[index]._id,
        content: _dir.childFiles[index].sourceCode
      })
    }
    // console.log(resultTree);

    var _callback = function(err, result){
      resultTree.children.push(result);
      count--;
      if(count == 0)
        callback(null,resultTree);
    }

    var count = _dir.childDirs.length;
    if(count == 0) callback(null,resultTree);
    for (var v in _dir.childDirs)
    {
      _populateFileTree(_dir.childDirs[v],_callback);
    }

    // callback(null,resultTree);
  });
}

dbController.getFileTree = function(dirname,user,callback) {
  Directory.findOne({dirname : dirname}, function(err,dir)
  {
    if(dir == null) return callback("Directory does not exist");
    if (dbController.chechRole(dir, user) > 4) return callback("No permissions", null);

    if (err) return callback(err);
    if (!dir) return callback(null,{
      name : dirname,
      type : 'Directory',
      id : dir._id
    })
    _populateFileTree(dir,callback);
  })
  // { name: 'Test',
  // type: 'Directory',
  // children:
  //  [ { name: 'TestDir', type: 'Directory', children: [Object] },
  //    { name: 'testFile1', type: 'File' } ] }
}

// @todo: Probably move this into account.js, but I'm just following the established practice.
dbController.createAccount = function(fullname, username, email, password, callback) {
  Account.find({ email : email }, function(err, users) {
    if (err) return callback(err);
    if (users.length > 0) return callback("Account with this email address already exists");

    // @todo: Should probably encrypt/hash passwords???
    var account = new Account({ email : email, fullname : fullname, password : password });
    account.save(function(err) {
      if (err) return callback(err);
      callback(null, account);
    });
  });
};

var roleByNumber = function(object, number)
{
  number = parseInt(number);
  switch(number)
  {
    case 0:
      return object.roles.authors;
      break;
    case 1:
      return object.roles.admins;
      break;
    case 2:
      return object.roles.editors;
      break;
    case 3:
      return object.roles.reviewers;
      break;
    case 4:
      return object.roles.viewers;
      break;
  }
}

var updateDefaultRoleRecursively = function(object, role, callback){
  //Push userId
  object.defaultLevel = role;

  var count = 0;
  var length = 0;
  if(object.childDirs) length += object.childDirs.length;
  if(object.childFiles) length += object.childFiles.length;
  if(object.comments) length += object.comments.length;

  if(length == 0) callback();

  var _callback = function(err)
  {
    if(err) callback(err);
    count++;
    if(count == length) callback();
  }

  object.save(function(err, result){
    if(err) callback(err);

    for (var dirId in object.childDirs)
    {
      Directory.findById(object.childDirs[dirId], function(err,dir)
      {
        if(err) callback(err);
        if(dir) updateDefaultRoleRecursively(dir, role, _callback);
      })
    }

    for (var fileId in object.childFiles)
    {
      File.findById(object.childFiles[fileId], function(err,file)
      {
        if(err) callback(err);
        if(file) updateDefaultRoleRecursively(file, role, _callback);
      })
    }

    for (var comment in object.comments)
    {
      File.findById(object.comments[comment].Id, function(err,file)
      {
        if(err) callback(err);
        if(file) updateDefaultRoleRecursively(file, role, _callback);
      })
    }
  })
}

var removeUserAsRoleRecursively = function(object, userId, role, callback){
  var roles = roleByNumber(object, role);
  //Push userId
  if(roles.indexOf(userId) != -1) roles.splice(roles.indexOf(userId),1);

  var count = 0;
  var length = 0;
  if(object.childDirs) length += object.childDirs.length;
  if(object.childFiles) length += object.childFiles.length;
  if(object.comments) length += object.comments.length;

  if(length == 0) callback();

  var _callback = function(err)
  {
    if(err) callback(err);
    count++;
    if(count == length) callback();
  }

  object.save(function(err, result){
    if(err) callback(err);

    for (var dirId in object.childDirs)
    {
      Directory.findById(object.childDirs[dirId], function(err,dir)
      {
        if(err) callback(err);
        if(dir) removeUserAsRoleRecursively(dir, userId, role, _callback);
      })
    }

    for (var fileId in object.childFiles)
    {
      File.findById(object.childFiles[fileId], function(err,file)
      {
        if(err) callback(err);
        if(file) removeUserAsRoleRecursively(file, userId, role, _callback);
      })
    }

    for (var comment in object.comments)
    {
      File.findById(object.comments[comment].Id, function(err,file)
      {
        if(err) callback(err);
        if(file) removeUserAsRoleRecursively(file, userId, role, _callback);
      })
    }
  })
}

var addUserAsRoleRecursively = function(object, userId, role, callback){
  var roles = roleByNumber(object, role);
  //Push userId
  if(roles.indexOf(userId) == -1) roles.push(userId);

  var count = 0;
  var length = 0;
  if(object.childDirs) length += object.childDirs.length;
  if(object.childFiles) length += object.childFiles.length;
  if(object.comments) length += object.comments.length;

  if(length == 0) callback();

  var _callback = function(err)
  {
    if(err) callback(err);
    count++;
    if(count == length) callback();
  }

  object.save(function(err, result){
    if(err) callback(err);

    for (var dirId in object.childDirs)
    {
      Directory.findById(object.childDirs[dirId], function(err,dir)
      {
        if(err) callback(err);
        if(dir) addUserAsRoleRecursively(dir, userId, role, _callback);
      })
    }

    for (var fileId in object.childFiles)
    {
      File.findById(object.childFiles[fileId], function(err,file)
      {
        if(err) callback(err);
        if(file) addUserAsRoleRecursively(file, userId, role, _callback);
      })
    }

    for (var comment in object.comments)
    {
      File.findById(object.comments[comment].Id, function(err,file)
      {
        if(err) callback(err);
        if(file) addUserAsRoleRecursively(file, userId, role, _callback);
      })
    }
  })
}

dbController.addUserAsRole = function(object, userId, role, user, callback) {
  if (dbController.chechRole(object, user) > 1) return callback("No permissions", null);
  removeUserAsRoleRecursively(object,userId,0,function(err){
    if(err) return callback(err);
    removeUserAsRoleRecursively(object,userId,1,function(err){
      if(err) return callback(err);
      removeUserAsRoleRecursively(object,userId,2,function(err){
        if(err) return callback(err);
        removeUserAsRoleRecursively(object,userId,3,function(err){
          if(err) return callback(err);
          removeUserAsRoleRecursively(object,userId,4,function(err){
            if (role > 4) {
              return callback(null,"OK");
            }
            addUserAsRoleRecursively(object,userId,role,function(err){
              if(err) return callback(err);
              return callback(null,"OK");
            });
          });
        });
      });
    });
  });
}

dbController.removeUserAsRole = function(object, userId, role, user, callback) {
  if (dbController.chechRole(object, user) > 1) return callback("No permissions", null);
  if (role > 4) {
    return callback(null,"OK");
  }
  removeUserAsRoleRecursively(object,userId,role,function(err){
    if(err) return callback(err);
    callback(null,"OK");
  });
}

dbController.updateDefaultLevel = function(object, role, user, callback) {
  if (dbController.chechRole(object, user) > 1) return callback("No permissions", null);
  updateDefaultRoleRecursively(object,role,function(err){
    if(err) callback(err);
    callback(null,"OK");
  });
}

dbController.findUsers = function(filter, user, callback) {
  if(!user) return callback("Log in first",null);
  User.find(filter).exec(callback);
}

module.exports = dbController