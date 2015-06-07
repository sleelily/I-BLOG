/* global process */
//https://sleelily.herokuapp.com/ | https://git.heroku.com/sleelily.git
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var MongooseStore = require('mongoose-store')(session);
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();        //创建一个EXPRESS应用
app.set('env','green');
var mongooseStore = new MongooseStore({
  url: process.env.MONGO_URI||'mongodb://127.0.0.1:27017/blog',
  ttl: 3600
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));        //设定模板路径
app.set('view engine', 'jade');         //设定模板引擎

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, 'public')));        //设定静态文件夹'public
app.use(logger('dev'));     //使用日志记录中间件logger()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("my-secret-string"));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: mongooseStore
}));

app.use(flash());



app.use(routes);       //路由"/"路径请求到routes
//app.use('/users', users);       //路由"/users"路径请求到users

// catch 404 and forward to error handler
app.use(function(req, res, next) {      //如果所有路由均不匹配路径，则返回"404 Not Found"
    var err = new Error('Not Found');
    err.status = 404;
    next(err);      //将错误信息交由下一个中间件
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {     //如果是开发模式，将错误显示
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);      //承接上一个中间件的error状态码，若没有则直接返回500
    res.render('error', {       //渲染"error"模板，将错误信息作为本地变量传递给模板
        message: err.message,
        error: {}
    });
});

app.use(function(req,res,next){
  res.locals.user=req.session.user;

  var error = req.flash('error');
  var success = req.flash('success');

  res.locals.error = error.length ? error : null;
  res.locals.success = success.length ? success : null;
   
  next();
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  console.log("server is listening port"+app.get('port'));
});

module.exports = app;
