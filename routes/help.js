var express = require('express');
var router = express.Router();

/* GET help page. */
router.get('/', function(req, res, next) {
  res.render('help', { title: 'help', path : '/help' });
});

// return
module.exports = router;