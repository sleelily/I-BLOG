var fs = require('fs');
var marked = require('marked');

fs.readFile('../public/markedfile/help.md','utf-8',function(err,data){
  if (err) {
    throw err;
  } else{
    marked(data,function(err,content){
      if (err) {
        console.log(err);
      } else{
        console.log(content);
      };
    })
  };
});


