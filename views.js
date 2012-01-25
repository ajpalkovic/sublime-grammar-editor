(function($) {
  function loadViews(root, views) {
    if ($.compiled) return;
    for (var i = 0; i < views.length; i++) {
      var value = views[i];
      loadView(root, value, value + '.haml');
    }
  }

  function loadView(root, key, url) {
    requestsSent++;
    $.get(url, function(content) {
      resposnes++;
      root[key] = new HamlView(url, content);
    }, 'text');
  }

  var requestsSent = 0, resposnes = 0;
  var views = $w('text_editor grammar list pattern dict text_row');
  $.views = $.views || {};
  loadViews($.views, views);

  $.waitForViews = function(callback) {
    var interval = setInterval(function() {
      if ($.compiled || (requestsSent > 0 && requestsSent == resposnes)) {
        clearInterval(interval);
        callback();
      }
    }, 10);
  };
})(jQuery);
