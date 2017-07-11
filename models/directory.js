/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var File

var ObjectId = Schema.Types.ObjectId;
/**
 * Project Schema
 */
var DirectorySchema = new Schema({
  dirname : String,
  parent : ObjectId,
  // children : [{
  // 	type : String,
  // 	Id : ObjectId
  // }]
  roles : {
    authors : [ObjectId],
    admins : [ObjectId],
    editors : [ObjectId],
    reviewers : [ObjectId],
    viewers : [ObjectId]
  },
  defaultLevel : Number,
  childDirs : [{type : ObjectId, ref : 'Directory'}],
  childFiles : [{type : ObjectId, ref : 'File'}]
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
DirectorySchema.plugin(deepPopulate, {});

/**
 * Project Methods
 */

module.exports = mongoose.model('Directory', DirectorySchema);
