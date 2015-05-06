var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var commentSchema = new Schema({
  owe:String,
  name:String,
  time:String,
  content:String
});

var Comment = mongoose.model('comments',commentSchema);

module.exports = Comment;