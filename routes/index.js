/* 模块调用 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var marked = require('marked');
var user = require('../models/user.js');
var post = require('../models/post.js');
var comment = require('../models/comment.js');
var db = require('../models/db.js');

router.route('/')
.get(function(req, res, next) {
  if (req.session.name) {
    res.render('index',{title:"I博客",name:req.session.name});
  } else{
    res.render('index',{
      title:"I博客",
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  };
})
.post(function(req, res, next) {
  console.log("Receive POST message!");
  var Posts = [];
  post.find({},function(err,content){
    if(err){
      console.log(err);
    }
    for (var i = content.length - 1; i >= 0; i--) {
      var element = content[i];
      Posts.push(element);
    };
    res.send(Posts);
  });
});


router.route('/reg')
.get(function(req, res, next) {
  res.render('reg',{
    title:"注册",
    user:req.session.user,
    error:req.flash('error').toString(),
    success:req.flash('success').toString()
  });
})
.post(function(req, res, next) {
  if (req.body['password'] != req.body['password-repeat']) {
    req.flash('error',"两次输入的密码不一致!");
    return res.redirect('/reg');
  } else{
    var md5 = crypto.createHash('md5')
    ,username = req.body.username
    ,password = md5.update(req.body.password).digest('base64')
    ,email = req.body.email
    ,email_MD5 = md5.update(email.toLowerCase()).digest('hex')
    ,head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48"
    ,newUser = new user({
      name : username,
      password : password,
      email : email,
      head : head
    });
    user.findOne({name:newUser.name},function(err,user){
      if(user){
        req.flash('error',"该用户名已存在!");
        res.redirect('/reg');
      }else{
        newUser.save(function (err,user) {
          if (err){
            console.log (err);
          }
          req.session.user = user.name;
          req.flash('success',"注册成功!");
          res.redirect('/');
        });
      }
    });
  }; 
});

router.route('/login')
.get(function(req, res, next) {
  res.render('login',{
    title:"登陆",
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
})
.post(function(req, res, next) {
  
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('base64');
  var username = req.body.username;
  console.log("username:"+username+"\n"+"password:"+password);
  user.findOne({name:username},function(err,theUser){
    if(!theUser){
      req.flash('error',"该用户不存在!");
      return res.redirect('/login');
    }else{
      if (password != theUser.password) {
        req.flash('error',"密码错误,请核对!");
        return res.redirect('/login');
      } else{
        req.session.user = theUser.name;
        req.flash('success',"登陆成功！");
        res.redirect('/');
      };  
    }
  });
});

router.route('/u/:username/post')
.get(function(req, res, next) {
  var name = req.params.username;
  res.render('post',{
    title:"发表博客",
    name:name,
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
})
.post(function(req, res, next){
  var title = req.body.title;
  var type = req.body.type;
  var article = req.body.content;
  var author = req.params.username;
  console.log("author:"+author);
  var headLink = {};
  var time = new Date();

  article=marked(article,function(err,content){
    return content;
    console.log(content);
  })
  
  time=time.getTime();

  user.findOne({name:author},function(err,content){
    console.log("content:"+content+'\n'+"content.name:"+content.name);

    headLink.name=content.name;
    headLink.link='/'+content.name;
    console.log(article);
    var newPost = new post({
      title : title,
      type : type,
      time : time,
      author: headLink,
      content : article
    });
    console.log("newPost:"+newPost);
    newPost.save(function (err) {if (err) console.log ('Error on save!')});
    res.redirect('/');
  });
});

router.route('/u/:username')
.get(function(req, res, next) {
  var name = req.params.username;
  res.render("user",{
    username:name,
    name:name,
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
})
.post(function(req, res, next) {
    console.log("Receive POST message!");
    var Posts = [];
    var name = req.params.username;
    post.find({title:name},function(err,content){
      if(err){
        console.log(err);
      }
      for (var i = content.length - 1; i >= 0; i--) {
        var element = content[i];
        Posts.push(element);
      };
      console.log(Posts);
      res.send(Posts);
    });
});

router.route(/\w{24}/)
.get(function(req, res, next){
  res.render("article",{
    user:req.session.user,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  });
})
.post(function(req, res, next){
  var id = req.path.substring(1);
  post.findOne({_id:id},function(err,content){
    if(err){
        console.log(err);
    }
    res.send(content);
  })
});

router.route('/comment')
// .get(function(req, res, next){
//   var query = req.query.q;
//   comment.find({owe:q},function(err,comments){
//     if (err) {
//       console.log(err);
//     }else{
//       res.send(comments);
//     }
//   });
// })
.post(function(req, res, next){
  console.log("req.body:"+req.body);
  var owe = req.body.owe;
  var name = req.body.name;
  var time = new Date();
  var content = req.body.content;

  var newComment = new comment({
      owe : owe,
      name : name,
      time : time,
      content : content
  });

  console.log(newComment);

  newComment.save(function(err,comment){
    if (err) {
      console.log(err);
      res.redirect('/');
    } else{
      res.send(comment);
    };
  });
});

module.exports = router;

var mark = function(val){
  return marked(val,function(err,string){
    if(err){
      console.log(err);
    }
    return string;
  });
};
