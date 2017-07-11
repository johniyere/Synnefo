/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ObjectId = Schema.Types.ObjectId;
/**
 * File Schema
 */
var FileSchema = new Schema({
  parentId : ObjectId,
  dirId : ObjectId,
  filename : String,
  roles : {
    authors : [ObjectId],
    admins : [ObjectId],
    editors : [ObjectId],
    reviewers : [ObjectId],
    viewers : [ObjectId]
  },
  defaultLevel : Number,
  sourceCode : String,
  comments : [{
    blockname : String,
    Id : ObjectId
  }]
});

module.exports = mongoose.model('File', FileSchema);
