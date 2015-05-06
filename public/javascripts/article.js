$(function(){
  $.ajax({
    type:"POST",
    url:location.pathname,
  }).done(function(data){

    var item=data;

    var $author=$('<a href="'+item.author.link+'"></a>');

    var $tag=$('<a href="'+item.type+'"></a>');

    var $title=$('<a id="title" href="'+item._id+'"></a>');
    
    var $content=$('<div class="content"></div>');
    
    var $time=$('<span class="time"></span>');
    
    var $now=new Date();
    $now=$now.getTime();
    $author.html(item.author.name);
    $title.html(item.title);
    var tag=(item.type=="tech")?"教程":"问答";
    $tag.html(tag);

    
    var itemTime=item.time;
    var time=($now-itemTime>86400000)?parseInt(($now-itemTime)/86400000)+"天前":parseInt(($now-itemTime)/3600000)+"小时前";

    $time.html("发表于"+time);
    $time.prepend($author);

    $('h3 span').append($tag);
    $('h1.title').html($title);
    $('div.contents').html(item.content);
    $('div.time').html($time);
  
  });

  // var getComments=$.ajax({
  //   type : "GET",
  //   url : "/comment"
  // }).done(function(data){

  // });

  $('#submitComment').bind("click",function(){
    var $now=new Date();
    $now=$now.getTime();

    var comment = {
        owe:$('#title').attr("href"),
        name:$('#user').attr("href"),
        time:$now,
        content:$('#commentContent').val()
    };
    console.log(comment);
    $.ajax({
      url:'/comment',
      type:'POST',
      data:comment
    }).done(function(data){

      var comment = data;

      var cName = comment.name;

      var cContent = comment.content;

      var cTime =($now-comment.time>86400000)?parseInt(($now-comment.time)/86400000)+"天前":parseInt(($now-comment.time)/3600000)+"小时前";;

      var $cCell = $('<div class="cCell"></div>');
      var $cName = $('<a class="cName" href='+cName+'></a>');
      var $cContent = $('<span class="cContent"></span>');
      var $cTime = $('<span class="cTime"></span>');

      $cName.html(cName);
      $cContent.html(cContent);
      $cTime.html(cTime);
      $cCell.append($cName,$cContent,$cTime);
      $('div.cList').prepend($cCell);
    })
  })
});