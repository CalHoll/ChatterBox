$( document ).ready(function() {

  $('.submitButton').on('click', function(event) {
    app.renderMessage();
  });

    ////////////////////////////////////////////////////////////////////////////

  // $('.username').on('click', function() {
  //   $(this).closest('.chat').addClass('friend');
  //   // app.handleUsernameClick();
  // });


  $('.chat').on('mousedown', function() {
    $(this).addClass('friend');
    // app.handleUsernameClick();
  });

  $('.clearMessages').on('click', function() {
    app.clearMessages();
  });

});
