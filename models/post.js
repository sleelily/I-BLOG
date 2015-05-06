var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//定义博文模型：标题、类型、作者、内容
var postSchema = new Schema({
  title:String,
  type:String,
  time:String,
  author:Object,
  content:String
});

var Post = mongoose.model('posts',postSchema);

module.exports = Post;