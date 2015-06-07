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
  var page = req.query.p?parseInt(req.query.p):0;
  var type = req.query.tag?req.query.tag:null;
  var user = req.session.user;
  var query = type?{type:type}:{};
  post.find(query,null,{skip:10*page,limit:10,sort:{'tag':-1}},function(err,posts){
    if(err){
      console.log(err);
    }
    var posts = posts;
    res.render('index',{
      title:"I博客",
      user:user,
      head:req.session.head,
      page:page,
      posts:posts,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  });
})

router.route('/reg')
.post(function(req, res, next) {
  if (req.body['password'] != req.body['password-repeat']) {
    req.flash('error',"两次输入的密码不一致!");
    return res.redirect('/');
  } else{
    var password = crypto.createHash('md5').update(req.body.password).digest('hex');
    var username = req.body.username;
    var email = req.body.email;
    var email_MD5 = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    var head = "http://gravatar.duoshuo.com/avatar/" + email_MD5;
    var newUser = new user({
      name : username,
      password : password,
      email : email,
      head : head
    });
    user.findOne({name:newUser.name},function(err,theUser){
      if(theUser){
        req.flash('error',"该用户名已存在!");
        res.redirect('/');
      }else{
        newUser.save(function (err,user) {
          if (err){
            console.log (err);
          }
          req.session.user = newUser.name;
          req.session.head = newUser.head;
          req.flash('success',"注册成功!");
          res.redirect('/');
        });
      }
    });
  }; 
});

router.route('/login')
.post(function(req, res, next) {
  var password = crypto.createHash('md5').update(req.body.password).digest('hex');
  var username = req.body.username;
  console.log("username:"+username+"\n"+"password:"+password);
  user.findOne({name:username},function(err,theUser){
    if(!theUser){
      req.flash('error',"该用户不存在!");
      return res.redirect('/');
    }else{
      if (password != theUser.password) {
        req.flash('error',"密码错误,请核对!");
        return res.redirect('/');
      } else{
        req.session.user = theUser.name;
        req.session.head = theUser.head;
        req.flash('success',"登陆成功！");
        res.redirect('/');
      };  
    }
  });
});

router.route('/out')
.get(function(req, res, next){
  req.session.user = null;
  req.flash('success',"安全退出");
  res.redirect('/');
})

router.route('/post')
.get(function(req, res, next) {
  var name = req.session.user;
  if(name){
    res.render('post',{
      title:"发表博客",
      user:req.session.user,
      head:req.session.head,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    });
  }else{
    res.redirect('/');
  }
})
.post(function(req, res, next){
  console.log(req.body);
  var title = req.body.title;
  var type = req.body.tag;
  var article = req.body.content;
  var author = req.session.user;
  var headLink = {};
  var time = new Date();
      time=time.getTime();

  article=marked(article,function(err,content){
    return content;
  });
  
  user.findOne({name:author},function(err,theUser){
    headLink.name=theUser.name;
    headLink.link=theUser.head;
    console.log(article);
    var newPost = new post({
      title : title,
      type : type,
      time : time,
      author: headLink,
      content : article
    });

    newPost.save(function (err,post) {
      if (err){
        console.log ('Error on save!');
      }
      res.redirect('/'+post._id);
    });
  });
});

router.route('/u/:username')
.get(function(req, res, next) {
  var name = req.params.username;
  user.findOne({name:name},function(err,theUser){
    if(err){
      console.log(err);
    }
    post.find({'author.name':theUser.name},function(err,posts){
      if(err){
        console.log(err);
      }
      res.render("user",{
        user:req.session.user,
        head:req.session.head,
        theUser:theUser,
        posts:posts,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    })
  })
})

router.route(/\w{24}/)
.get(function(req, res, next){
  var id = req.path.substring(1);
  var move = req.query.move?req.query.move:null;
  var tag = req.query.tag?req.query.tag:null;
  var admin = req.session.user == 'admin'?true:false;
  if(admin){
    if(tag == '置顶'){
      post.findOne({_id:id},function(err,thePost){
        if(err)
          console.log(err);
        thePost.tag = tag;
        thePost.save();
        req.flash('success',"文章已置顶")
      })
    }
    if(tag == '取消'){
      post.findOne({_id:id},function(err,thePost){
        if(err)
          console.log(err);
        thePost.tag = null;
        thePost.save();
        req.flash('success',"取消置顶")
      })
    }
    if(tag == '精华'){
      post.findOne({_id:id},function(err,thePost){
        if(err)
          console.log(err);
        thePost.type = tag;
        thePost.save();
        req.flash('success',"文章已加精！")
      })
    }
    if(move){
      post.remove({_id:id},function(err,thePost){
        if(err)
          console.log(err); 
      })
    }
  }
  post.findOne({_id:id},function(err,content){
    if(err){
      console.log(err);
    }else if(!content){
      req.flash('success',"文章已删除！");
      return res.redirect('/');
    }{
      res.render("article",{
        user:req.session.user,
        head:req.session.head,
        admin:admin,
        post:content,
        md:mark,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      });
    }
  })
});

router.route('/help')
.get(function(req, res, next){
  res.render('help',{
    title:'帮助文档',
    user:req.session.user,
    head:req.session.head,
    success:req.flash('success').toString(),
    error:req.flash('error').toString()
  })
})

module.exports = router;

var mark = function(val){
  return marked(val,function(err,string){
    if(err){
      console.log(err);
    }
    return string;
  });
};
