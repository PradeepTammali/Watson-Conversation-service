var thumbsUp = false;
var thumbsDown = false;
$(function() {
    
    $(document).delegate(".chat-btn", "click", function(e) {
      var value = $(this).attr("chat-value");
      var name = $(this).html();
      $("#chat-input").attr("disabled", false);
    });
    
    $(document).delegate(".list-group-item", "click", function(e) {
      e.preventDefault();
      var evt = jQuery.Event("keydown");
      evt.keyCode = 13;
      $("#textInput").val($(this).text());
      $("#textInput").trigger(evt); 
    });

    $(document).delegate(".feedback-thumbs-up", "click",function(e) {
      if (e.type == "click") {
        $(this).css('color','green');
        $.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: 'http://127.0.0.1:8001/api/thumbs-up',
          data: '{"input":"thumbs-up"}',
          success: function(data) {
              try{
                  console.log(data);
              }catch(e){
                  console.log("some error occured while logging");
              }
          }
        });
        thumbsUp = true;
        $("i").removeClass("feedback-thumbs-up");
        $("i").removeClass("feedback-thumbs-down");
        // $(this).removeClass("feedback-thumbs-up");
        // $($($($($($(this).parent()).parent())).children()).children()).removeClass("feedback-thumbs-down");
      }
    });

    $(document).delegate(".feedback-thumbs-down", "click", function(e) {
      if (e.type == "click") {
        $(this).css('color','red');
        $.ajax({
          type: 'POST',
          contentType: 'application/json',
          url: 'http://localhost:8001/api/thumbs-down',
          data: '{"input":"thumbs-down"}',
          success: function(data) {
              try{
                  console.log(data);
              }catch(e){
                  console.log("some error occured while logging");
              }
          }
        });
        thumbsDown =  true;
        $("i").removeClass("feedback-thumbs-up");
        $("i").removeClass("feedback-thumbs-down");
        // $($($($($($(this).parent()).parent())).children()).children()).removeClass("feedback-thumbs-up");        
        // $(this).removeClass("feedback-thumbs-down");
      }
    });

    $("#chat-circle").click(function() {
      $("#chat-circle").toggle('scale');
      $(".chat-box").toggle('scale');
    });

    $(".chat-box-toggle").click(function() {
      $("#chat-circle").toggle('scale');
      $(".chat-box").toggle('scale');
    });
    
  });

  $('form').submit(function(e){
    if (!thumbsUp & !thumbsDown) {
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        url: 'http://localhost:8001/api/thumbs-up',
        data: '{"input":"thumbs-up"}',
        success: function(data) {
            try{
                console.log(data);
            }catch(e){
                console.log("some error occured while logging");
            }
        }
      });
    }
    e.preventDefault();
    var evt = jQuery.Event("keydown");
    evt.keyCode = 13;
    $("#textInput").trigger(evt);
    $("i").removeClass("feedback-thumbs-up");
    $("i").removeClass("feedback-thumbs-down");
    thumbsUp = false;
    thumbsDown = false;
  });