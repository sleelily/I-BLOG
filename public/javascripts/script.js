$(function(){
  $('#topNav li').bind('click',function(){
    $('ul.nav li.active').removeClass('active');
    $(this).addClass('active');
  });
  $('ul.nav li a').each(function(){
    var href = $(this).attr("href");
    var path = location.pathname;
    if (href == path) {
      $(this).parent().addClass('active');
    };
  });

  $('div.alert').show( "slow",function(){
    $(this).animate({borderRadius:"2px"},500,"swing",setTimeout(function(){
      $('div.alert').animate({opacity:"0"},500);
    },3000))
  });
  $('#login-submit').bind('click',function(){
    $('#login-form').submit();
    this.preventDafult();
  });
  $('#register-submit').bind('click',function(){
    $('#register-form').submit();
    this.preventDafult();
  });
});