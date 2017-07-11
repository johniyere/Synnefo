// acquire packages
var express = require('express');
var router = express.Router();

//authentication middleware
var isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated())
    return next();
  res.redirect('/login');
}

/* GET upload page. */
router.get('/', isAuthenticated, function(req, res, next) {
  res.render('upload', { title: 'Upload a Profile Photo', path : '/imgupload' });
});

// Send file info to console.
router.post('/', isAuthenticated, function(req, res) {
  var file = req.files.filter(function(file) {
    return file.fieldname === 'multiInputFileName[]';
  })[0];

  if (!file) {
    return res.end('Upload a square image!');
  } else {
    req.user.updateProfilePicture(file.path, function(err, result) {
      if (err) {
        return res.end(err);
      }
      res.redirect('/projects');
    });
  }

});

// return
module.exports = router;
