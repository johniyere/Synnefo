'use strict';

var mongoose = require('mongoose');
var bCrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var fs = require('fs');

var isValidPassword = function(user, password) {
  return bCrypt.compareSync(password, user.password);
};

var createHash = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

var UserSchema = mongoose.Schema({
  id: String,
  username: String,
  password: String,
  email: String,
  firstName: String,
  lastName: String,
  icon: String
});


function iconNameToPath(name) {
		return 'storage/userIcons/' + name;
}

/**
 * @todo: Add validation for the image
 * @todo: Re-encode image as jpeg
 * @todo: Resize image to square
 */
UserSchema.methods.updateProfilePicture = function(tempPathForPicture, done) {
	/*
	1. Take path of uploaded temporary file for new profile picture DONE
	2. Validation???? SKIP
	2. Create a unique name for the file based on time, random number, and user ID DONE
	3. Copy file from temporary path to new path DONE
	4. Update icon in database DONE
	5. Delete old icon file DONE
	*/
	var user = this;

	var uniqueNameSeed = '' + (new Date().valueOf()) + Math.random() + this.id;
	var uniqueName = crypto.createHash('md5').update(uniqueNameSeed).digest('hex') + '.jpg';

	var source = fs.createReadStream(tempPathForPicture);
	var dest = fs.createWriteStream(iconNameToPath(uniqueName));

	source.pipe(dest);
	source.on('end', function() {
		var oldIcon = user.icon;
		user.icon = uniqueName;

		user.save(function(err) {
			if (err) {
				console.error('Error in saving user ' + err);
				throw err;
			}

			fs.unlink(tempPathForPicture, function(err) {
				if (err) {
					console.error('Error in deleting temp file ' + err);
					throw err;
				}

				if (!oldIcon) {
					return done(null);
				}

				fs.unlink(iconNameToPath(oldIcon), function(err) {
					if (err) {
						console.error('Error in deleting old file ' + err);
						throw err;
					}

					done(null);
				})
			});
		});
	});
	source.on('error', done);
};

UserSchema.methods.getIconURL = function() {
	if (!!this.icon){
		return '/profilephoto/view/' + this.icon;
	}
	else{
		return '/profilephoto/view/default.jpg';
	}
};

UserSchema.methods.updatePassword = function(oldPassword, newPassword, done) {
	if (!isValidPassword(this, oldPassword)) {
		return done('Old password not correct');
	}

	this.password = createHash(newPassword);

	this.save(function(err) {
		if (err) {
			console.error('Error in saving user ' + err);
			throw err;
		}
		done(this);
	});
};

module.exports = mongoose.model('User', UserSchema);