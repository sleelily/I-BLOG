var mongoose = require('mongoose');


var MONGO_URI = process.env.MONGO_URI||"mongodb://127.0.0.1:27017/blog";
var options = {
  user : process.env.MONGO_USER||null,
  pass : process.env.MONGO_PASS||null
}

var db = mongoose.connect(MONGO_URI,options);

module.exports = db;