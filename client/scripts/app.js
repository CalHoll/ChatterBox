// YOUR CODE HERE:
// Note: The url you should be using is https://api.parse.com/1/classes/messages

// api quick reference for objects:
// https://parseplatform.github.io/docs/rest/guide/#quick-reference

var app = {

  chatCount : 0,
  lastMessageId : 0,
  server : 'http://127.0.0.1:3000',
  roomname: 'lobby',
  messages : [],
  roomList : [],
  friends : {},

  init : function() {
    // Get username
    app.username = window.location.search.substr(10);

    // Cache jQuery selectors
    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');

    // Add listeners
    app.$chats.on('click', '.username', app.handleUsernameClick);
    app.$send.on('submit', app.handleSubmit);
    app.$roomSelect.on('change', app.handleRoomChange);

    // Fetch previous messages
    app.startSpinner();
    app.fetch(false);

    // Poll for new messages
    setInterval(function() {
      app.fetch(true);
    }, 3000);

  },

//////////////////////////////////////////////////////////////////////////
  fetch: function(animate) {
    // perform the AJAX and display the library of chat messages
    $.ajax({
      url: app.server,
      type: 'GET',
      // data: { order: '-createdAt' },
      data: '/classes/messages',
      contentType: 'application/json',
      success: function (data) {

        // console.log('chatterbox: Message sent');
        // console.log("message array = " + data.results);

        // Don't bother if we have nothing to work with
        if (!data.results || !data.results.length) { return; }

        // Store messages for caching later
        app.messages = data.results;

        // Get the last message
        var mostRecentMessage = data.results[data.results.length - 1];

        // Only bother updating the DOM if we have a new message
        if (mostRecentMessage.objectId !== app.lastMessageId) {
          // Update the UI with the fetched rooms
          app.renderRoomList(data.results);

          // Update the UI with the fetched messages
          app.renderMessages(data.results, animate);

          // Store the ID of the most recent message
          app.lastMessageId = mostRecentMessage.objectId;
        }
      },
      error: function (errorString) { // is this a string?
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to receive data', errorString);
      }
    });
  },

////////////////////////////////////////////////////////////////////////

  renderMessages: function(messages, animate) {

    // Clear existing messages`
    app.clearMessages();
    app.stopSpinner();
    if (Array.isArray(messages)) {

      // Add all fetched messages that are in our current room
      messages.forEach((message) => {
        if (message.roomname === app.roomname || app.roomname === 'lobby' && !message.roomname) {
          app.renderMessage(message);
        }
      });
    }

    // Make it scroll to the top on receiving new messages
    if (animate) {
      $('body').animate({scrollTop: '0px'}, 'fast');
    }
  },

  renderMessage: function(message) {

    if (!message.roomname) {
      message.roomname = 'lobby';
    }

    // Create a div to hold the chats
    var userText = filterXSS(message.text);
    var username = filterXSS(message.username);
    var roomname = filterXSS(message.roomname);

    var $chat = $(
      `
      <div class="chat">
        <span class="username" data-roomname=${roomname} data-username=${username}>
          ${username}:
        </span>
          Room: ${roomname}
        <p class="chatText"> <br>
           ${userText}
        </p>
      </div>
      `
    );

    // Add the friend class
    if (app.friends[username] === true) {
      $chat.find('span').addClass('friend');
    }

    // Add the message to the UI
    app.$chats.append($chat);

  },

  send : function(message) {
    app.startSpinner();

    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        // console.log('chatterbox: Message sent, data returned: ' + JSON.stringify(data));
        app.$message.val('');

        // Trigger a fetch to update the messages, pass true to animate
        app.fetch();
      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/ console.error
        console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  clearMessages: function() {
    $('#chats').children().remove();
  },

  renderRoom: function(room) {
    // room argument already sanitized using XSS library
    var $room = $('<option value="' + room + '">' + room + '</option>');
    app.$roomSelect.append($room);
  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="__newRoom">New room...</option>');

    if (messages) {
      var rooms = {};
      messages.forEach(function(message) {
        var roomname = message.roomname;
        if (roomname && !rooms[roomname]) {
          // Add the room to the select menu
          app.renderRoom(roomname);

          // Store that we've added this room already
          rooms[roomname] = true;
        }
      });
    }

    // Select the menu option
    app.$roomSelect.val(app.roomname);
  },

  handleUsernameClick: function(event) {                          // taken from solution, need to review

    var username = $(event.target).data('username');

    if (username !== undefined) {
      // Toggle friend
      app.friends[username] = !app.friends[username];

      // Escape the username in case it contains a quote
      var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';

      // Add 'friend' CSS class to all of that user's messages
      var $usernames = $(selector).toggleClass('friend');
    }
  },

  handleSubmit: function(event) {
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };

    app.send(message);

    // Stop the form from submitting
    event.preventDefault();
  },

  handleRoomChange: function(event) {
    var selectIndex = app.$roomSelect.prop('selectedIndex');
    // New room is always the first option
    if (selectIndex === 0) {
      var roomname = prompt('Enter room name');
      if (roomname) {
        // Set as the current room
        app.roomname = roomname;

        // Add the room to the menu
        app.renderRoom(roomname);

        // Select the menu option
        app.$roomSelect.val(roomname);
      }
    } else {
      app.startSpinner();
      // Store as undefined for empty names
      app.roomname = app.$roomSelect.val();
    }
    // Rerender messages
    app.renderMessages(app.messages);
  },


  startSpinner: function() {
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', 'true');
  },

  stopSpinner: function() {
    $('.spinner img').fadeOut('fast');
    $('form input[type=submit]').attr('disabled', null);
  }

};
