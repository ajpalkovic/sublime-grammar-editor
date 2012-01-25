$.waitForViews(function() {
  if (!$.compiled) {
    $.get('Java.tmLanguage', function(data) {
      parseGrammar({name: 'Java.tmLanguage'}, data);
    }, 'text');
  }
});

function hideAll() {
  var elements = $('.text-editor-input-wrapper:visible');
  for (var i = elements.length - 1; i >= 0; i--) {
    var $wrapper = $(elements[i]);
    var value = $wrapper.find('.text-editor-input').val();

    var editor = $wrapper.hide().closest('.text-editor').find('.text-editor-value');
    editor.html(prepareValue(value)).css('display', 'inline-block');
    if (!value) {
      editor.addClass('blank');
    } else {
      editor.removeClass('blank');
    }
  };
}

function prepareValue(value) {
  if (!value) return '(blank)';
  return value.
      replace(/&/g, '&amp;').
      replace(/\"/g, '&quot;').
      replace(/\'/g, '&apos;').
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;').
      replace(/\r\n|\r|\n/g, '<br>').
      replace(/\t/g, '&nbsp;&nbsp;').
      replace(/ /g, '&nbsp;');
}

function showEditor(editor) {
  hideAll();
  $('.text-editor-value', editor).hide();
  $('.text-editor-input-wrapper', editor).show().find('.text-editor-input').focus();
}

function parseGrammar(file, fileContent) {
  $('#tabs div').removeClass('active');
  $('#tab-content > div').hide();

  $('<div></div>').addClass('active').text(file.name).appendTo($('#tabs'));
  var container = $('<div></div>').appendTo($('#tab-content'));
  var grammar = xmlToJson(fileContent);
  container.html($.views.grammar.render({grammar: grammar}));
}

function loadGrammar(file) {
  window.f = file;
  var reader = new FileReader();
  reader.onload = function(readEvent) {
    parseGrammar(file, readEvent.target.result);
  };
  reader.readAsText(file);
}

$(document).
  on('mouseover', '.row', function() {
    $('.active-row').removeClass('active-row');
    if (!$(this).find('.row').length) {
      $(this).addClass('active-row');
    }
    return false;
  }).

  on('click', function(e) {
    hideAll();
    var node = $(e.target);
    if (!node.hasClass('text-editor')) node = node.closest('.text-editor');
    if (node.length) showEditor(node[0]);
  }).

  on('keydown', '.text-editor textarea, .text-editor input', function(e) {
    var $this = $(this);
    if (e.ctrlKey && e.keyCode == 13) {  // Ctrl+Enter
      $this.blur();
      return false;
    } else if (e.keyCode == 9) { // tab
      $this.blur();
      var direction = e.shiftKey ? -1 : 1;
      var currentEditor = $this.closest('.text-editor')[0];
      var selector = '.list-entry, .dict-entry, .grammar-editor';
      var parent = $this.closest(selector);
      var numParents = parent.parents(selector).length + 1;
      var editors = parent.find('.text-editor').filter(function() { return $(this).parents(selector).length == numParents; });
      for (var i = 0; i < editors.length; i++) {
        if (editors[i] === currentEditor) {
          if (direction < 0) {
            var ix = i === 0 ? editors.length - 1 : i - 1;
          } else {
            var ix = i === editors.length - 1 ? 0 : i + 1;
          }
          showEditor($(editors[ix]));
          break;
        }
      }
      return false;
    }
  }).

  on('keyup keydown focus', 'textarea.text-editor-input', function() {
    $(this).height(Math.max(50, this.scrollHeight || 0));
  }).

  on('change', '.pattern-multi-regex textarea', function() {
    var container = $(this).closest('.pattern-editor-container');
    var blank = $.grep(container.find('.pattern-multi-regex textarea'), function(textarea) { return !!$(textarea).val(); }).length == 0;
    var values = container.find('.pattern-editor > .pattern-multi-value');
    blank ? values.hide() : values.show();
  }).

  on('click', '.pattern-editor-expander, .pattern-editor-label', function() {
    var container = $(this).closest('.pattern-editor-container');
    var label = container.find('.pattern-editor-label:first');
    var expander = container.find('.pattern-editor-expander:first');
    var editor = container.find('.pattern-editor:first');

    if (editor.is(':visible')) {
      editor.hide();
      label.show();
      expander.text('[+]');
    } else {
      editor.show();
      label.hide();
      expander.text('[-]');
    }
  }).

  on('click', '.delete', function() {
    $(this).closest('.list-entry').remove();
  }).

  on('click', '.up', function() {
    var entry = $(this).closest('.list-entry');
    var prev = entry.prev();
    prev.remove();
    prev.insertAfter(entry);
  }).

  on('click', '.down', function() {
    var entry = $(this).closest('.list-entry');
    var next = entry.next();
    next.remove();
    next.insertBefore(entry);
  }).

  on('change', '#upload-file input', function(event) {
    var files = event.target.files;
    if (files && files.length) {
      for (var i = 0; i < files.length; i++) {
        loadGrammar(files[i]);
      }
    }
  }).

  on('click', '#tabs div', function() {
    var tabs = $('#tabs div').removeClass('active');
    var content = $('#tab-content > div').hide();

    for (var i = 0; i < tabs.length; i++)     {
      if (tabs[i] === this) break;
    }

    $(this).addClass('active');
    $(content[i]).show();
  })

$('#upload')[0].addEventListener('dragover', function(event) {
  event.stopPropagation();
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
});

$('#upload')[0].addEventListener('drop', function(event) {
  event.stopPropagation();
  event.preventDefault();

  var files = event.dataTransfer.files;
  if (files && files.length) {
    for (var i = 0; i < files.length; i++) {
      loadGrammar(files[i]);
    }
  }
});

$(document).ready(function() {
  $('#dialog').css({
    'left': ($(window).width() - $('#dialog').width()) / 2 + 'px',
    'top': ($(window).height() - $('#dialog').height()) / 2 + 'px'
  });

  var d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  if ($.cookie('dialog')) $('#dialog').hide();
  else $.cookie('dialog', true, {expires: d});
});

/*
  on('dragstart', '.list-entry', function() {
    console.log('dragstart');
    $(this).addClass('dragging');
  }).

  on('dragend', function() {
    console.log('dragend');
    $(this).removeclass('dragging');
  }).

  on('dragenter', function() {
    console.log('dragenter');
  }).

  on('dragleave', function() {
    console.log('dragleave');
  }).

  on('dragover', function(e) {
    console.log('dragover');
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }).

  on('drop', function(e) {
    console.log('drop');
    e.preventDefault();
    return false;
  })
*/
