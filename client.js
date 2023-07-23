
$(document).ready(function() {
  let currentUser = null;

  function updateKeyColor(key, color) {
    $(key).css('background-color', color);
  }

  function acquireControl() {
    $.post('http://localhost:3000/acquire', { user: currentUser }, function(response) {
      if (response.success) {
        currentUser = response.user;
        alert('You have acquired control!');
      } else {
        alert('Failed to acquire control. Try again later.');
      }
    });
  }

  function handleKeyClick() {
    if (currentUser) {
      const key = $(this).data('key');
      // AJAX request to light/unlight the key
      $.post('http://localhost:3000/toggleKey', { user: currentUser, key: key }, function(response) {
        if (response.success) {
          updateKeyColor(`[data-key="${key}"]`, response.color);
        }
      });
    }
  }

  $('#acquireControlBtn').click(acquireControl);
  $('.key').click(handleKeyClick);


  function pollState() {
    $.get('http://localhost:3000/getState', { user: currentUser }, function(response) {
      if (response) {
        response.keyboard.forEach(({ key, color }) => {
          updateKeyColor(`[data-key="${key}"]`, color);
        });
      }
      
      setTimeout(pollState, 1000);
    });
  }

  pollState();
});
