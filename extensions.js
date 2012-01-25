/**
 * Essentially copies an array.
 */
function $A(iterable) {
  if (!iterable) return [];
  // Safari <2.0.4 crashes when accessing property of a node list with property accessor.
  // It nevertheless works fine with `in` operator, which is why we use it here
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}
Array.from = $A;

/**
 * Splits a string by whitespace, returning an array of the bits.
 */
function $w(string) {
  return string.strip().split(/\s+/);
}

var Class = {
  create: function(parent, methods) {
    if(methods === undefined) {
      methods = parent;
    } else {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      constructor.prototype = new subclass;
    }

    for(var key in methods) {
      if(methods.hasOwnProperty(key)) {
        methods.initialize.prototype[key] = methods[key];
      }
    }

    methods.initialize.prototype.constructor = methods.initialize;

    return methods.initialize;
  }
};

(function($) {
  $.extend(Function.prototype, {
    bind: function() {
      if (arguments.length < 2 && arguments[0] === undefined) return this;
      var __method = this, args = $A(arguments), object = args.shift();
      return function() {
        return __method.apply(object, args.concat($A(arguments)));
      }
    },

    bindEvent: function() {
      if (arguments.length < 2 && arguments[0] === undefined) return this;
      var __method = this, args = $A(arguments), object = args.shift();
      return function() {
        return __method.apply(object, [$(this)].concat(args.concat($A(arguments))));
      }
    }
  });
  Function.prototype.wrap = Function.prototype.bind;

  RegExp.prototype.match = RegExp.prototype.test;
  RegExp.escape = function(str) {
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  };

  $.extend(jQuery, {
    invoke: function(elems, method) {
      var args = $A(arguments).slice(1);
      return $.map(elems, function(value) {
        return value[method].call(value, args);
      });
    },

    pluck: function(elems, property) {
      var c = 0, length = elems.length, results = [];
      for(; c < length; c++) {
        results.push(elems[c][property]);
      }
      return results;
    }
  });

  var methods = {
    invoke: function( callback ) {
      return $.invoke(this, callback);
    },

    pluck: function( property ) {
      return $.pluck(this, property);
    },

    uniq: function() {
      return $.unique(this);
    }
  };

  $.extend(jQuery.prototype, methods);
  $.extend(Array.prototype), methods;

  Array.prototype.remove = function(from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
  };

  $.extend(String.prototype, {
    trim: String.prototype.trim || function() {
      var str = this.replace(/^\s\s*/, ''),
      ws = /\s/, i = str.length;
      while (ws.test(str.charAt(--i))) {}
      return str.slice(0, i + 1);
    },

    startsWith: function(pattern, ignoreCase) {
      return ignoreCase ? this.toLowerCase().startsWith(pattern.toLowerCase()) : this.indexOf(pattern) === 0;
    },

    endsWith: function(pattern, ignoreCase) {
      if(ignoreCase)
        return this.toLowerCase().endsWith(pattern.toLowerCase());
      var d = this.length - pattern.length;
      return d >= 0 && this.lastIndexOf(pattern) === d;
    },

    gsub: function(pattern, replacement) {
      var result = [], source = this, match;

      while (source.length > 0) {
        if (match = source.match(pattern)) {
          result.push(source.slice(0, match.index), replacement(match), source.slice(match.index + match[0].length));
        } else {
          result.push(source);
          source = '';
        }
      }
      return result.join('');
    },

    escapeHTML: function() {
      var self = arguments.callee;
      self.text.data = this;
      return self.div.innerHTML;
    },

    empty: function() {
      return this == '';
    },

    blank: function() {
      return /^\s*$/.test(this);
    },

    count: function(text) {
      if(typeof text === 'string') {
        var count = 0, start = 0, delta = text.length;
        while(true) {
          var index = this.indexOf(text, start);
          if(index < 0) break;

          count++;
          start = index+delta;
        }
        return count;
      } else {
        var count = 0, str = this;
        while(true) {
          var match = str.match(text);
          if(!match) break;

          count++;
          str = str.slice(match.index + match[0].length);
        }
        return count;
      }
    },

    iterate: function(regex, callback) {
    var str = this, start = 0;
      while(true) {
        var match = str.match(regex);
        if(!match) break;

        callback(match[0], match.index+start, match);

        start += match.index + match.length;
        str = str.slice(match.index + match[0].length);
      }
    }
  });
  String.prototype.strip = String.prototype.trim;

  $.extend(Math, {
    random: function(min, max) {
      var rand = this._random();
      if (arguments.length == 0)
        return rand;

      if (arguments.length == 1)
        var max = min, min = 0;

      return Math.floor(rand * (max-min+1)+min);
    },
    _random: Math.random
  });

  $.extend(Number.prototype, {
    toPaddedString: function(length, radix) {
      var string = this.toString(radix || 10);
      return '0'.times(length - string.length) + string;
    }
  });

  $.each($w('abs round ceil floor'), function(){
    var method = this;
    Number.prototype[method] = function() { return Math[method].apply(this, arguments); }
  });
})(jQuery);
