function xmlToJson(xmlString) {
  var xml = $(xmlString);
  var plist = $($.grep(xml, function(cur) { return cur.tagName == 'PLIST'; }));
  if (!plist.length) throw 'Could not find plist in xml. Ensure the xml file has a plist tag at the top level.';
  var topDict = plist.children().first();
  return xmlTagToJson(topDict);
}

function xmlTagToJson(xml) {
  if (!xml || !xml.length) return '';

  var children = xml.children();
  var tag = xml[0].tagName.toLowerCase();
  var ret;
  if (tag == 'dict') {
    ret = {};
    if (children.length % 2 !== 0) throw 'A dictionary element did not have an even number of child nodes.';
    for (var i = 0; i < children.length; i += 2) {
      var key = $(children[i]).text();
      var value = xmlTagToJson($(children[i+1]));
      ret[key] = value;
    }
  } else if (tag == 'array') {
    ret = [];
    for (var i = 0; i < children.length; i++) {
      ret.push(xmlTagToJson($(children[i])));
    }
  } else {
    ret = xml.text();
  }
  return ret;
}

function domToJson(tab) {
  var json = {};
  var rows = $('.grammar-editor > .row', tab[0]);
  for (var i = 0; i < rows.length; i++) {
    var key = $('.label', rows[i]).first().data('key');
    var value = domRowToJson(rows[i]);
    if (value) json[key] = value;
  }
  return json;
}

function domRowToJson(row) {
  row = $(row);
  var children = row.children();
  var node = children.last();

  if (children.length === 1 && node.hasClass('text-row') || node.hasClass('text-editor')) {
    return $('input, textarea', children[0]).val();
  }

  if (node.hasClass('list-editor')) {
    var rows = node.children('.list-entries').first().children('.list-entry');
    var ret = [];
    for (var i = 0; i < rows.length; i++) {
      var value = domRowToJson(rows[i]);
      if (value) ret.push(value);
    }
    if (ret.length === 0) return;
    return ret;
  }

  if (node.hasClass('dict-editor')) {
    var rows = node.children('.dict-entries').children('.row');
    var ret = {};
    var empty = true;
    for (var i = 0; i < rows.length; i++) {
      var cur = $(rows[i]);
      var key = cur.children('.dict-entry').children('.dict-entry-key').find('input, textarea').val();
      var value = domRowToJson(cur.children('.dict-entry').children('.dict-entry-value'));
      if (value) {
        ret[key] = value;
        empty = false;
      }
    }
    if (empty) return;
    return ret;
  }

  if (node.hasClass('pattern-editor-container')) {
    var rows = node.children('.pattern-editor').children('.row').add(
        node.children('.pattern-editor').children('.pattern-multi-regex').children('.row'));
    var ret = {};
    var empty = true;
    for (var i = 0; i < rows.length; i++) {
      var key = $('.label', rows[i]).first().data('key');
      var value = domRowToJson(rows[i]);
      if (value) {
        ret[key] = value;
        empty = false;
      }
    }
    if (empty) return;
    return ret;
  }

  throw 'Can\'t determine type.';
}

function jsonToXml(json) {
  var buffer = [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n',
    '<plist version="1.0">\n'
  ];

  var indent = {0: ''};
  for (var i = 1; i < 10; i++) {
    indent[i] = indent[i - 1] + '  ';
  }
  jsonNodeToXml(json, buffer, indent);
  buffer.push('</plist>\n');
  return buffer.join('');
}

function jsonNodeToXml(node, buffer, indent, level) {
  function e(str) {
    return (str || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (node instanceof Array) {
    buffer.push(indent[level], '<array>\n');
    for (var i = 0; i < node.length; i++) {
      jsonNodeToXml(node[i], buffer, indent, level + 1);
    }
    buffer.push(indent[level], '</array>\n');
  }

  else if (typeof node === 'string') {
    buffer.push(indent[level], '<string>', e(node));
    if (node.indexOf('\n') >= 0) {
      buffer.push('\n', indent[level]);
    }
    buffer.push('</string>\n');
  }

  else {
    buffer.push(indent[level], '<dict>\n');
    for (var key in node) {
      buffer.push(indent[level + 1], '<key>', e(key), '</key>\n');
      jsonNodeToXml(node[key], buffer, indent, level + 1);
    }
    buffer.push(indent[level], '</dict>\n');
  }
}
