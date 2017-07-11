/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;

var AccountSchema = new Schema({
	accountId : ObjectId,
	email : String,
	username : String,
	password : String,
	fullname : String
});

AccountSchema.statics.login = function(email, password, callback) {
	this.find({ email : email, password : password }, function(err, users) {
		if (err) return callback(err);
		if (users.length === 0) return callback("Email or password incorrect");

		callback(null, users[0]);
	});
}

module.exports = mongoose.model('Account', AccountSchema);