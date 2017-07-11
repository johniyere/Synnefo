var express = require('express');
var router = express.Router();

var isAuthed = function(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/login');
	}
}

/* GET profile page. */
router.get('/', isAuthed, function(req, res, next) {
  res.render('profile', {
  	title: 'profile'
  	//, path : '/profile'
  });
});

// return
module.exports = router;