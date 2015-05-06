$(function(){
  $.ajax({
    type:"POST",
    url:location.pathname,
  }).done(function(data){

    for (var i = data.length - 1; i >= 0; i--) {
      var item=data[i];
      var $author=$('<a class="author" href="'+item.author.link+'"></a>');
      var $topic=$('<div class="topic"></div>');
      var $title=$('<a href="'+item._id+'"></a>');
      var $tag=$('<span class="tag"></span>');
      var $time=$('<span class="time"></span>');
      var $item=$('<div class="item"></div>');
      var $now=new Date();
      $now=$now.getTime();

      $author.html(item.author.name);
      $topic.append(
        $tag.html(item.type),
        $title.html(item.title)
      );
      
      var itemTime=item.time;
      //console.log(itemTime);
      var time=($now-itemTime>86400000)?parseInt(($now-itemTime)/86400000)+"天前":parseInt(($now-itemTime)/3600000)+"小时前";
      $time.html(time);

      $item.append(
        $($author),$($tag),$($topic),$($time)
      );
      //$('span.content').html(item.content)
      $('div.list').append($item);
    };
  });
});