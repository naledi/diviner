
// global.js: File List:
//      /js/prototype.js
//      /js/lightboxes.js
//      /js/prototype_extensions.js
//      /js/translate.js
//      /js/user.js
//      /js/tracker.js
//      /js/header.js
//      /js/Cookie.js
//      /js/patterns.js
//      /js/util.js
//      /js/Pulldown.js
//      /js/Share.js
//      /js/search_ui/SearchWithin.js
//      /js/search_ui/searchForm.js
//      /js/search_ui/advancedSearch.js
//      /js/search_ui/advancedSearchTips.js
//      /js/search_ui/sortForm.js
//      /js/color_wheel.js
//      /js/ContributorDropdown.js
//      /js/HelpText.js
//      /js/Follow.js
//      /js/PopupAnchor.js
//      /js/ui_widgets/FlyoutLayer.js
//      /js/ui_widgets/ShadowContainer.js
//      /js/SlideViewer.js
//      /js/Carousel.js
//      /js/ResponsiveCarousel.js
//      /js/recent_carousel.js
//      /js/input/TextWithDefault.js
//      /js/input/PassWithDefault.js
//      /js/input/InFieldLabel.js
//      /js/storage/storage.js
//      /js/location.js
//      /js/search/search.js
//      /js/search/client.js
//      /js/search/history/history.js
//      /js/search/history/shim.js
//      /js/search/history/support_hash_onload.js
//      /js/search/nextButton.js
//      /js/search/Pager.js
//      /js/search/preferences.js
//      /js/search/related.js
//      /js/image/Preview.js
//      /js/image/grid.js
//      /js/image/mosaic/mosaic.js
//      /js/image/mosaic/Grid.js
//      /js/image/mosaic/Row.js
//      /js/image/mosaic/Cell.js
//      /js/instant/client.js
//      /js/pic/pic.js
//      /js/pic/inline.js
//      /js/feedback/FeedbackForm.js
//      /js/Autocompleter.js
//      /js/suggest.js
//      /js/Anim.js
//      /js/ImagePaginator.js
//      /js/MarketingModule.js
//      /js/absinthe.min.js
//      /js/resource_ready.js
//      /js/HandleCookie.js


// global.js: begin JavaScript file: '/js/prototype.js'
// ================================================================================
/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.3',

  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/),
    LTE: function(version) {
        return (
            Prototype.Browser.IE &&
            parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5)) <= version
        );
    }
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !==
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  defer: function() {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};


if (!Date.now) {
    Date.now = function now () {
        return new Date().getTime();
    };
}

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];



    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});


if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {

      if (this._object[key] !== Object.prototype[key])
        return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.inject([], function(results, pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
        } else results.push(toQueryPair(key, values));
        return results;
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {

      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {

      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }


    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {

      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {

  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
  if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },


  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};



    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';


      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;


    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;


    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;


      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });


    source = $(source);
    var p = source.viewportOffset();


    element = $(element);
    var delta = [0, 0];
    var parent = null;


    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }


    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }


    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':

          if (!Element.visible(element)) return null;



          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {


  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);

      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);


        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  if(Prototype.Browser.LTE(9)) {
    Element.Methods.setOpacity = function(element, value) {
      function stripAlpha(filter){
        return filter.replace(/alpha\([^\)]*\)/gi,'');
      }
      element = $(element);
      var currentStyle = element.currentStyle;
      if ((currentStyle && !currentStyle.hasLayout) ||
        (!currentStyle && element.style.zoom == 'normal'))
          element.style.zoom = 1;

      var filter = element.getStyle('filter'), style = element.style;
      if (value == 1 || value === '') {
        (filter = stripAlpha(filter)) ?
          style.filter = filter : style.removeAttribute('filter');
        return element;
      } else if (value < 0.00001) value = 0;
      style.filter = stripAlpha(filter) +
        'alpha(opacity=' + (value * 100) + ')';
      return element;
    }
  } else {
    Element.Methods.setOpacity = function(element, value) {
      element = $(element);
      if (value == 1 || value === '') value = '';
      else if (value < 0.00001) value = 0;
      element.style.opacity = value;
      return element;
    }
  }

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };




  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {

  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div')['__proto__']) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div')['__proto__'];
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;


    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {

      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName)['__proto__'];
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { }, B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      if (B.WebKit && !document.evaluate) {

        dimensions[d] = self['inner' + D];
      } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {

        dimensions[d] = document.body['client' + D]
      } else {
        dimensions[d] = document.documentElement['client' + D];
      }
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;


    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;



    if ((/(\[[\w-]*?:|:checked)/).test(e))
      return false;

    return true;
  },

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (!Selector._div) Selector._div = new Element('div');



    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
            new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':



        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {


          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {


            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {


    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,


    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },


  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {


    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },


    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },




    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },


    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },


    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },


    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {

          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },


    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },


    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {

        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE && Prototype.Browser.LTE(8)) {
  Object.extend(Selector.handlers, {


    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },


    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {

            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {

    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      event = Event.extend(event);

      var node          = event.target,
          type          = event.type,
          currentTarget = event.currentTarget;

      if (currentTarget && currentTarget.tagName) {



        if (type === 'load' || type === 'error' ||
          (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
            && currentTarget.type === 'radio'))
              node = currentTarget;
      }
      if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
      return Element.extend(node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      var docElement = document.documentElement,
      body = document.body || { scrollLeft: 0, scrollTop: 0 };
      return {
        x: event.pageX || (event.clientX +
          (docElement.scrollLeft || body.scrollLeft) -
          (docElement.clientLeft || 0)),
        y: event.pageY || (event.clientY +
          (docElement.scrollTop || body.scrollTop) -
          (docElement.clientTop || 0))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE && Prototype.Browser.LTE(8)) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }




  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }




  if (Prototype.Browser.WebKit) {
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');



var Position = {



  includeScrollOffsets: false,



  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },


  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },


  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },



  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/prototype.js'

// global.js: begin JavaScript file: '/js/lightboxes.js'
// ================================================================================
Ss = window.Ss || {};
Ss.Lightbox = {};
var activeLightboxPhotoIds = new Hash();
var lightboxContentsPopulated = false;
var loadingHTML = 'loading';
var selectedPhotoId;
var searchSourceId;

/* Lightbox Adder (Adds the selected photo to a lightbox) */
Ss.Lightbox.Adder = Class.create({
	initialize: function(pulldown, action) {
		this.pulldown = pulldown;
		this.action = action;
	},
	refresh: function() {
	    var lightboxes = getAllLightboxes();
        var adder = this;
        var form = $('new_lightbox_form_template').down('form').cloneNode(true);
        var placehold = new Ss.input.InFieldLabel({
            label: form.down('label'),
            field: form.down('input[type=text]')
        });
		this.pulldown.clearContent();
		this.pulldown.appendJson(this._transform(lightboxes));
        this.pulldown.appendContent(form);
        form.observe('submit', function(evt) {
            var lb_err = form.down('.new_lightbox_messages');
            var lb_box = form.down('input[type=text]');
            var lb_box_container = form.down('div.new_lightbox_container');
            evt = evt || window.event;
            Event.stop(evt);
            if(evt.returnValue){
                evt.returnValue = false;
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            }
            mouseoverEnabled = false;
            createLightbox(lb_box.getValue(), selectedPhotoId, function(err){
                lb_err.update(err).show();
                lb_box.addClassName('lb_add_error');
                lb_box_container.addClassName('lb_add_error');
                form.addClassName('lb_add_error');
            }, adder);
        });
	},
	getPulldown: function() { 
	    return this.pulldown;
    },
    _transform: function(lbs) {
        var o = this;
        return lbs.map(function(l){ return {"name":l.title,"onclick":function(){o.action(l.id, null, null, o);}};});
    }
});

/* Lightbox Data Retrieval */
function getAllLightboxes() { //returns all lightbox objects sorted by mod. date
    return lightboxes.values().sortBy(function(l){
        var modified = l.last_modified ? parseInt(l.last_modified,10) : 0;
        return -1 * modified;
    });
}

/* Add an image to a lightbox */
function addImageToLightbox(lightboxId, showRenameDialog, photoIdOverride, adder) {
    var photoId = photoIdOverride ? photoIdOverride : selectedPhotoId;
    
    new Ajax.Request('/webstack/legacy/lightboxes', {
        method: 'POST',
        evalJS: false,
        parameters: {
            action: "add_image",
            photo_id: photoId,
            lightbox_id: lightboxId,
            src: getSelectedPhotoSrc(photoId)
        },
        onSuccess: function(transport) {
            lightboxes.get(lightboxId).last_modified = parseInt(new Date().getTime()/1000, 10);
            logLightboxEvent(lightboxId, photoId);
        },
        onFailure: function(transport) {
            adder.getPulldown().collapse();
            alert($t('LB_TECHNICAL_ERROR_ADDING', "Unfortunately, there was a technical error adding the image to your lightbox"));
        }
    });
    

    showLightboxConfirmation.defer(lightboxes.get(lightboxId), adder);
}

function createLightbox(lightboxName, photoId, callback, adder) {
    var error = validateLightboxName(lightboxName);
    var pulldown = adder.getPulldown();
    if (error) {
      callback(error);
      return;
    }
    pulldown.showLoading();
    new Ajax.Request('/webstack/legacy/lightboxes', {
        parameters: {
            action: 'create',
            lightbox_name: lightboxName
        },
        onSuccess: function(transport) {
            var lightboxId = eval(transport.responseText);
            lightboxes.set(lightboxId, { title: lightboxName, id: lightboxId, last_modified: parseInt(new Date().getTime()/1000, 10)});
            addImageToLightbox(lightboxId, false, photoId, adder);
            pulldown.hideLoading();
        },
        onFailure: function(transport) {
            pulldown.hideLoading();
            pulldown.collapse();
            alert( $t('LB_TECHNICAL_ERROR_CREATING', "Unfortunately, there was a technical error creating this lightbox") );
        }
    });
}

function showLightboxConfirmation(lightbox, adder) {
    var pulldown = adder.getPulldown();
    var width = pulldown.content.getDimensions().width;
    var _tid;
    var auto;
    pulldown.replaceContent(
        '<div class="lightbox_confirmation" style="width:' + width + 'px;">' +
        '	<img class="checkmark" src="http://s1.picdn.net/images/blue_check.png" />' + 
            $t('SAVED_TO', 'Saved to') + 
        '   <a href="/lightboxes/' + lightbox.id + '">"' + lightbox.title + '"</a>' +
        '</div>'
    );
    _tid = window.setTimeout(pulldown.collapse.bind(pulldown), 3000);
    auto = function(m){
        if(m.state == 'collapsed' || m.state == 'expanded') {
            window.clearTimeout(_tid);
            pulldown.unsubscribe(auto);
            adder.refresh();
        }
    };
    pulldown.subscribe(auto);
}

function validateLightboxName(name) {
	var errorCode;
	if (name.length > 24) {
		errorCode = $t('LB_NAME_TOO_LONG', 'This lightbox name is too long');
	} else if (!name) {
		errorCode = $t('LB_NAME_TOO_SHORT', 'Please enter a name for this lightbox');

	} else if (name.match(/[<>]/)) {
		errorCode = $t('LB_NAME_BAD_CHARS', 'Lightbox names can only contain numbers and letters');

	} else {
		lightboxes.keys().each( function(lightboxId) {
			if (lightboxes.get(lightboxId) && lightboxes.get(lightboxId).title == name) {
				errorCode = $t('LB_NAME_ALREADY_EXISTS', 'You already have a lightbox with this name');
			}
		} );
	}

	return errorCode;
}

function logLightboxEvent(lightboxId, photoId) {
    var src_pieces = getSelectedPhotoSrc(photoId).split('-');


    var page_number = '', image_position = '', tracking_id = '', ref_photo_id = '';
    if(src_pieces.length == 2 && src_pieces[0] == 'p') {
        ref_photo_id = src_pieces[1];
    } else if(src_pieces.length >= 3) {
        page_number = src_pieces[src_pieces.length - 2];
        image_position = src_pieces[src_pieces.length - 1];
        tracking_id = src_pieces.splice(0, src_pieces.length - 2).join('-');
    }
    Ss.ResourceReady.add('lilBro', function() {
        window.Ss.lilBro.write({
            event_type:	'lightbox',
            photo_id: photoId,
            lightbox_id: lightboxId,
            page_number: page_number,
            image_position: image_position, 
            ref_photo_id: ref_photo_id,
            tracking_id: tracking_id
        });
    });
}

function getSelectedPhotoSrc(photoId) {



    if(window.selectedPhotoSrc) {
        return window.selectedPhotoSrc;
    } else {
        return getSrcById(photoId);
    }
    
    function getSrcById(id) {
        var params = {};
        var grid = Ss.image.mosaic.isActive() ? Ss.image.mosaic : Ss.image.grid;
	    var cell = grid.getCellById(id)
	    var anchor;
	    
	    if(cell) {
	        anchor = cell.down('a');
	        if(anchor) {
	            params = anchor.href.toQueryParams();
            }
        }
        return params.src;
    };
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/lightboxes.js'

// global.js: begin JavaScript file: '/js/prototype_extensions.js'
// ================================================================================

Ss.Browser = {
	isIEVersion: function(v) {
		return (Prototype.Browser.IE &&
			parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5))==v);
	},
	

	isIE: function() {
	    return (Prototype.Browser.IE || navigator.userAgent.indexOf('Trident/') !== -1);
	},
	
	supports: {
	    placeholder: function() {
	        if(Object.isUndefined(this._placeholder)) {
	            this._placeholder = 'placeholder' in document.createElement('input');
	        }
	        return this._placeholder;
	    }
	}
};

Element.addMethods({
	isElementOrDescendantOf: function(element, argElement) {
		return element === argElement || element.descendantOf(argElement);
	},
	
	CSSTransitionsSupported: function(element) {
		return element.style.webkitTransition !== undefined ||element.style.MozTransition !== undefined;
	},
	
	fadeOut: function (element, args) {
		args = args || {};
		args.endValue = 0;
		return element.fadeTo(args);
	},

	fadeIn: function (element, args) {
		args = args || {};
		args.endValue = 1;
		return element.fadeTo(args);
	},
	
	fadeTo: function(element, args) {
		args = args || {};
		args.increment = args.increment || 0.05;
		if(Prototype.Browser.IE) {
			args.increment = args.increment * 5;
		}
		return element.setStylePeriodically({
				property: 	'opacity',
				endValue: 	args.endValue,
				increment: 	args.increment,
				onComplete: args.onComplete || Prototype.emptyFunction()
		});
	},
	

	setStylePeriodically: function(element, args) {
		var property = args.property;
		var endValue = args.endValue;
		var increment = args.increment;
		var interval = args.interval || 0.010;
		var units = args.units || '';
		var onComplete = (args.onComplete && Object.isFunction(args.onComplete) ? args.onComplete : Prototype.emptyFunction);
		var currentValue = Object.isUndefined(args.startValue) ? parseFloat(element.getStyle(property)) : parseFloat(args.startValue);
		

		var getUpdater = function() {
			var updaters = {
				add: function() {
					currentValue = (currentValue + increment <= endValue ? currentValue + increment : endValue);
					return currentValue >= endValue;
				},
				sub: function() {
					currentValue = (currentValue - increment >= endValue ? currentValue - increment : endValue);
					return currentValue <= endValue;
				}
			};

			return (Math.min(currentValue, endValue) == currentValue ? updaters.add : updaters.sub);
		};
		
		var updater = getUpdater();
		

		var _pe = new PeriodicalExecuter(
			function(pe) {
				var done = updater();
				var value = currentValue + units;

				if(property == 'opacity') {



					if(Ss.Browser.isIEVersion(9) && value >= 0.99) {
						value = 0.99;
					}

					element.setOpacity(value);
				} else {
					element.style[property] = value;
				}

				if(done) {
					pe.stop();
					onComplete();
				}
			},
		interval);

		return _pe;
	},
	
		





	viewportOffsetFix: function(forElement) {
		var valueT = 0, valueL = 0;
		
		var element = forElement;
		do {
		  valueT += element.offsetTop  || 0;
		  valueL += element.offsetLeft || 0;

		  if (element.offsetParent == document.body &&
			Element.getStyle(element, 'position') == 'absolute') break;
		
		} while (element = element.offsetParent);
		
		element = forElement;
		do {
		  if (!Prototype.Browser.Opera || element.tagName == 'HTML') {
			valueT -= element.scrollTop  || 0;
			valueL -= element.scrollLeft || 0;
		  }
		} while (element = element.parentNode);
		
		return Element._returnOffset(valueL, valueT);
	},
	
	delegateClick: function(element, selector, handler) {
        if(!Object.isString(selector)) {
            throw 'selectors required.';
        }
        if(!Object.isFunction(handler)) {
            throw 'handler function required.';
        }
        var selectors = selector.split(/,\s*/);
    	element.observe('click', function(evt) {
            if(
                selectors.any(
                    function(s){ return Event.findElement(evt, s); } 
                )
            ) {
                handler(evt);
            }
        });
	},

	mousethis: function(element, action, observer) {
		element = $(element);
        element.observe(action, function(evt, currentTarget) {
            var relatedTarget = $(evt.relatedTarget || evt.fromElement);

            if(relatedTarget && !relatedTarget.isElementOrDescendantOf(currentTarget)) {
                observer();
            }
        }.bindAsEventListener({}, element));

        return element;
	},

    mouseenter: function(element, observer) {
        return element.mousethis('mouseover', observer);
    },
    
    mouseleave: function(element, observer) {
        return element.mousethis('mouseout', observer);
    },
    
    addToggle: function(element, trigger, options) {
	if(!Object.isElement(trigger)) {
		return;
	}
	options = options || {};
	trigger.observe('click', function(evt){
		element.toggle();
		if(options.className) {
			document.body.toggleClassName(options.className);
		}
		if(Object.isFunction(options.callback)) {
			options.callback({ type: 'toggle' });
		}
	});
	$(document).observe('click', function(evt){
		var target = evt.findElement();
		if(!element.visible() ||
			target.isElementOrDescendantOf(element) || 
			target.isElementOrDescendantOf(trigger)) {
			return;
		}
		element.hide();
		if(options.className) {
			document.body.removeClassName(options.className);
		}
		if(Object.isFunction(options.callback)) {
			options.callback({ type: 'hide' });
		}
	});
    },
    clearValue: function(element) {
    	if(!(element.match('input') || element.match('select'))) {
    		return;
    	}
    	if(element.type == 'checkbox') {
    		element.checked = false;
    	} else {
    		element.value = '';
    	}
    }
});

Element.addMethods('form', {
    setState: function(element, state) {
        element.select('input[type=radio], input[type=checkbox], input[type=text], select').each(function(input) {
            var stateVal = state[input.name];
            if(input.type == 'radio') {
                input.checked = (input.value == stateVal);
            }
            else if(input.type == 'checkbox') {
                input.checked = !!stateVal;
            }
            else if(input.type == 'text' || input.tagName == 'SELECT') {
                input.value = stateVal || '';
            }
        });
    }
});
Object.extend(window, {
        

    _scrollTo: function(x,y) {
        if(window.scrollTo) {
            (function(){
                window.scrollTo(x,y);
            }).defer();
        }
    },
    
    animateScrollByY: function(y) {
        var cur = 0;
        var step = 30;
		var update;
		var vph = document.viewport.getHeight();
		var doch = document.body.scrollHeight;
        if(y<0) {
            step *= -1;
        }
        var _tid = window.setInterval(function(){
            var done;
            if(y>0) {
                cur = (cur + step <= y ? cur + step : y);
                done = cur >= y;
            } else {
                cur = (cur + step >= y ? cur + step : y);
                done = cur <= y;
            }
            window.scrollBy(0, step);
            if(done || window.scrollY === 0 || window.scrollY + vph >= doch) {
                window.clearInterval(_tid);
            }
        }, 10);
        
    }
});








//



Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};
Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

(function(){
    var _rTid;
    var _sTid;
    var resizeHandler;

	resizeHandler = function() {
		Event.observe(window, 'resize', function(evt) {
			if(_rTid) {
				window.clearTimeout(_rTid);
			}

			document.body.addClassName('window_resizing');

			_rTid = (function(){
				document.body.removeClassName('window_resizing');
				Element.fire(document.body, "window:resizeEnd");
			}).delay(0.25);
		});
	}


	if(Prototype.Browser.LTE(8)) {
		var last = document.viewport.getDimensions();
		var current = null;

		resizeHandler = function() {
			Event.observe(window, 'resize', function(evt) {
				current = document.viewport.getDimensions();

				if(last.width !== current.width || last.height !== current.height) {
					if(_rTid) {
						window.clearTimeout(_rTid);
					}

					document.body.addClassName('window_resizing');

					_rTid = (function(){
						document.body.removeClassName('window_resizing');
						Element.fire(document.body, "window:resizeEnd");
					}).delay(0.25);

					last = current;
				}
			});
		}
	}

	resizeHandler();

	Event.observe(window, 'scroll', function(evt) {
		if(_sTid) {
			window.clearTimeout(_sTid);
		}

		document.body.addClassName('scrolling');

		_sTid = window.setTimeout(function() {
			var f = function(evt) {
				document.body.removeClassName('scrolling');
				document.stopObserving('mousemove', f);
			};
			document.observe('mousemove', f);
			Element.fire(document.body, "window:scrollEnd");
		}, 1000);
	});
})();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/prototype_extensions.js'

// global.js: begin JavaScript file: '/js/translate.js'
// ================================================================================
function $t(translationId, english, substitutions) {
	if (document.language == 'en' && !substitutions) {
		return english;
	} else {
		var translation;
		if (document.language == 'en') 
			translation = english;
		else {
			translation = document.translations[translationId] || document.translations.get(translationId);
			if (!translation) {
				translation = english;
			}
		}
		$H(substitutions).keys().each( function(substitutionKey) {
			var subRegex = new RegExp(substitutionKey, 'g');
			translation = translation.replace(subRegex, substitutions[substitutionKey]);
		} );
		return translation;
	}
}
function _debug(message) {
	return;
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/translate.js'

// global.js: begin JavaScript file: '/js/user.js'
// ================================================================================
Ss.user = window.Ss.user || {};

Object.extend(Ss.user, {

		viewportDimensions: document.viewport.getDimensions(),
		


		getViewportWidth: function() {
			return this.viewportDimensions.width;
		},
		
		getViewportHeight: function() {
			return this.viewportDimensions.height;
		}
		
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/user.js'

// global.js: begin JavaScript file: '/js/tracker.js'
// ================================================================================
Ss.tracker = window.Ss.tracker || {};

Object.extend(Ss.tracker, {

	initialize: function() {

		$('lil_brother').observe('click', Ss.tracker.eventHandlers.click);

		this.config.click_event_ids.default_select.each(
			function(id) {
				var select = $(id);
				if(select) {
					select.observe('change', Ss.tracker.eventHandlers.change);
				}
			}
		);
		
		if(Ss.storage.session.supported()) {
		    Event.observe(window, 'load', function(evt) {
		            var pendingEvent = Ss.tracker.getPendingEvent();
		            if(pendingEvent) {
		                Ss.tracker.request(pendingEvent);
		            }
		    });
		}

	},

	logEvent: function(eventType, metadata, target) {
		try {

			var _event = this.config.event.clone();


			var _event_type_id = Ss.tracker.config.event_type_ids[eventType];
			if (Object.isUndefined(_event_type_id)) {
				return;
			}

			_event[this.config.name_to_column['event_type']] = _event_type_id;


			var localCallbacks = this.config.event_callbacks[eventType];
			if (localCallbacks) {
				localCallbacks.each(function(callback) {
					try {
						_event[Ss.tracker.config.name_to_column[callback]]
							= Ss.tracker.get[callback](eventType, target);
					} catch (e) {

					}
				});
			}

			if (metadata) {
				Object.keys(metadata).each(function(columnName) {
					_event[Ss.tracker.config.name_to_column[columnName]]
						= metadata[columnName];
				});
			}



			_event[Ss.tracker.config.name_to_column['notes_json']] = 
				"{'client_seed': " + Math.floor(Math.random() * 100000000) + "}";

			_event[Ss.tracker.config.name_to_column['client_timezone']] =
				new Date().getTimezoneOffset();

			if (!Object.isUndefined(Ss.user)) {
				_event[Ss.tracker.config.name_to_column['viewport_width']] =
					Ss.user.getViewportWidth();
				_event[Ss.tracker.config.name_to_column['viewport_height']] =
					Ss.user.getViewportHeight();
			}
			this.request(this.config.img_src + '?' + _event.join('\x01'));
			

		} catch(ex) {
		}

	},

	request: function(src, pageLoadEvent) {
		


		var bug = new Image();
		
		if(Ss.storage.session.supported() && !pageLoadEvent) {
			Ss.tracker.setPendingEvent(src);
			bug.onload = function() {
				Ss.tracker.deletePendingEvent();
			};
		}
		
		bug.src = src;
	},
	
	getPendingEvent: function() {
		var pEvent = Ss.storage.session.getItem('pending_event');
		if(pEvent) {
			return decodeURIComponent(pEvent);
		}
		return null;
	},
	
	setPendingEvent: function(src) {
		Ss.storage.session.setItem('pending_event', encodeURIComponent(src));
	},
	
	deletePendingEvent: function() {
		Ss.storage.session.removeItem('pending_event');
	},
	
	eventHandlers: {

		click: function(evt) {

			try {
				var target = Event.element(evt),
					trackedElement = Ss.tracker._getTrackedElement(target),
					excludeTags = ['SELECT', 'OPTION'],
					metadata = {};

				if(!trackedElement || excludeTags.include(target.nodeName)) {
					return;
				}

				metadata.tag_name = trackedElement.nodeName;

				if(trackedElement.nodeName == 'INPUT') {
					
					metadata.input_type = trackedElement.type || '';
					
					if(trackedElement.type != 'text' && trackedElement.type != 'password') {
						metadata.input_name = trackedElement.name || '';
						metadata.input_value = trackedElement.value || '';
						metadata.input_checked = trackedElement.checked || '';
					}
					
				}

				metadata.element_id = Ss.tracker._getTrackedElementId(trackedElement);

				var eType = Ss.tracker._getEventTypeByElementId(trackedElement.id)
				         || 'click';
				Ss.tracker.logEvent(eType, metadata, target);

			} catch (ex) {
			}

		},
		
		change: function(evt) {
			
			try {

				var target = Event.element(evt),
					metadata = {},
					eType = '';
					
				metadata.tag_name = target.nodeName;
				metadata.element_id = Ss.tracker._getTrackedElementId(target);
				metadata.input_name = target.name || '';
				metadata.input_value = target.value || '';
				
				eType = Ss.tracker._getEventTypeByElementId(target.id)
				         || 'click';
				
				Ss.tracker.logEvent(eType, metadata);

			} catch(ex) {
			}

		}

	},

	get: {

		search_term: function(event_type, target) {
			var term = $('shutterstock_search').down('input[name=searchterm]').getValue();
			return term;
		},

		page_number: function(event_type, target) {
			var page_number;
			if (event_type === 'paginate') {
				page_number =  Ss.location.getHashParam('page');
			} else if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				page_number =  src[1];
			} else if (event_type === 'click') {
				page_number =  Ss.search.getCurrentPage();
			}
			return page_number;
		},

		photo_id: function(event_type, target) {
			var photo_id;
			if (event_type === 'download') {
				photo_id = $('submit_form').id.value;
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				photo_id =  p.id;
			}
			return photo_id;
		},

		image_position: function(event_type, target) {
			var image_position;
			if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				image_position = src[2];
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				var pos = p.src.split('-')[2];
				image_position = pos;
			}
			return image_position;
		},

		tracking_id: function(event_type, target) {
			var tracking_id;
			if (event_type === 'download') {
				var src = $('submit_form').src.value.split('-');
				tracking_id = src[0];
			} else if (event_type === 'click') {
				var split = target.up().href.split('#');
				var p = split[split.length - 1].toQueryParams();
				tracking_id = p.src.split('-')[0];
			}
			return tracking_id;
		}
	},

	_getTrackedElement: function(element) {
		var trackedElement,
			configIds = this._getConfigIds();

		if(configIds.include(element.id)) {
			trackedElement = element;
		} else {
			trackedElement = element.ancestors().find(
				function(elem) {
					return configIds.include(elem.id);
				}
			);
		}




		if(!trackedElement && this.config.track_all_clicks) {
			trackedElement = element;
		}

		return trackedElement;
	},
	
	_getTrackedElementId: function(elem) {
		var id = '';
		if(elem.hasAttribute('id')) {
			id = elem.getAttribute('id');
		} else if(Ss.tracker.config.track_all_clicks) {
			id = elem.ancestors().find(
				function(anc) {
					return anc.hasAttribute('id');
				}
			).getAttribute('id');
		}
		return id;
	},

	_getConfigIds: function() {
		return Object.values(Ss.tracker.config.click_event_ids).flatten();
	},

	_getEventTypeByElementId: function(id) {
		var type = '';
		Object.keys(Ss.tracker.config.click_event_ids).each(function(eventType) {
			if(Ss.tracker.config.click_event_ids[eventType].include(id)) {
				type = eventType;
			}
		});
		if (type == 'default_click' || type == 'default_select') {

			type = 'click';
		}
		return type;
	},

	_log: function(event) {
		var loggedEvent = {};
		for (var i=0; i < event.length; i++) {
			var column = $H(Ss.tracker.config.name_to_column).find(function(entry) {
				return entry.value == i;
			});
			loggedEvent[column.key] = event[i];
		};
		if (console) {
			console.log(loggedEvent);
		}
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/tracker.js'

// global.js: begin JavaScript file: '/js/header.js'
// ================================================================================
Ss.header = {
    
    activeMenu: null,
    
    loginForm: null,
    
    initialize: function(args) {
        this.element = $('navigation');
        
        this.element.observe('click', this.click.bind(this));
        
		Ss.ShadowContainer.observe(
		    function(evt) {
		        if(evt.type == 'hide') {
		            Ss.header._reset();
		        }
		    }
		);

    },

	getMenus: function() {

	    return {
            'language_menu': {
            	trigger:	$('language_selector'),
                element: 	$('language_menu'),
                options: {
                	position: {
						target:	$('language_selector'),
						type: 		'bottom',
						offsetY: 	1,
						offsetX:    -64 
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu dropdown-menu'
				}
            },
            
            'acct_menu': {
            	trigger:	$('navbar-acct'),
                element: 	$('my-acct-drop'),
                options: {
                	position: {
						target:	$('navbar-acct'),
						type: 		'bottom',
						offsetY: 	0,
						offsetX:    -5
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu dropdown-menu'
				}
            },

            'user_options_menu': {
            	trigger:	$('user_options_selector'),
                element: 	$('user_options_menu'),
                options: {
                	position: {
						target:	$('user_options_selector'),
						type: 		'bottom',
						offsetY: 	12,
						offsetX:    -24
					},
					closeButton: false,
					modal:	false,
					className: 'header_menu user_options_menu dropdown-menu'
                }
            },
            
            'inline_login_form': {
            	trigger:	$('inline_login'),
                element: 	$('inline_login_form'),
                options: {
                	position: {
						target:	$('inline_login'),
						type: 		'bottom',
						offsetY: 	28,
						offsetX:    15
					},
					closeButton: false,
					modal:	false,
					notch:		{
						type: 'top',
						styles: {
							left: '80%'
						}
					},
					className: 'header_menu shadow_container_gray popover bottom inline_login_form'
				}
            }
        };
        
	},

    click: function(evt) {
        
        var trigger = Event.element(evt),
            menus = this.getMenus(),
            activeMenu = this.activeMenu;

        this._reset();
        
        if(activeMenu) {
            
            Ss.header.hideMenu();
            
            if(trigger == activeMenu.trigger || 
                trigger.descendantOf(activeMenu.trigger))
            {
                Event.stop(evt);
                return;
            }
            
        }

        Object.keys(menus).each(
            function(key) {
                var menu = menus[key];
                
                if(menu.trigger && (trigger == menu.trigger || trigger.descendantOf(menu.trigger))) {
                	if(key != 'user_options_menu' && key != 'language_menu') {
                		Event.stop(evt);
					}
                    Ss.header.showMenu(menu, key);
                }
            }
        );
        
    },
    
	showMenu: function(menu, key) {
	
	    var menuElem, header = this;
	    
	    menu.trigger.addClassName('active_menu_trigger');
	    
		if(key == 'inline_login_form') {
		    menuElem = this.loginForm || this.makeLoginForm(menu);
		} else {
		     menuElem = menu.element.cloneNode(true)
		}
		
		Ss.ShadowContainer.write(menuElem, menu.options);
		
		this.activeMenu = menu;
		
		if(key == 'inline_login_form') {
			( function(){ menuElem.down('input[type=text]').focus(); } ).defer(); // deferment is needed to support explorer
		}
	},
	
	hideMenu: function() {
		 Ss.ShadowContainer.hide()
	},
	
	makeLoginForm: function(menu) {
	    this.loginForm = menu.element;
	    


		if(Prototype.Browser.IE) {
		    Ss.input.InFieldLabel.create(this.loginForm.down('input[name=user]'));
		    Ss.input.InFieldLabel.create(this.loginForm.down('input[name=pass]'));
        }
        return this.loginForm;
	},
	
	_reset: function() {

	    $$('#language_selector, #user_options_selector, #inline_login').compact().invoke('removeClassName', 'active_menu_trigger');
	    

	    this.activeMenu = null;
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/header.js'

// global.js: begin JavaScript file: '/js/Cookie.js'
// ================================================================================
function createCookie(args) {
	if (args.days) {
		var date = new Date();
		date.setTime(date.getTime() + (args.days*24*60*60*1000));
		var expires = "; expires=" + date.toGMTString();
	} else {
		var expires = "";
	}
	document.cookie = args.name + "=" + args.value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
		   c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

function eraseCookie(name) {
	createCookie({
		name: name, 
		value: "", 
		days: -1
		});
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Cookie.js'

// global.js: begin JavaScript file: '/js/patterns.js'
// ================================================================================
/************************
 * Patterns (patterns.js)
 */
Ss = window.Ss || {};
Ss.patterns = {};


/* SUBJECT */
Ss.patterns.Subject = Class.create({
	initialize: function() {
		this.observers = [];
	},
	subscribe: function(f) {
		this.observers.push(f);	
	},
	unsubscribe: function(f) {
		this.observers = this.observers.without(f);
	},
	notify: function(data) {
		this.observers.each(function(fn) {
			fn(data);
		});
	}
});


/* ABSTRACT MODEL */
Ss.patterns.Model = Class.create(Ss.patterns.Subject, {
	initialize: function($super, data) {
		$super();
		this.data = data;
	},
	set: function(data) {
		this.data = data;
		this.notify(data);
	}
});


/* ABSTRACT VIEWS */
Ss.patterns.View = Class.create({
	initialize: function(element, model, controller) {
		this.element = element;
		this.model = model;
		this.controller = controller;
		
		this.model.subscribe(this.update.bind(this));
		this._events();
	},
	observe: function(eType) {
		this.element.observe(eType, this.controller[eType]);
	},
	update: function(data) { 

		this.element.update(data);
	},
	_events: function() { /*abstract*/ }
});

Ss.patterns.CompositeView = Class.create(Ss.patterns.View, {
	initialize: function($super, element, model, controller) {
		$super(element, model, controller);
		this._views = [];
	},
	update: function() {
		this._views.invoke('update');
	},
	add: function(view) {
		this._views.push(view);
	},
	remove: function(view) {
		this._views = this.views.reject(function(v){return view == v});
	},
	get: function(index) {
		return this.children[index];
	}
});


/* ABSTRACT CONTROLLERS */
Ss.patterns.Controller = Class.create({
	initialize: function(model) {
		this.model = model;
	},
	click: function(event) { /*abstract*/ }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/patterns.js'

// global.js: begin JavaScript file: '/js/util.js'
// ================================================================================
/*********************
 * Utilities (util.js)
 */
Ss = window.Ss || {};
Ss.util = {};
Ss.util.disableTextSelection = function(element) {
	element.onselectstart = function() { return false; };
	element.unselectable = "on";
	element.style.MozUserSelect = "none";
};
Ss.util.getElementText = function(element) {
	var ret = $A(element.childNodes).collect(function(c){
		if(c.nodeType != 8){
			return (c.nodeType != 1 ? c.nodeValue: Ss.util.getElementText(c))
		}
	}).join('');
	return ret.strip();
};
Ss.util.sum = function(list, prop) {
    return list.inject(0, function(total, item){return total + parseInt(item[prop]);});
};
Ss.util.avg = function(list, prop) {
    return Ss.util.sum(list, prop)/list.length;
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/util.js'

// global.js: begin JavaScript file: '/js/Pulldown.js'
// ================================================================================
/***********
 * Pulldown
 */
Ss = window.Ss || {};
Ss.Pulldown = Class.create(Ss.patterns.Subject, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar) {
		$super();
		this.element = element
		this.trigger = trigger;
		this.content = content;
		this.contentContainer = contentContainer;
		this.titleBar = titleBar;
		this.state = "";
		this.collapse();
		this._events();
		this._tId;
		Ss.Pulldown.INSTANCES.set(this.element.identify(), this);
	},
	/* change state/collaspe/expand */
	collapse: function() {
		this._setState(Ss.Pulldown.STATES.collapsed);
		this._resize(0);
	},
	expand: function() {
		this._setState(Ss.Pulldown.STATES.expanded);
		

        if (this.titleBar.childElements().grep(new Selector("div.no-update")).length == 0) {
            this.titleBar.update(this.trigger.cloneNode(true));
            this.titleBar.insert('<a class="close_btn close_btn_dark_trans"></a>');
        }	
        
		this.titleBar.select('a.close_btn')[0].observe('click', this.collapse.bind(this));

		var somePadding = 20;
		var elDim = this.contentContainer.getDimensions();
		var vpDim = document.viewport.getDimensions();
		var elOff = this.contentContainer.viewportOffset();
		var corrections = { 
		    'marginLeft': '',
		    'marginTop': ''
		};
		if(elDim.width + elOff.left > vpDim.width) {
			corrections['marginLeft'] = -1 * ((elOff.left + elDim.width + somePadding) - vpDim.width) + 'px';
		}
		if(elDim.height + elOff.top > vpDim.height) {
		    corrections['marginTop'] = -1 * ((elOff.top + elDim.height + somePadding) - vpDim.height) + 'px';
		}
        this.contentContainer.setStyle(corrections);
		this._resize();
	},
	/* change content */
	appendJson: function(jsonArr) {
		jsonArr = (Object.isArray(jsonArr) ? jsonArr : [jsonArr]);
		Ss.Pulldown.jsonToItems(jsonArr).each(
			function(item) {
				this._appendItem(item);		
			}, this);
	},
	appendContent: function(content) {
		$(this.content).insert(content);
		this._resize();
	},
	replaceContent: function(content) {
		$(this.content).update(content);
		this._resize();
	},
	clearContent: function(){
		this.replaceContent('');
	},
	/*change trigger*/
	appendToTrigger: function(content) {
		$(this.trigger).insert(content);
	},
	replaceTrigger: function(trigger) {
		$(this.trigger).update(trigger);
		$(this.trigger).insert('<span class="pulldown_open_icon">&#9660;</span>');
	},
	/* show/hide loading state */
	showLoading: function() {
		$(this.element).addClassName(Ss.Pulldown.COMPONENTS.loading);
	},
	hideLoading: function() {
		$(this.element).removeClassName(Ss.Pulldown.COMPONENTS.loading);
	},
	getElement: function() {
		return this.element;
	},
	destroy: function() {
		$(this.element, this.trigger, this.content, this.contentContainer).invoke('stopObserving');
		try { $(this.element).remove(); }
		catch(e) { }
	},
	
	/* private */
	_resize: function(width) {
		if(document.documentMode <= 7 || Ss.Browser.isIEVersion(7)) {
			width = width || this.content.getDimensions().width;
			if( width > this.titleBar.getDimensions().width ) {
				this.titleBar.setStyle({
					width: width + 'px'
				});
			}
		}
	},
	_appendItem: function(item) {
		if(!$(this.content).select("UL").size() > 0) {
			$(this.content).insert(new Element("UL"));
		}
		$(this.content).select("UL").pop().insert(item);
	},
	_toggleState: function() {
		this.state == Ss.Pulldown.STATES.expanded ? this.collapse() : this.expand();
	},
	_events: function() {
	    var pulldown = this;
        var clickAway = function(evt){
          var target = Event.findElement(evt);
          if(!target.isElementOrDescendantOf(pulldown.element)) {
            pulldown.collapse();
          }
        };
		$(this.trigger).observe('click', this._click.bind(this));
		$(this.element).observe('mouseover', this._mouseover.bind(this));
		Ss.util.disableTextSelection(this.trigger);
        pulldown.subscribe(function(m){
          if(m.state == 'expanded') {
            $(document).observe('click', clickAway);
          }
          else if(m.state == 'collapsed') {
            $(document).stopObserving('click', clickAway);
          }
        });
	},
	_click: function(event) {
		this._toggleState();
	},
	_mouseout: function(event) {
		if( !Position.within($(this.element), Event.pointerX(event), Event.pointerY(event)) &&
			!Position.within($(this.contentContainer), Event.pointerX(event), Event.pointerY(event)) &&
			this.state != Ss.Pulldown.STATES.collapsed)
		{
			this._tId = (function() {
                        	this.collapse();
                       	}).bind(this).delay(Ss.Pulldown.COLLAPSE_DELAY_SECONDS);
		}
	},
	_mouseover: function(event) {
		if(this._tId)
			window.clearTimeout(this._tId);
	},
	_reset: function() {
		$H(Ss.Pulldown.STATES).values().each(function(state) {
			$(this.element).removeClassName(state);
		}, this);
		this.contentContainer.setStyle({
				'marginLeft': '',
				'marginTop': ''
		});
	},

	_setState: function(state) {
		this._reset();
		this.state = state;
		$(this.element).addClassName(state);
		this.notify({state: state});
	}
	
});


if(Prototype.Browser.IE) {
	Ss.Pulldown.addMethods({
		_showIframe: function() {
			if(!this._iframe) {
				var iframe = new Element('IFRAME', {
					frameborder: 0
				});
				var dim = $(this.contentContainer).getDimensions();
				iframe.setStyle({
					position: 'absolute',
					top: '0',
					left: '0',
					height: dim.height + 'px',
					width: dim.width + 'px',
					zIndex: '-1'
				});
				this.contentContainer.insert({top: iframe});
				this._iframe = iframe;
			}
			$(this._iframe).show();
		},
		_hideIframe: function() {
			if(this._iframe) {
				$(this._iframe).hide();
			}
		}
	});
}

/****************
 * Ajax Pulldown
 */
Ss.AjaxPulldown = Class.create(Ss.Pulldown, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar, url, parameters, callback) {
		$super(element, trigger, content, contentContainer, titleBar);
		this.url = url;
		this.parameters = parameters;
		this.callback = callback;
		this.isLoaded = false;
	},
	load: function() {
		this.showLoading();
		this.isLoaded = true;
		var ap = this;
		var xhr = new Ajax.Request(ap.url, {
			parameters: ap.parameters,
			onSuccess: function(response) {
				ap.appendContent(response.responseText);
				response.responseText.evalScripts();
				ap._doCallback(response);
				ap.expand();
				ap.hideLoading();
			}
		});			
	},
	setCallback: function(f) {
		this.callback = f;
	},
	_doCallback: function(response) {
		if(Object.isFunction(this.callback)) {
			this.callback.call(this, response);
		}		
	},
	_click: function(event) {
		this[ this.isLoaded ? '_toggleState' : 'load']();
	}
});


/******************
 * Select Pulldown
 */
Ss.SelectPulldown = Class.create(Ss.Pulldown, {
	initialize: function($super, element, trigger, content, contentContainer, titleBar, charLimit) {
		$super(element, trigger, content, contentContainer, titleBar);
		this.charLimit = charLimit;
	},
	items: function() {
		return $(this.element).select('LI');
	},
	select: function(key) {
		var item = this.find(key);
		if(item) {
			return this._select(item);
		}
		throw("Item '" + key + "' not found");
	},
	find: function(key) {
		if(Object.isNumber(key) 
			&& this.items().length > key) 
		{
			return this.items()[key];
		}
		if(Object.isString(key)) {
			return this.items().find(function(item) {
				return (Ss.util.getElementText(item).toLowerCase() == key.toLowerCase())
			});
		}
		return false;
	},
	_appendItem: function($super, item) {
		this._registerItem(item);
		$super(item);
	},
	_select: function(item) {
		this.items().invoke("show");
		$(item).hide();
		this.replaceTrigger(this._toTrigger(item));
		this.collapse();
		this.notify({state: this.state, selected: item});
	},
	_toTrigger : function(item) {
		var triggerText = Ss.util.getElementText(item).truncate(this.charLimit);
		var icon = $(item).select("IMG").shift();
		var trigger = new Element('SPAN').update(triggerText);
		if(icon) {
			trigger.insert({top: icon.cloneNode(true)});
		}
		return trigger;
	},
	_events: function($super) {
		$super();
		this._registerItems();
	},
	_registerItems: function() {
		this.items().each(function(item) {
			this._registerItem(item);
		}, this);
	},
	_registerItem: function(item) {
		$(item).observe('click', (function(event) {
			this._select(item);
		}).bind(this));
	}
});


/***********************
 * Ajax Select Pulldown
 */
Ss.AjaxSelectPulldown = Class.create(Ss.SelectPulldown);
Ss.AjaxSelectPulldown.addMethods({
	initialize: function($super, element, trigger, content, contentContainer, titleBar, charLimit, url, parameters, callback) {
		$super(element, trigger, content, contentContainer, titleBar, charLimit);
		this.url = url;
		this.parameters = parameters;
		this.callback = callback;
		this.isLoaded = false;
	},
	load: Ss.AjaxPulldown.prototype.load,
	setCallback: Ss.AjaxPulldown.prototype.setCallback,
	_click: Ss.AjaxPulldown.prototype._click,
	_doCallback: function(response) {
		this._registerItems();
		Ss.AjaxPulldown.prototype._doCallback.apply(this);
	}
});


/**************************s
 * Class Properties/Methods
 */
Ss.Pulldown.INSTANCES = new Hash();
Ss.Pulldown.COLLAPSE_DELAY_SECONDS = .3;
Ss.Pulldown.STATES = { //CSS class names applied/removed when current state changes
	collapsed: 'collapsed',
	expanded:  'expanded'
};
Ss.Pulldown.COMPONENTS = { //CSS class names used for various elements/subcomponents
	element:            'pulldown',
	trigger:            'pulldown_trigger',
	contentContainer:   'pulldown_content_container',
	content:            'pulldown_content',
	loading:            'pulldown_loading',
	openIcon:           'pulldown_open_icon',
	titleBar:           'pulldown_title_bar'
};

Ss.Pulldown.get = function(id) {
	return Ss.Pulldown.INSTANCES.get(id);
};

Ss.Pulldown.create = function(id) {
	return Ss.Pulldown.construct(Ss.Pulldown.createElement(id));
};

Ss.Pulldown.construct = function(element) {
    var pulldown = new Ss.Pulldown(element, 
			Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
				Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
				Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
				Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar));
    return pulldown;
};
Ss.AjaxPulldown.construct = function(element, url, parameters, callback) {
	return new Ss.AjaxPulldown(element,
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		url, parameters, callback);
};
Ss.SelectPulldown.construct = function(element, charLimit) {
	return new Ss.SelectPulldown(element, 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		charLimit);
};
Ss.AjaxSelectPulldown.construct = function(element, charLimit, url, parameters, callback) {
	return new Ss.AjaxSelectPulldown(element,
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.trigger), 
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.content),
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.contentContainer),	
		Ss.Pulldown.getComponent(element, Ss.Pulldown.COMPONENTS.titleBar),
		charLimit, url, parameters, callback);
};

Ss.Pulldown.createElement = function(id) {
	var t = new Template('<div class="#{trigger}"><a class="#{openIcon}">&#9660;</a></div><div class="#{contentContainer}"><div class="#{content}"></div><div class="#{titleBar}"><a>&#215;</a></div></div>');
	var element = new Element("DIV", {"class": Ss.Pulldown.COMPONENTS.element}).insert(t.evaluate(Ss.Pulldown.COMPONENTS));
	return ( id ? element.writeAttribute({"id":id}) : element );
};

Ss.Pulldown.getComponent = function(element, type) {
	return $(element).select("." + type).shift();
};

Ss.Pulldown.jsonToItem = function(obj) {
	var anchor = new Element('A').update(obj.name);
	var item = new Element('LI').update(anchor);	
	if(obj.icon_src) {
		anchor.insert({top: new Element('IMG', {src: obj.icon_src})});
	}
	if(Object.isString(obj.onclick)) {
		item.observe('click', function() {eval(obj.onclick);})
	}
	else if(Object.isFunction(obj.onclick)) {
		item.observe('click', obj.onclick);
	}
	return item;
};
Ss.Pulldown.jsonToItems = function(jsonArr) {
	var items = [];
	jsonArr.each(function(obj) {
		items.push(Ss.Pulldown.jsonToItem(obj));
	});
	return items;
};


Ss.Pulldown.convert = function(select, id, charLimit) {
	var sOptions = select.select('option');
	var sPulldown = Ss.SelectPulldown.construct(Ss.Pulldown.createElement(id), charLimit);
	var optionsJson = sOptions.collect(function(option, i){return {name: option.text, index: i};});
	sPulldown.appendJson(optionsJson);
	sPulldown.select(select.options[select.selectedIndex].text);
	sPulldown.subscribe(function(state){
		var selectedItem = state.selected;
		if(selectedItem){
			var selectedText = Ss.util.getElementText(selectedItem);
			var itemObj = optionsJson.find(function(obj){return obj.name == selectedText});
			select.selectedIndex = itemObj.index;
		}
	});
	select.insert({after: sPulldown.element});
	select.hide();
	return sPulldown;
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Pulldown.js'

// global.js: begin JavaScript file: '/js/Share.js'
// ================================================================================
Ss = window.Ss || {};
Ss.share = {
	pulldowns: [],
	translatedToError: "",
	translatedFromError: "",
	translatedAddressError: "",
	
	closeEmailForm: function(e) {
		$(e).down('.network-form').reset();
		$(e).down('.message-area').hide();
		$(e).down('.email-form-container').hide();
		$(e).down('.network-errors').update();
		$(e).down('.social_network_list').show();
	},
	
	openEmailForm: function(e) {
		$(e).up('.share_interface_content').down('.email-form-container').show();
		$(e).up('.share_interface_content').down('.social_network_list').hide();
	},
	

	addPulldown: function(pulldown) {
		this.pulldowns.push(pulldown);
	},
	
	getPulldown: function(e){
		return this.pulldowns.find(function(p){ return e.descendantOf(p.getElement()); });
	},
	
	toggleNetworkEmail: function(e) {		
		this.openEmailForm(e);
		

		var pulldown = this.getPulldown(e);
		

		pulldown._resize();
		

		pulldown.subscribe( function(data) {
			if(data.state == Ss.Pulldown.STATES.collapsed) {
				Ss.share.closeEmailForm(pulldown.getElement());
				pulldown.unsubscribe(arguments.callee);
			}
		});
	},
	
	sendNetworkEmail: function(t) {

		var container = $(t).ancestors().find(function(e){return e.match('.share_interface_content');});
		if (this.validateAddresses($(t).up('form'))) {
			$(t).up('form').request({
				onFailure: function(){ 
					alert('Sorry, your message was not sent.');
				}
			});
			container.descendants().find(function(e){return e.match('.email-form-container');}).hide();
			container.down('.message-area').show();
		}
	},
	
	validateAddresses: function(form) {
		var addressList = new Array();
		var errors      = new Array();
		var fromAddress = form.getInputs('text', 'from')[0].getValue();
	
		if (!fromAddress) {
			errors.push(this.translatedFromError);
		}
	
		var toAddresses = form.getInputs('text', 'to')[0].getValue().split(/\s*\,\s*/);
	
		if (toAddresses && !toAddresses[0]) {
			errors.push(this.translatedToError);
		}
	
		var allAddressesValid = true;
		var translatedAddressError = this.translatedAddressError;
		$A([[fromAddress], toAddresses]).flatten().each(function(address) {
			if (!address.match(/[\w.-]+\@[\w.-]+\.[\w]{2,5}/)) {
				allAddressesValid = false;
				errors.push( translatedAddressError + " '" + address + "'");
			}
		});
	
		if (!allAddressesValid) { 
			var errorMessage = errors.shift();
			form.previous().update(errorMessage);
		}
		return allAddressesValid;
	},
	
	open: function(path) {
		window.open(path);
	},
	
	close: function(e) {
		this.getPulldown(e).collapse();
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Share.js'

// global.js: begin JavaScript file: '/js/search_ui/SearchWithin.js'
// ================================================================================
Ss = window.Ss || {};

Ss.SearchWithin = {
	
	initialize: function() {

		var advancedSearch = $('pf_advanced_search'),
			keywordTextInput = $('pf_keyword_input'),
			keywordLabel = $('pf_keyword_label'),
			firstLabel = $$('#pf_advanced_search label')[0],
			notch = $$('#pf_advanced_search .shadow_arrow_top')[0],
			notchLeft = parseInt(notch.getStyle('left')),
			advancedMenuToggle = $('pf_toggle_advanced'),
			hiddenFieldToggle = $('show_pf_hidden_fields'),
			hiddenFields = $('pf_hidden_fields'),
			container = $('pf_search_within'),
			editorialCheckbox = $('editorial_checkbox'),
			peopleCheckbox = $('people_checkbox'),
			peopleSelects = $$('#people_selects select'),
			allFields = $$('#pf_advanced_search input[type=text], #pf_advanced_search input[type=checkbox], #pf_advanced_search select'),
			body = $$('body').first();
		
		var syncPeopleAndEditorial = function() {
			if (editorialCheckbox) {
				if(peopleCheckbox.checked) {
					editorialCheckbox.checked = false;
					editorialCheckbox.disabled = true;
				} else {
					editorialCheckbox.disabled = false;
				}
			}
		};
		

		keywordTextInput.observe('focus', function(evt) {
			advancedSearch.show();
		});
		

		advancedMenuToggle.observe('click', function(evt) {
			advancedSearch.toggle();
		});



		if(hiddenFieldToggle) {
			hiddenFieldToggle.observe('click', function(evt) {
				hiddenFields.show();
				hiddenFieldToggle.up('tr').hide();
				
			});
		}
		

		body.observe('click', function(evt) {
			var target = evt.findElement();
				
			if( target.isElementOrDescendantOf(container) &&
				!target.isElementOrDescendantOf(notch)
			) {
				return;
			}
			advancedSearch.hide();
		});
		
		peopleCheckbox.observe('change', function(evt) {
				peopleSelects.each(function(select) {select.value = '';});
				syncPeopleAndEditorial();
		});
		
		peopleSelects.invoke('observe', 'change', function(evt) {
				peopleCheckbox.checked = true;
				syncPeopleAndEditorial();
		});
		

		$('clear_all').observe('click', function(evt) {
			allFields.each(
				function(field) {
					if(field.type && field.type == 'checkbox') {
						field.checked = false;   
					} else {
						field.value = ''; // works on selects and text inputs
					}
					if(field.disabled == true){
						field.disabled = false;
					}
				}
			);
			clearColor();
		});
		

		new Ss.input.InFieldLabel({
				label: keywordLabel,
				field: keywordTextInput
		});
		

		syncPeopleAndEditorial();
		

		Ss.color.init({
			swatch: advancedSearch.down('.swatch'),
			wheel: advancedSearch.down('.wheel'),
			form: advancedSearch.up('form'),
			clear: advancedSearch.down('.clear_color'),
			hexInput: advancedSearch.down('input[name=color]')
		});
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/SearchWithin.js'

// global.js: begin JavaScript file: '/js/search_ui/searchForm.js'
// ================================================================================
Ss.searchForm = {
    shim: null,
    
	initialize: function(args) {
		var ctr = args.container;
		this.els = {
			container: ctr,
			layer: args.layer, // for autocomplete
			input: ctr.down('input[name=searchterm]'),
			form: ctr.down('form'),
			mediaSelected: ctr.down('.media_selected'),
			mediaOptions: ctr.down('.media_options')
		};
        this.mediaTypes = args.mediaTypes;

		this.suggest = Ss.suggest.create({
			input: this.els.input,
			layer: this.els.layer,
			language: args.autocompleteLanguage,
			focusOnKeydown: args.focusOnKeydown
		});

		if(!Ss.Browser.supports.placeholder()) {
			this._shim = this._placeholder();
			Ss.search.subscribe('show', this._shim.update.bind(this._shim));
		}
		this.setupMediaMenu();
    },
    setupMediaMenu: function() {
        var mediaOptions = this.els.mediaOptions;
        var form  = this.els.form;
        var mediaSelected = this.els.mediaSelected;
        var meta = this.mediaTypes;
        mediaOptions.addToggle(mediaSelected, { className: 'media_menu_open'});
        mediaOptions.delegateClick('li', function(evt){
            var type = evt.target.getAttribute('data-media-type');
            Ss.searchForm.setMediaType(type);
            mediaOptions.hide();
            document.body.removeClassName('media_menu_open');
        });
        document.observe('searchform:change', function(evt) {
            var type = evt.memo.mediaType;
            mediaSelected.update(meta[type].label);
            form.action = meta[type].action;
        });
    },
	setMediaType: function(type) {
	    document.fire('searchform:change', { mediaType: type });
	},
    clear: function() {
        this.els.input.clear();
        if(this._shim) {
            this._shim.clear();
        }
    },
    _placeholder: function() {
        var input = this.els.input;
        var placeholder = input.getAttribute('placeholder');
        var label;
        input.insert({ before: '<span class="in_field_label">' + placeholder + '</span>' });
        label = this.els.container.down('.in_field_label');
        return new Ss.input.InFieldLabel({
                label: label,
                field: input
        });
    }
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/searchForm.js'

// global.js: begin JavaScript file: '/js/search_ui/advancedSearch.js'
// ================================================================================
Ss.advancedSearch = {
	initialize: function(args) {
		var ctr = args.container;
		this.phrases = args.phrases;
		this.els = {
			container: ctr,
			trigger: ctr.previous('.advanced_trigger'),
			form: ctr.up('form'),
			mediaFields: ctr.select('input[name=media_type]'),
			peopleFieldsToggle: ctr.down('.more_people_toggle'),
			peopleFieldsContainer: ctr.down('.more_people'),
			peopleFields: ctr.select('.more_people select'),
			peopleOnly: ctr.down('input[name=model_released]'),
			noPeople: ctr.down('input[name=no_people]'),
			editorial: ctr.down('input[name=editorial]'),
			category: ctr.down('select[name=search_cat]'),
			clear: ctr.down('.button_clear')
		};
		this.contributorMenu= new Ss.ContributorDropdown(this.els.container.down('.photographer_menu'));
		this.colorMenu = this.makeColorMenu();
		this.setupMutexFields();
		this.setupToggles();
		this.setupMediaFields();
		


		Ss.search.subscribe('show', this.reset.bind(this));
	},
	setupToggles: function() {
		var els = this.els;
		var phrases = this.phrases;
		els.peopleFieldsToggle.observe('click', function(evt) {
			els.peopleFieldsContainer.toggle();
			var text = (els.peopleFieldsContainer.visible() ? phrases['LESS_PEOPLE_OPTIONS'] : phrases['MORE_PEOPLE_OPTIONS'] );
			this.update(text);
		});
		els.clear.observe('click', this.clear.bind(this));
		this.els.container.addToggle(this.els.trigger, { className: 'advanced_menu_open' });
	},
	setupMutexFields: function() {
		var els = this.els;
		var peopleCategories = [13,30,31];
		els.category.observe('change', function(evt) {
			if(peopleCategories.include(this.value)) {
				els.noPeople.checked = false;
			}
		});
		els.peopleFields.invoke('observe', 'change', function(evt) {
			if(this.selectedIndex > 0) {
				els.peopleOnly.checked = true;
				els.editorial.checked = false;
				els.noPeople.checked = false;
			}
		});
		els.peopleOnly.observe('click', function(evt) {
			if(this.checked) {
				els.editorial.checked = false;
				els.noPeople.checked = false;
			} else {
				els.peopleFields.invoke('clear');
			}
		});
		els.editorial.observe('click', function(evt) {
			if(this.checked) {
				els.peopleOnly.checked = false;
				els.peopleFields.invoke('clear');
			}
		});
		els.noPeople.observe('click', function(evt) {
			if(this.checked) {
				els.peopleOnly.checked = false;
				els.peopleFields.invoke('clear');
				if(peopleCategories.include(els.category.value)) {
					els.category.clear();
				}
			}
		});
	},
	makeColorMenu: function() {
	    var ctr = this.els.container;
		return Ss.color.init({
			swatch: ctr.down('.swatch'),
			wheel: ctr.down('.wheel'),
			form: ctr.up('form'),
			toggle: ctr.down('.toggle_wheel'),
			hexInput: ctr.down('input[name=color]'),
			clear: ctr.down('.swatch .close_btn'),
			closeWheel: ctr.down('.wheel .close_btn')
		});
	},
	setupMediaFields: function() {
		var form = this.els.form;
		var mediaFields = this.els.mediaFields;
		mediaFields.invoke('observe', 'click', function(evt) {
			this.fire('searchform:change', { mediaType: evt.target.value });
		});
		document.observe('searchform:change', function(evt) {
			if(mediaFields.include(evt.target)) {
				return;
			}
			var type = evt.memo.mediaType;
			var radio = form.down('input[value=' + type + ']');
			if(radio) {
				radio.checked = true;
			}
		});
	},
	getMediaType: function() {
		return this.els.form.down('input:checked[type=radio][name=media_type]').value;
	},
	setMediaType: function(type) {
	    document.fire('searchform:change', { mediaType: type });
	},
	clear: function() {
		this.els.container.select('input[type=checkbox], input[type=text], select').invoke('clearValue');
		this.setMediaType('images');
		this.colorMenu.clear();
	},
	reset: function() {
	    this.els.form.reset();
	    this.colorMenu.update();
	    this.setMediaType(this.getMediaType());
	},
	hide: function() {
	    this.els.container.hide();
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/advancedSearch.js'

// global.js: begin JavaScript file: '/js/search_ui/advancedSearchTips.js'
// ================================================================================
Ss = window.Ss || {};
Ss.advancedSearch = Ss.advancedSearch || {};

(function() {
	function Tip(event, element) {
		this.event = event;
		this.animationTime = 400;
		this.delay = .5;
		this.element = element;
		this.searchContainer = $('search_interface');
		this.state = 'hidden';
	}

	Tip.prototype.hide = function(evt) {
		var dropdown = Event.findElement(evt, '.media_select');
		var refineMenu = Event.findElement(evt, '.advanced_trigger');
		var close = Event.findElement(evt, '.advanced_search_tip .close_btn_nobox');
		var element = this.element;

		if(!dropdown && !close && !refineMenu) {
			return;
		}

		if(close) {
			element.removeClassName('in');

			(function() {
				element.remove();
			}).delay(this.animationTime);
		} else if(element) {
			element.remove();
		}


		new Ajax.Request('/show_component.mhtml', {
			method: 'get',
			parameters: {
				component_path: 'dismiss_notification.md',
				event_type: this.event['name'],
				event: this.event['key']
			}
		});

		this.state = 'removed';

		return true;
	};

	Tip.prototype.show = function(delay) {
		var element = this.element;

		if(delay) {
			(function() {
				element.show();
				element.addClassName.bind(element).defer('in');
			}).delay(this.delay);
		} else {
			element.show();
			element.addClassName.bind(element).defer('in');
		}


		new Ajax.Request('/show_component.mhtml', {
			method: 'get',
			parameters: {
				component_path: 'dismiss_notification.md',
				event_type: this.event['name'],
				event: this.event['key'],
				record_event: 0
			}
		});

		this.state = 'visible';
	}

	Ss.advancedSearch.tip = {
		initDropdown: function(element, activated) {
			var trigger = $$('input[name="searchterm"]').first();
			var feature = $$('#search_interface .media_select').first();
			var dropdown = new Tip({
				name: 'adv_search_dropdown_tip',
				key: '03-2014'
			}, element);

			if(activated) {
				dropdown.closeHandler = function(evt) {
					if(dropdown.hide(evt)) {
						dropdown.searchContainer.stopObserving('click', dropdown.closeHandler);
					}
				};

				dropdown.triggerHandler = function() {
					if(dropdown.state == 'hidden') {
						dropdown.show();
						trigger.stopObserving('click', dropdown.triggerHandler);

						(function() {
							dropdown.searchContainer.observe('click', dropdown.closeHandler);
						}).delay();
					}
				};

				if(element && trigger) {
					trigger.observe('click', dropdown.triggerHandler);
				}

			}

			dropdown.preHandler = function(evt) {
				if(dropdown.state == 'hidden') {
					dropdown.hide(evt);
				}

				feature.stopObserving('click', dropdown.preHandler);
			}


			feature.observe('click', dropdown.preHandler);
		},
		initRefine: function(element, activated) {
			var feature = $$('#search_interface .advanced_trigger').first();
			var refine = new Tip({
				name: 'adv_search_refine_tip',
				key: '03-2014'
			}, element);

			if(activated) {
				refine.closeHandler = function(evt) {
					if(refine.hide(evt)) {
						refine.searchContainer.stopObserving('click', refine.closeHandler);
					}
				};

				Ss.search.subscribe('update', function(evt) {
					if(evt && evt.page == 2 && refine.state == 'hidden') {
						refine.show(true);
						refine.searchContainer.observe('click', refine.closeHandler);
					}
				});

			}

			refine.preHandler = function(evt) {
				if(refine.state == 'hidden') {
					refine.hide(evt);
				}

				feature.stopObserving('click', refine.preHandler);
			}


			feature.observe('click', refine.preHandler);
		}
	}
}());
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/advancedSearchTips.js'

// global.js: begin JavaScript file: '/js/search_ui/sortForm.js'
// ================================================================================
Ss = window.Ss || {};

Ss.sortForm = {
    initialize: function() {
        this.element = $('grid_options_top');
	    this.element.delegateClick('#grid_options_top label',
	        function(evt) {
	            var label = Event.findElement(evt, 'label');
	            var input = label.down('input');
	            var form = input.up('form');
                if(label.hasClassName('nolink')) { // if the clicked sort method is currently selected, do nothing
                    Event.stop(evt);
                    return;
                }
                Ss.sortForm.showLoading();
                (function(){
                    form.fire('sortForm:submit');
                    form.submit();
                }).defer();
	        }
	    );
    },
	showLoading: function(){
	    var text = $('sort_text');
	    var msg = $('sort_text_msg');
	    var loading = $('sort_loading');
		loading.show();
		Ss.search.showLoading();
		text.setStyle({width: text.getWidth()+'px'});
		if(Object.isElement(msg)) {
			msg.hide();
		}
	},
	getSelectedMethod: function() {
	    return this.element.down('input[name=sort_method][checked=checked]').value;
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search_ui/sortForm.js'

// global.js: begin JavaScript file: '/js/color_wheel.js'
// ================================================================================
Ss.color = {};
Ss.color.init = function(els) {


    var swatchc = null;
    var wheel;
    var swatch;
    var form;
    var clear;
    var hexInput;
    hue = 60;
    adeg = 60;
    sat = 1;
    val = 1;
    
    function getRealLeft() {
      xPos = this.offsetLeft;
      tempEl = this.offsetParent;
      while (tempEl != null) {
          xPos += tempEl.offsetLeft;
          tempEl = tempEl.offsetParent;
      }
      return xPos;
    }
    
    function getRealTop() {
      yPos = this.offsetTop;
      tempEl = this.offsetParent;
      while (tempEl != null) {
          yPos += tempEl.offsetTop;
          tempEl = tempEl.offsetParent;
      }
      return yPos;
    }
    
    function colorWheelInit(els) {
      swatch = els.swatch;
      wheel = els.wheel;
      form = els.form;
      clear = els.clear;
      hexInput = els.hexInput;
      wheel.getRealTop = getRealTop;
      wheel.getRealLeft = getRealLeft;
      
      var doUpdate = function() {
          if(!form.color.value.startsWith('#')) {
              form.color.value = '#' + form.color.value;
          }
          updateColor();
      };

      wheel.observe('mousemove', mouseMoved);
      hexInput.observe('change', doUpdate);
      hexInput.observe('keypress', function(evt) {
        if(evt.keyCode == Event.KEY_RETURN) {
            evt.preventDefault();
            doUpdate();
        }
      });
      hexInput.observe('blur', doUpdate);
      
      if(clear) {
          clear.observe('click', clearColor);
      }
      wheel.observe('click', clickWheel);
      if(els.toggle) {
          wheel.addToggle(els.toggle);
      }
      if(els.closeWheel) {
      	  els.closeWheel.observe('click', function(evt){
      	  	wheel.hide();
      	  	Event.stop(evt);
      	  });
      }
      swatchc = hexInput.value;
      updateColor();
      return {
          els: els,
          clear: clearColor,
          update: updateColor
      };
    }
    

    function hsv2rgb(Hdeg,S,V) {
      H = Hdeg/360;     // convert from degrees to 0 to 1
      if (S==0) {       // HSV values = From 0 to 1
        R = V*255;     // RGB results = From 0 to 255
        G = V*255;
        B = V*255;}
      else {
        var_h = H*6;
        var_i = Math.floor( var_h );     //Or ... var_i = floor( var_h )
        var_1 = V*(1-S);
        var_2 = V*(1-S*(var_h-var_i));
        var_3 = V*(1-S*(1-(var_h-var_i)));
        if (var_i==0)      {var_r=V ;    var_g=var_3; var_b=var_1}
        else if (var_i==1) {var_r=var_2; var_g=V;     var_b=var_1}
        else if (var_i==2) {var_r=var_1; var_g=V;     var_b=var_3}
        else if (var_i==3) {var_r=var_1; var_g=var_2; var_b=V}
        else if (var_i==4) {var_r=var_3; var_g=var_1; var_b=V}
        else               {var_r=V;     var_g=var_1; var_b=var_2}
        R = Math.round(var_r*255);   //RGB results = From 0 to 255
        G = Math.round(var_g*255);
        B = Math.round(var_b*255);
      }
      return new Array(R,G,B);
    }
    
    function rgb2hex(rgbary) {
      cary = new Array; 
      cary[3] = "#";
      for (i=0; i < 3; i++) {
        cary[i] = parseInt(rgbary[i]).toString(16);
        if (cary[i].length < 2) cary[i] = "0"+ cary[i];
        cary[3] = cary[3] + cary[i];
        cary[i+4] = rgbary[i]; //save dec values for later
      }


      return cary;
    }
    
    function webRounder(c,d) {//d is the divisor

      thec = "#";
      for (i=0; i<3; i++) {
          num = Math.round(c[i+4]/d) * d; //use saved rgb value
          numc = num.toString(16);
          if (String(numc).length < 2) numc = "0" + numc;
          thec += numc;
      }
      return thec;
    }
    
    function hexColorArray(c) { //now takes string hex value with #
        swatchc = c[3];
        return false;
    }
    
    function mouseMoved(e) {
      x = e.pageX - this.getRealLeft();
      y = e.pageY - this.getRealTop();
    }
    
    function clickWheel() {
        cartx = x - 64;
        carty = 64 - y;
        cartx2 = cartx * cartx;
        carty2 = carty * carty;
        cartxs = (cartx < 0)?-1:1;
        cartys = (carty < 0)?-1:1;
        cartxn = cartx/64;                      //normalize x
        rraw = Math.sqrt(cartx2 + carty2);       //raw radius
        rnorm = rraw/64;                        //normalized radius
        if (rraw == 0) {
            sat = 0;
            val = 0;
            rgb = new Array(0,0,0);
        }
        else {
            arad = Math.acos(cartx/rraw);            //angle in radians 
            aradc = (carty>=0)?arad:2*Math.PI - arad;  //correct below axis
            adeg = 360 * aradc/(2*Math.PI);  //convert to degrees
            if (rnorm > 1) {    // outside circle
                rgb = new Array(255,255,255);
                sat = 1;
                val = 1;            
            }

            else if (rnorm >= .5) {
                sat = 1 - ((rnorm - .5) *2);
                val = 1;
                rgb = hsv2rgb(adeg,sat,val);
            } else {
                sat = 1;
                val = rnorm * 2;
                rgb = hsv2rgb(adeg,sat,val);
            }
        }
        c = rgb2hex(rgb);
        hexColorArray(c);
        setSwatchColor();
        return false;
    }
    
    function setSwatchColor() {
      swatch.setStyle({
              'backgroundColor': swatchc
      });
      swatch.show();
      form.color.value = swatchc;
      return false;
    }
    
    function updateColor() {
      color = form.color.value;
      if (color.length == 7) {
       swatchc = color;
       setSwatchColor();
      } else {
          clearColor();
      }
    }
    
    function clearColor() {
        swatchc = '';
        setSwatchColor();
        hexInput.clear();
        swatch.hide();
    }
    
    return colorWheelInit(els);
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/color_wheel.js'

// global.js: begin JavaScript file: '/js/ContributorDropdown.js'
// ================================================================================
Ss = window.Ss || {};

Ss.ContributorDropdown = Class.create({
	
	initialize: function(ctr) {
	    
	    this.ctr = ctr;
	    this.input = ctr.down('input');
	    this.list = ctr.down('div');
	    this.loader = ctr.down('span');
	    
        this.lastSequenceNumber = 0;
        this.maxDisplayCount = 10;
        this.pendingRequests = [];
        this.activePrefix = undefined;
        this.dropdownDialogShowing = false;
        
	    var instance = this;
	    this.input.observe('keyup', function(evt) {
	            instance.getMatchingNames(this.value);
	    });
	    
	    this.list.observe('click', function(evt) {
	        var item = Event.findElement(evt, 'a');
	        if(item) {
	            instance.setPhotographer(item.getAttribute('data-photographer'));
	        }
	    });
	},
	
	setPhotographer: function(item) {
		this.input.value = item;
		this.hideList();
	},
	
	hideList: function() {
	    this.list.hide();
	},
	
	populateList: function() {
		

		if (Ss.ContributorDropdown.sequenceNumber != this.lastSequenceNumber) {
			return;
		}
		
		var instance = this;
		var prefix = this.activePrefix;
		var indexPhotographers = Ss.ContributorDropdown.photographers[ prefix.substr(0, 2) ];

		var prefixRegex = new RegExp('\\b(' + prefix + ')', 'i');
		var matchingPhotographers = indexPhotographers.pluck('n').grep(prefixRegex);
		var matchesCount = matchingPhotographers.length;
		matchingPhotographers = matchingPhotographers.splice(0, 10);


		if ( matchesCount == 1 ) {
			var testRegex = new RegExp('^' + matchingPhotographers + '$', 'i');
			if (prefix.match(testRegex)) {
				this.hideList();
				return;
			}
		}
		var htmlBuffer = '';
		matchingPhotographers.each(function(item) {
			var highlightedItem = item.replace(prefixRegex, "<b>$1</b>"); 
			var escapedItem = item.replace(/\'/g, '\\\'');
			htmlBuffer += '<a data-photographer="' + escapedItem + '">' + highlightedItem + '</a>';
		});

		if (matchesCount > this.maxDisplayCount) 
			htmlBuffer += '<div>...</div>';

		var listDiv = this.list;
		listDiv.innerHTML = htmlBuffer;
		listDiv.style.display = 'block';

		this.dropdownDialogShowing = true;

		if (Ss.ContributorDropdown.sequenceNumber == this.lastSequenceNumber) {
			this.loader.hide();
		}
	},
	
	getMatchingNames: function(prefix) {
		
	    var instance = this;
	    
		if (!prefix) {
			this.hideList();
			return;
		}

		prefix = prefix.toLowerCase();
		this.activePrefix = prefix;

		if (this.pendingRequests[prefix.substr(0,2)] == undefined) {

			if (!prefix.substr(0,2).match(/^\w/))
				return;

			this.pendingRequests[prefix.substr(0,2)] = true;
			
			_debug(prefix + ' : request: ' + prefix.substr(0,2));
			
			this.loader.show();
			new Ajax.Request('/display_names.js', {
				method: 'get',
				parameters: { prefix: prefix.substr(0,2), sequence_number: ++this.lastSequenceNumber },
				onComplete: function(transport) {
					instance.populateList();
				}
			});
		} else if (this.pendingRequests[prefix.substr(0,2)] && !Ss.ContributorDropdown.photographers[prefix.substr(0,2)]) {
			/* do nothing */
		} else {
			instance.populateList();
		}
	}
});
Ss.ContributorDropdown.sequenceNumber = 0;
Ss.ContributorDropdown.photographers = [];
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ContributorDropdown.js'

// global.js: begin JavaScript file: '/js/HelpText.js'
// ================================================================================
Ss = window.Ss || {};
Ss.HelpText = {
    css: {
        ACTIVE: 'help_text_trigger_active',
        LOADING: 'help_text_trigger_loading'
    },
    elems: [],
    keyToText: new Hash(), // updated via ajax
    textLoaded: false,
    add: function(elem, key){
        if(this.elems.include(elem)) {
            return;
        }
        elem.observe('click', function(e) {
            Event.stop(e); // prevent the default for the event
            this.isActive(elem) ? this.hideText(elem) : this.showText(elem, key);
        }.bind(Ss.HelpText));   
        this.elems.push(elem);
    },
    loadText: function(elem, key) {
        this.textLoaded = true;
        this.showLoading(elem);
        new Ajax.Request('/show_component.mhtml', {
                method: 'get',
                evalJSON: true,
                parameters: {
                    component_path: '/search_ui/get_help_text.mh'
                },
                onSuccess: function(response) {
                    Ss.HelpText.hideLoading(elem);
                    Ss.HelpText.keyToText.update(response.responseJSON);
                    Ss.HelpText.showText(elem, key);
                }
        });
    },
    showText: function(elem, key) {
        if(!this.textLoaded) {
            this.loadText(elem, key);
            return;
        }
        this.activateElem(elem);
        Ss.ShadowContainer.write(this.getTextByKey(key), {
        	position: {
        		target: elem
        	},
			modal: false
        });
        var observer= function(e) {
            if(e.type == 'hide') {
                Ss.HelpText.deactivateElem(elem); // deactivate the icon when the text is hidden
                Ss.ShadowContainer.stopObserving(observer);
            }
        };
        Ss.ShadowContainer.observe(observer);
    },
    hideText: function(elem) {
        this.deactivateElem(elem);
        Ss.ShadowContainer.hide();
    },
    hideLoading: function(elem) {
        elem.removeClassName(this.css.LOADING);
    },
    showLoading: function(elem) {
        elem.addClassName(this.css.LOADING);
    },
    isActive: function(elem) {
        return elem.hasClassName(this.css.ACTIVE);
    },
    activateElem: function(elem) {
        this.elems.invoke('removeClassName', this.css.ACTIVE);
        elem.addClassName(this.css.ACTIVE);
    },
    deactivateElem: function(elem) {
        elem.removeClassName(this.css.ACTIVE);
    },
    getTextByKey: function(key) {
        return this.keyToText.get(key);
    }
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/HelpText.js'

// global.js: begin JavaScript file: '/js/Follow.js'
// ================================================================================
Ss = window.Ss || {};

Ss.Follow = {
	

	request: function(action, submitter, callback) {
		var paths = {
			'follow':	'/profile/follow_contributor.md',
			'unfollow':	'/profile/unfollow_contributor.md'
		};
		
		if(Object.isUndefined(submitter)) {
			throw 'A submitter id is required';
		}
		
		if(!Object.isString(action) || !Object.keys(paths).include(action)) {
			throw 'A valid action is required';
		}
		
		new Ajax.Request('/show_component.mhtml', {
			method: 'POST',
			parameters: {
				component_path: paths[action],
				submitter: submitter
			},
			onSuccess: Object.isFunction(callback) ? callback : Prototype.emptyFunction
		});
	}
	
};



Ss.Follow.Button = Class.create({
	
	initialize: function(args) {
		
		if(Object.isUndefined(args.submitter)) {
			throw 'submitter id is required';
		}
		
		if(!Object.isElement(args.element)) {
			throw 'button element required';
		}
		
		this.element = args.element;
		this.submitter = args.submitter;
		this.firstFollowMessage = args.firstFollowMessage;
		

		this._events();
	},
	

	classNames: {
		'follow':		['follow'],
		'following':	['following', 'button_white'],
		'unfollow':		['unfollow', 'button_gray']
	},
	


	show: function(state) {
		
		var element = this.element;
		

		if(!Object.keys(this.classNames).include(state)) {
			throw 'invalid state set on button';
		}
		

		Object.values(this.classNames).flatten().each(
			function(className) {
				element.removeClassName(className);
			}
		);
		

		this.classNames[state].each(
			function(className) {
				element.addClassName(className);
			}
		);
	},
	

	isShowing: function(state) {
		var element = this.element;
		return Object.keys(this.classNames).include(state) &&
			this.classNames[state].all(
				function(className) {
					return element.hasClassName(className);
				}
			);
	},
	
	

	_events: function() {
		

		var button = this,
			unfollowText = button.element.down('.unfollow_text'),
			followingText = button.element.down('.following_text');


		button.element.observe('click', function(evt) {
				



			
			if( button.isShowing('follow') ) {
				button.show('following');
				Ss.Follow.request('follow', button.submitter,
					function(response) {
						if(
							!response || 
							!response.responseJSON || 
							!response.responseJSON.content
						) {
							return;
						}
						var numSearches = parseInt(response.responseJSON.content.searches);
						if(numSearches == 1 && !Object.isUndefined(button.firstFollowMessage)) {
							Ss.ShadowContainer.write(button.firstFollowMessage, {
								className: 'pf_follow_tip',
								modal: false,
								position: {
									target: button.element,
									type: 'bottom',
									offsetY: 11
								},
								notch: {type: 'top', styles: {top: '-14px', left: '79px'}}
							});
						}
					}
				);
			} 
			else if( button.isShowing('unfollow') || button.isShowing('following') ) {
				button.show('follow');
				Ss.Follow.request('unfollow', button.submitter);
			}
		});
		

		button.element.observe('mouseover', function(evt) {
			var mousingFrom = evt.relatedTarget || evt.fromElement;
			if(
				Object.isElement(mousingFrom) &&
				!mousingFrom.isElementOrDescendantOf(button.element) &&
				button.isShowing('following')
			){
				button.show('unfollow');
			}
		});
		

		button.element.observe('mouseout', function(evt) {
			var mousingTo = evt.relatedTarget || evt.toElement;
			if(
				Object.isElement(mousingTo) && 
				!mousingTo.isElementOrDescendantOf(button.element) &&
				button.isShowing('unfollow')
			) {
				button.show('following');
			}
		});
		



		if(Object.isElement(unfollowText) && Object.isElement(followingText)) {
			unfollowText.setStyle({
					minWidth: followingText.getWidth() + 'px'
			});
		}
		
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Follow.js'

// global.js: begin JavaScript file: '/js/PopupAnchor.js'
// ================================================================================
var Ss = window.Ss || Ss;

Ss.PopupAnchor = Class.create({
	initialize: function(element, winName, winWidth, winHeight) {
		this.element = element;
		this.winName = winName;
		this.winWidth = winWidth || 800;
		this.winHeight = winHeight || 600;
		

		this.element.observe('click', this.click.bind(this));
	},
	click: function(evt) {
		

			Event.stop(evt);
			

			var winSpecs = this._winSpecs();
			

			var url = this.element.href;
			var name = this.name;
			var features = $H({
					
				height: 	winSpecs.height,
				width: 		winSpecs.width,
				top: 		winSpecs.getTop(),
				left: 		winSpecs.getLeft(),
				menubar: 	'no',
				resizable: 	'yes',
				scrollbars: 'yes'
				
			}).collect(function(feat){ return feat.key + '=' + feat.value; }).join(', ');
			

			var newWin = window.open(url, name, features);
			

			newWin.focus();
			
	},
	_winSpecs: function() {
		

			var cWin = {
				width: 		window.outerWidth,
				height: 	window.outerHeight,
				left: 		(window.screenLeft || window.screenX),
				top: 		(window.screenTop || window.screenY)
			};
			

			return {
				width: 		this.winWidth,
				height: 	this.winHeight,
				getLeft: 	function(){return (cWin.width > this.width ? (cWin.width - this.width)/2 + cWin.left : cWin.left);},
				getTop: 	function(){return (cWin.height > this.height ? (cWin.height - this.height)/2 + cWin.top : cWin.top);}
			};
			
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/PopupAnchor.js'

// global.js: begin JavaScript file: '/js/ui_widgets/FlyoutLayer.js'
// ================================================================================

Ss.FlyoutLayer = {
	

	TRANSITION_DURATION:	.75, // matches transition-duration value defined in stylesheet
	CSS: {
		open: 					'flyout_layer_open',
		transition_ready: 		'flyout_transition_ready'
	},
	

	_isOpen: 		false,
	_scrollHandler:	false,
	_observers: 	[],
	

    initialize: function() {


        this.elements = {
            layer:		$('flyout_layer'),
            content:	$('flyout_layer_content'),
            currentContent: null
        };
        
        this._events();
    },
	
	write: function(content) {
	    
		var layer = this.elements.layer,
			contentContainer = this.elements.content;
			

	    if(this.hidden()) {
	        this.show();
	    }
	    

	    contentContainer.childElements().invoke('remove');
	    contentContainer.update();
	    contentContainer.insert(content);
	    this.elements.currentContent = content;
	    
		if(this.isClosed()) {
			layer.removeClassName(this.CSS.transition_ready);
		    this.updateXPosition(); // recalculate the closed x position to fit the new content
		    layer.addClassName.bind(layer).defer(this.CSS.transition_ready);
		}
		
		Ss.FlyoutLayer.notifyObservers({type: 'write'});
	},
	
	getCurrentContent: function() {
		return this.elements.currentContent;
	},
	
	open: function() {
		if(this.isOpen()) {
			return;
		}
		this.elements.layer.addClassName(this.CSS.open);
		this._slideTo(0, function() {
            this.notifyObservers({type: 'open'});
            this._isOpen = true;
		}.bind(this));
	},
	
	close: function() {
		if(this.isClosed()) {
			return;
		}
        this._slideTo(this._calculateXPosition(), function() {
            this.notifyObservers({type: 'close'});
            this.elements.layer.removeClassName(this.CSS.open);
            this._isOpen = false;
        }.bind(this));
	},

	closeNoAnim: function(){
		this.notifyObservers({type: 'close'});
		this.elements.layer.removeClassName(this.CSS.open);
		this.elements.layer.setStyle({'right':this._calculateXPosition() + 'px'});
		this._isOpen = false;
	},
	
	isOpen: function() {
		return this._isOpen;
	},

	isClosed: function() {
	    return !this._isOpen;
	},
	
	show: function() {
	    this.elements.layer.show();
	},
	
	hide: function() {
	    this.elements.layer.hide();
	},
	
	visible: function() {
	    return this.elements.layer.visible();
	},

	hidden: function() {
	    return !this.elements.layer.visible();
	},
	
	enableAutoOpen: function(scrollTarget, extraOffsetY) { 


	    
        if(this._scrollHandler) {
            return;
        }
        
		function cleanup(evt) {
            if(evt.type == 'open') {
                Ss.FlyoutLayer.disableAutoOpen();
                Ss.FlyoutLayer.unsubscribeObserver(cleanup);
            }
        }
        
	    var vpH = document.viewport.getHeight();
	    var offsetY = this.getYPosition();
	    
	    if(extraOffsetY) {
	        offsetY += extraOffsetY;
	    }
	    
	    this._scrollHandler = function(e) {
            if(scrollTarget.viewportOffsetFix().top + scrollTarget.getHeight() + this.getHeight() + offsetY <= vpH) {
                if(this.isClosed()) {
                    this.open();
                    this.disableAutoOpen();
                }
            }
        }.bind(this);
        Event.observe(window, 'scroll', this._scrollHandler);
		this.subscribeObserver(cleanup);
	},
	
	disableAutoOpen: function() {
	    if(this._scrollHandler) {
	        Event.stopObserving(window, 'scroll', this._scrollHandler);
	        this._scrollHandler = false;
	    }
	},
	
	subscribeObserver: function(f) {
		this._observers.push(f);	
	},
	
	unsubscribeObserver: function(f) {
		this._observers = this._observers.without(f);
	},
	
	notifyObservers: function(event) {
		this._observers.each(function(fn) {
			fn(event);
		});
	},

	getHeight: function() {
	    return this.elements.layer.getHeight();
	},

	getYPosition: function() {
	    return  parseInt(this.elements.layer.getStyle('bottom'));
	},

	updateXPosition: function() {
	    this._isOpen = false;
	    this.elements.layer.setStyle({ right: this._calculateXPosition() + 'px' });
	},
	

	_calculateXPosition: function() {
	    return -this.elements.layer.getWidth();
	},
	
	_slideTo: function(xPosEnd, callback) {
	    
		if(this.elements.layer.CSSTransitionsSupported()) {
			this.elements.layer.setStyle({ 'right': xPosEnd + 'px' });
			Object.isFunction(callback) && callback.delay(this.TRANSITION_DURATION);
		} else {
			this.elements.layer.setStylePeriodically({
				property:	'right',
				endValue:	xPosEnd,
				increment:	30,
				units:		'px',
				onComplete:	callback
			});
		}

	},
	
    _events: function() {


        this.elements.layer.observe('mousedown', function(evt) {
                var target = Event.element(evt);
                
                if(this.isClosed()) {
                    this.open();
                }

                else if(target != this.elements.content && !target.descendantOf(this.elements.content)) {
                    this.close();
                }
        }.bind(this));
    }
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ui_widgets/FlyoutLayer.js'

// global.js: begin JavaScript file: '/js/ui_widgets/ShadowContainer.js'
// ================================================================================
var Ss = window.Ss || {};

Ss.ShadowContainer = {

/*
OPTIONS: 
{

	template: string (shadow/legacy),
	
	modal: {
		color: 		string (color code)
	},
	
	position: { 
		target: 	element,
		type: 		string (bottom/right/bottom-center), (TODO: more position types)
		offsetX: 	number,
		offsetY: 	number
	},
    


    edgeDetect:     Boolean, 
	
	notch: {,
		type:		string (top/right/bottom/left)
		styles: 	{}
	}
	
	closeButton: 	{
		type:		string (css className.. pass false/empty string for no close button)
	},
	
	className: 		string,
	events: {
		keypress: true,
		clickAway: true,
		resize: true
	}

}
*/

	DEFAULT_OPTIONS: {

		template: 'shadow',
		
		modal: {
			color: '#FFF'
		},
		
		position: null,

        edgeDetect: true,
		
		notch: null,
		
		closeButton: {
			type: 'close_btn'
		},
		
		className: '',

		events: {
			keypress: true,
			clickAway: true,
			resize: true
		},

		fadeIn: null
	
	},
	

	templates: {
	    legacy: 		'<table class="shadow-container" border="0" cellpadding="0" cellspacing="0" align="left"><tr><td class="shadow-corner-cell shadow-1 shadow-cell"><div style="_width: 30px;"></div></td><td class="shadow-top-cell shadow-2 shadow-cell"><div style="_width: 30px;"></div></td><td class="shadow-corner-cell shadow-3 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td></tr><tr><td class="shadow-side-cell shadow-4">&nbsp;</td><td id="ss_shadow_container_content" valign="middle" class="shadow-cc"></td><td class="shadow-side-cell shadow-6">&nbsp;</td></tr><tr><td class="shadow-corner-cell shadow-7 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td><td class="shadow-bottom-cell shadow-8 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td><td class="shadow-corner-cell shadow-9 shadow-cell"><div style="_width: 30px;"></div>&nbsp;</td></tr></table><div id="sc_notch"></div><span id="ss_shadow_container_close" class="legacy_close_btn">x</span>',
	    shadow:     	'<div class="shadow"><div id="ss_shadow_container_content"></div></div><div id="sc_notch"></div><div id="ss_shadow_container_close" class="close_btn"></div>',
        notch: {
        	top:		'<div class="shadow_arrow_top"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	right:		'<div class="shadow_arrow_right"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	bottom: 	'<div class="shadow_arrow_bottom"><span class="sa_border"></span><span class="sa_arrow"></span></div>',
        	left:		'<div class="shadow_arrow_left"><span class="sa_border"></span><span class="sa_arrow"></span></div>'
        }
	},
	
    template:   '',

    css: {
        modal: "ss_shadow_container_modal"
    },
    
    initialized: false,
    
    activeOptions: null,
    
    observers: [],
    
    initialize: function(template) {
        

        this.setTemplate(template);
        

        this.initialized = true;

		this.current_content = null;
    },
    
    setTemplate: function(template) {

        this.template = template ? this.templates[template] : this.templates.legacy;
        

        this.element = $('ss_shadow_container');
        this.body = $$('body').first();
        this.clearContent();
        this.element.update(this.template);
        this.content = $('ss_shadow_container_content');
        this.closeButton = $('ss_shadow_container_close');
        this.pageCover = $('ss_shadow_container_page_cover');
        this.notchContainer = $('sc_notch');
        

        this.closeButton.observe('click', this.hide.bind(this));
    },
   
    show: function(_options) { // show the shadow container
		var self = this;
		var options = Object.clone(this.DEFAULT_OPTIONS),
			events = Object.clone(options.events);
		
		if(_options) {
			Object.extend(options, _options);
		}
		options.events = events;
		
		if(_options && _options.events) {
			Object.extend(options.events, _options.events);
		}
		
        if(this.element.visible()) {
            this._reset();
        }
        

        if(options.fadeIn){
            options.fadeIn(self);
        }else{
            this.element.show();
        }
        
        this.element.className = options.className;

		if(options.modal) {
			this.doModal(options);
		}
		
		if(options.notch) {
			this.doNotch(options);
		}
		
		if(options.position) {
			this.positionNextTo(options);
		} else {
			this.positionAtCenter();
		}
		
		if(options.closeButton && options.closeButton.type) {
			this.closeButton.className = options.closeButton.type;
			this.closeButton.show();
		} else {
			this.closeButton.hide();
		}

        this._setEvents(options);
        this._notifyObservers({type: 'show'});
        
        this.activeOptions = options;
    },

    hide: function() { // hide the shadow container
        this.element.hide();
        this._reset();
        this._notifyObservers({type: 'hide'});
    },
    
    visible: function() {
    	return this.element && this.element.visible();
    },
    
    write: function(content, options) { // write content, show, and position the shadow container (@content:String/Element, @options: {className:String, target:Element, modal:Boolean, template:String})
        var template = this.DEFAULT_OPTIONS.template;
        if(options && options.template) {
            template = options.template;
        }
        if(!this.initialized) {
            this.initialize(template);
        } else {
            this._reset();
        }
        if(template != this.template) {
            this.setTemplate(template);
        }
	    this.clearContent();
		this.current_content = content;
        this.content.update(content);
        this.show(options);
        return this.element;
    },
    
    clearContent: function() {

        this.content && this.content.childElements().invoke('remove');
    },
    
    getContent: function() {
    	return this.content;
    },
    
    doModal: function(options) {
        this.body.addClassName(this.css.modal);
        this.pageCover.setStyle({
        		backgroundColor: options.modal.color
        });
    },
    
    undoModal: function() {
        this.body.removeClassName(this.css.modal);
    },
    
    doNotch: function(options) {
    	var type = options.notch.type || 'top',
    		styles = options.notch.styles;

    	this.notchContainer.update(this.templates.notch[type]);

    	if(styles) {
    		this.notchContainer.down().setStyle(styles);
    	}
    },
    
    undoNotch: function() {
    	this.notchContainer.update('');
    },
    
    getNotch: function() {
    	return this.notchContainer.down();
    },
    
    positionNotch: function(target) { // position the shadow container notch so that it points to a target above (like a link)
		var notch = this.getNotch();
		
		if(!Object.isElement(notch)) {
			return;
		}
		
		var notchWidth 		= notch.down().getWidth(),
			maxLeft 		= this.element.getDimensions().width - notchWidth,
			notchPos 		= notch.getStyle('left'),
			targetCenterPos = target.viewportOffset().left + (target.getWidth()/2).round(),
			notchCenterPos 	= notch.viewportOffset().left + (notchWidth/2).round(),
			pixelsOffCenter = targetCenterPos - notchCenterPos;
		
		notch.setStyle({'marginLeft': pixelsOffCenter + 'px'});
    },
    
    positionNextTo: function(options) { // position the container (centers it or places it next to an optional @target:Element)
        var left, 
            top, 
            vpDim = 	document.viewport.getDimensions(), 
            eDim = 		this.element.getDimensions(), 
            tDim = 		options.position.target.getDimensions(), 
            tPos = 		options.position.target.cumulativeOffset(),
            dPos = 		options.position.type || 'right',
            offsetX = 	options.position.offsetX || 0,
            offsetY = 	options.position.offsetY || 0,
            SOME_PADDING = 20;

        switch(dPos) {
            
            case 'bottom':
                left =  ((vpDim.width > tPos.left + eDim.width) ?
                            tPos.left :
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top + tDim.height;
                break;
                
            case 'right':
                left =  ((vpDim.width > tPos.left + eDim.width + tDim.width) ?
                            tPos.left + tDim.width :
                            tPos.left - eDim.width);
                top =   ((vpDim.height > tPos.top + eDim.height) ?
                            tPos.top :
                            tPos.top - eDim.height);
                break;
                
            case 'left':
                left =  tPos.left - eDim.width;
                top =   (((vpDim.height > tPos.top + eDim.height) || !options.edgeDetect)?
                            tPos.top :
                            tPos.top - eDim.height);
            break;
                
            case 'bottom-center':
                left =  ((vpDim.width > tPos.left + (eDim.width/2).round() + (tDim.width/2).round()) ?
                            tPos.left - (eDim.width/2).round() + (tDim.width/2).round():
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top + tDim.height;
                break;
                
            case 'top':
                left =  ((vpDim.width > tPos.left + eDim.width) ?
                            tPos.left :
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top - eDim.height - SOME_PADDING;
               	break;
               	
            case 'top-center':
                left =  ((vpDim.width > tPos.left + (eDim.width/2).round() + (tDim.width/2).round()) ?
                            tPos.left - (eDim.width/2).round() + (tDim.width/2).round():
                            vpDim.width - eDim.width - SOME_PADDING);
                top =   tPos.top - eDim.height - SOME_PADDING;  
            
        }
        left += offsetX;
        top += offsetY;
        
        this.element.setStyle({
                top: top + 'px',
                left: left + 'px'
        });
    },
    
    positionAtCenter: function() {
        var vpDim = document.viewport.getDimensions(), eDim = this.element.getDimensions();
        this.element.setStyle({
                top: (vpDim.height/2 - eDim.height/2) + 'px',
                left: (vpDim.width/2 - eDim.width/2) + 'px'
        });
    },
    
	observe: function(f) { // register a function @f as an observer of events
		this.observers.push(f);	
	},
	
	stopObserving: function(f) { // register a function @f as an observer of events
		this.observers = this.observers.without(f);
	},
	

	_notifyObservers: function(e) {
		this.observers.each(function(f){f(e);});
	},
	
    _clickAwayHandler: function(e) {
        var elem = e.findElement() ;
        if( !elem.descendantOf(Ss.ShadowContainer.element) ||
            elem == Ss.ShadowContainer.closeButton) 
        {
            Ss.ShadowContainer.hide();
        }
    },
    
    _keypressHandler: function(e) {
        if(e.keyCode == Event.KEY_ESC) {
            Ss.ShadowContainer.hide();
        }
    },
    
    _resizeHandler: function(e) {
    	Ss.ShadowContainer.positionNextTo(Ss.ShadowContainer.activeOptions || Ss.ShadowContainer.DEFAULT_OPTIONS);
    },
    
    _setEvents: function(options) {
		if(options.events.clickAway){
			(function(){
				$(document).observe('click', this._clickAwayHandler);
			}.bind(this)).defer(); // using defer here to avoid running this document handler prematurely when called by the handler of a click event that bubbles up.
		}
		if(options.events.keypress){
			$(document).observe('keypress', this._keypressHandler);
		}
		if(options.events.resize){
			Event.observe(window, 'resize', this._resizeHandler);
		}
    },
    
    _unsetEvents: function() {
        $(document).stopObserving('click', this._clickAwayHandler);
        $(document).stopObserving('keypress', this._keypressHandler);
        Event.stopObserving(window, 'resize', this._resizeHandler);
    },
    
    _reset: function() {
        this.element.className = "";
		this.current_content = null;
		this.activeOptions = null;
        this._unsetEvents();
        this.undoModal();
        this.undoNotch();
    }
};

/*
 * register(obj) format = {
 *		key:key to use
 *		content: string or node
 *		sc_opts: options object for ShadowContainer
 *		callbacks: {show:func, hide:func}
 *		toggle: true | false 
 *	}
 */
Ss.ShadowContainer.Stateful = {
	instances: {},
	_current_key: null,
	_initialized: false,
	initialize: function(){
		var self = this;
		Ss.ShadowContainer.observe(function(obj){
			if(obj.type == 'show'){
				if(self._current_key &&
						Ss.ShadowContainer.current_content != self.instances[self._current_key].content){
					self._current_key = null;
				}
			}else{
				self._current_key = null;
			}
		});
	},
	register: function(obj){
		if(!this._initialized){
			this.initialize();
			this._initialized = true;
		}
		if(!obj.callbacks) obj.callbacks = {};
		this.instances[obj.key] = obj;
	},
	isOpen:function(key){
		return (this._current_key == key);
	},
	toggle: function(key){
		var inst = this.instances[key];
		var isShow = (this._current_key != key);
		var sc_funcname = (isShow ? 'write' : 'hide');
		var callback = (isShow ? inst.callbacks.show : inst.callbacks.hide);
		if(callback) callback(inst);
		Ss.ShadowContainer[sc_funcname](inst.content, inst.sc_opts);
		this._current_key = (isShow) ? key : null;
	}
}

        
/*  Internet Explorer 6: Shadow Container Support
 *  This is especially unfortunate, but some necessary features are not supported out of the box for Internet Explorer 6.
 *  We will only implement these features manually by modifying the Ss.ShadowContainer object for IE6 users.
 *  If IE6 support isn't needed, lines below can be safely removed.
 */
if(Prototype.Browser.IE &&
        parseInt(navigator.userAgent.substring(navigator.userAgent.indexOf("MSIE")+5))==6) 
{
    Ss.ShadowContainer.overridedMethods = { // the following methods will be overrided for IE6
        doModal: Ss.ShadowContainer.doModal,
        show: Ss.ShadowContainer.show,
        _reset: Ss.ShadowContainer._reset,
        positionAtCenter: Ss.ShadowContainer.positionAtCenter
    };
    Ss.ShadowContainer.doModal = function(options) {
        Ss.ShadowContainer.overridedMethods.doModal.call(this, options); // call the normal method and provide IE6 support (iframe shim, and sizing of page cover)
        if(!this.pageCover) {
            this.pageCover = $('ss_shadow_container_page_cover');
        }
        this.pageCover.setStyle({
            width: document.body.clientWidth + 'px',
            height: document.body.clientHeight + 'px'
        });
        if(!this.modal_shim) {
            this.modal_shim = Ss.ShadowContainer.insertShim();
        }
        this.positionShim(this.modal_shim, this.pageCover);
    };
    Ss.ShadowContainer.show = function(_options) {
    	var options = Object.clone(this.DEFAULT_OPTIONS);
    	_options && Object.extend(options, _options);
        Ss.ShadowContainer.overridedMethods.show.call(this, options); // call the normal method, then create and position a shim
        if(!this.element_shim) {
            this.element_shim = Ss.ShadowContainer.insertShim();
        }
        this.positionShim(this.element_shim, this.element);
    };
    Ss.ShadowContainer._reset = function() {
        Ss.ShadowContainer.overridedMethods._reset.call(this); // call the normal method, then clean up after ie6 specific stuff
        this.shims.invoke('hide');
        this.body.removeClassName('ss_ie_centered');
    };
    Ss.ShadowContainer.positionAtCenter = function() { // alternate centering instructions for ie6
        var elem = this.element;
        this.body.addClassName('ss_ie_centered');
        elem.setStyle({
                top: ((document.body.scrollTop) ?
                                document.body.scrollTop + (document.body.clientHeight/2 - elem.clientHeight/2) :
                                document.documentElement.scrollTop + (document.documentElement.clientHeight/2 - elem.clientHeight/2)) + 'px', 
                left: ((document.body.clientWidth) ?
                        document.body.clientWidth/2 - elem.clientWidth/2 :
                        document.documentElement.clientWidth/2 - elem.clientWidth/2) + 'px'
        });
    };

    Ss.ShadowContainer.shims = [];
    Ss.ShadowContainer.insertShim = function() {
        var shim = new Element('iframe', {
          style: 'position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);display:none',
          frameborder: 0
        });
        this.body.insert(shim);
        this.shims.push(shim);
        return shim;
    };
    Ss.ShadowContainer.positionShim = function(shim, element) {
        var element = $(element),
            offset = element.cumulativeOffset(),
            dimensions = element.getDimensions(),
            style = {
              left: offset[0] + 'px',
              top: offset[1] + 'px',
              width: dimensions.width + 'px',
              height: dimensions.height + 'px',
              zIndex: element.getStyle('zIndex') - 1
            };
        shim.setStyle(style).show();
    };
}
/* end IE6 support */
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ui_widgets/ShadowContainer.js'

// global.js: begin JavaScript file: '/js/SlideViewer.js'
// ================================================================================
Ss.SlideViewer = Class.create({
    
    initialize: function(args) {
        

        this.mover = args.mover.addClassName(this.CSS.mover);
        this.clipper = args.clipper.addClassName(this.CSS.clipper);
        this.sizeOfClipper = this._getClipperSize();
        this.sizeOfSlide = args.sizeOfSlide || this.sizeOfClipper;
        
        

        this.speed = args.speed || 30;
        

        this.slides = [];
        this._locked = false;
        this._sizeType = 'width';
        this._posType = 'left';



		this.callbacks = ((args.callbacks) ? args.callbacks : []);
    },
    

    push: function(content) {
        this._add();
        var slide = this._newSlide(content);
        this.mover.insert(slide);
        this.slides.push(slide);
        return slide;
    },
    
    unshift: function(content) {

        var slide = this._newSlide(content);
        this.mover.insert({top: slide});
        this._add(true);
        this.slides.unshift(slide);
        return slide;
    },
    

    pop: function() {
        if(!this.slides.size()) {
            return;
        }
        var slide = this.slides.pop().remove();
        this._remove();
        return slide;
    },
    
    shift: function() {
        if(!this.slides.size()) {
            return;
        }
        var slide = this.slides.shift().remove();
        this._remove(true);
        return slide;
    },

    indexOf: function(slide) {
        if(!Object.isElement(slide)) {
            return -1;
        }
        slide = (slide.hasClassName('slide') ? slide : slide.up('.slide'));
        return (slide ? this.slides.indexOf(slide) : -1);
    },

    removeSlide: function(slide) {
        slide.remove();
        this.slides = this.slides.without(slide);
    },
    
    clear: function() {
        this._clear();
        this.mover.update(''); // TODO: remove differently
        this.slides.clear();
    },
    

    next: function(options) {
        this._navigate(1, options);
    },
    
    prev: function(options) {
        this._navigate(-1, options);
    },
    
    navigate: function(by, options) {
       this._navigate(by, options);
    },
    
    navigateToIndex: function(index, options) {
        var range = this.getVisibleSlideRange(),
            by = index - range.first();
        this._navigate(by, options);
    },
    

    setSizeOfSlide: function(sizeOfSlide) {
        this.sizeOfSlide = sizeOfSlide;
    },

    setSpeed: function(speed) {
        this.speed = speed;
    },
    

    getSlideFromElement: function(elem) {
        var index = this.indexOf(elem);
        return (index != -1 ? this.slides[index] : false);
    },
    
    getSlideByIndex: function(index) {
        return this.slides[index];
    },
    
    getSlides: function() {
        return this.slides;
    },
    
    getMover: function() {
        return this.mover;
    },
    
    getClipper: function() {
        return this.clipper;
    },
    
    getVisibleSlideRange: function() {
        var firstIndex = this._getFirstVisibleSlideIndex(),
            visibleSlideCapacity = this.getVisibleSlideCapacity(),
            lastIndex = (this.slides.size() > firstIndex + visibleSlideCapacity ? firstIndex + visibleSlideCapacity : this.slides.size())
        return $A($R(firstIndex, lastIndex, true));
    },
    
    getVisibleSlideCapacity: function() {
        return Math.floor(this.sizeOfClipper/this.sizeOfSlide);
    },
    

    _clear: function() {
        this.mover.style[this._sizeType] = '';
        this.mover.style[this._posType] = '';
    },
    
    _remove: function(shift) {
        this.mover.style[this._sizeType] = (this._getMoverSize() - this.sizeOfSlide) + 'px';
        this.mover.style[this._posType] = (this.mover.positionedOffset()[this._posType] + (shift ? this.sizeOfSlide : 0)) + 'px';
    },
    
    _add: function(unshift) {
        this.mover.style[this._sizeType] = (this._getMoverSize() + this.sizeOfSlide) + 'px';
        this.mover.style[this._posType] = (this.mover.positionedOffset()[this._posType] - (unshift ? this.sizeOfSlide : 0)) + 'px';
    },
    
    _newSlide: function(content) {
        var elem = new Element('DIV');
        elem.addClassName(this.CSS.slide);
        elem.style[this._sizeType] = this.sizeOfSlide + 'px';
        elem.insert(content);
        return elem;
    },
    
    _getClipperSize: function() {
        return this.clipper.getWidth();
    },
    
    _getMoverSize: function() {
        return this.mover.getWidth();
    },
    
    _navigate: function(by, options) {
		var self = this;
        if(this._locked) {
            return;
        }
        if(!by && !(by === 0)) {
            return;
        }

        this._locked = true;
        var endValue, 
			maxValue = 0, 
			minValue = -((this.slides.size()-1) * this.sizeOfSlide),
			slideViewer = this,
			mover = this.mover,
			units = 'px',
			duration,
			_options = {
				transition: true,
				onComplete: Prototype.emptyFunction
			},
			_onComplete;
			
		Object.extend(_options, options);
		
		_onComplete = function() {
			  slideViewer._locked = false;
			  if(Object.isFunction(_options.onComplete)) {
				  _options.onComplete();
			  }
			  self.callbacks.each(function(cb){
				  cb({type: 'end',index: self._getFirstVisibleSlideIndex()});
			  });
		};
			
        endValue = this.mover.positionedOffset()[this._posType] - (by * this.sizeOfSlide);
        endValue = (endValue < minValue ? minValue : endValue);
        endValue = (endValue > maxValue ? maxValue : endValue);

        
        
        if(!_options.transition) {
        	mover.style[this._posType] = endValue + units;
        	_onComplete();
			this.callbacks.each(function(cb){
				cb({type: 'direct',index: self._getFirstVisibleSlideIndex(endValue)});
			});
        	return;
        }

		this.callbacks.each(function(cb){
			cb({type: 'start',index: self._getFirstVisibleSlideIndex(endValue)});
		});
        
		if(mover.CSSTransitionsSupported()) {
			

			mover.addClassName('transitioning');
			

			duration = parseFloat(mover.getStyle('-moz-transition-duration') || mover.getStyle('-webkit-transition-duration'));
			

			mover.style[this._posType] = endValue + units;
			
			(function(){

					mover.removeClassName('transitioning');
					

					_onComplete();
			}.delay(duration));
			
		} else {
			
			this.mover.setStylePeriodically({
					property:     this._posType,
					endValue:     endValue,
					increment:    this.speed,
					units:        units,
					onComplete:   _onComplete
			});
			
		}
    },
    
    _getFirstVisibleSlideIndex: function(pos) {
        var currentPos = (pos != null ? pos : this.mover.positionedOffset()[this._posType]);
        return Math.round(Math.abs(currentPos/this.sizeOfSlide));
    },
    

    CSS: {
        slide: 'slide',
        mover: 'mover',
        clipper: 'clipper'
    }
        
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/SlideViewer.js'

// global.js: begin JavaScript file: '/js/Carousel.js'
// ================================================================================




Ss = window.Ss || {};

Ss.Carousel = Class.create({

    initialize: function(args) {

        this.slideViewer = args.slideViewer;
        

        this._locked = false;
        this._currentIndex = null;
        
        if(args.items && args.itemToElement) {
        	this.load(args);
        }
        
    },
  
    load: function(args) {
    	

    	this.items = args.items;
    	this.itemToElement = args.itemToElement;
    	

        this._callbacks = {
        	'navigationComplete': args.onNavigationComplete ? args.onNavigationComplete.bind(this) : Prototype.emptyFunction,
        	'beforeNavigation': args.onBeforeNavigation ? args.onBeforeNavigation.bind(this) : Prototype.emptyFunction
        };
        
    	this.writeItem(0);
    },
    
    next: function() {
        this._navigate(1);
    },
    
    prev: function() {
        this._navigate(-1);
    },
    
    navigateTo: function(index) {
    	if(this.items.size() <= index ||
    		index == this._currentIndex) {
    		return;
    	}
    	this._navigate(index - this._currentIndex);
    },

    writeItem: function(index) {
        if(!this.items[index]) {
        	return;
        }
        this.slideViewer.clear();
        this.slideViewer.push( this.itemToElement( this.items[index] ) );
        this._currentIndex = index;
        this._fireEvent('navigationComplete');
    },
    

    bind: function(element, methodName, eventType) {
    	var handler;
    	
    	eventType = eventType || 'click';
    	
    	if( !Object.isFunction(this[methodName]) ) {
    		return;
    	}
    	
    	handler = function(evt) { this[methodName](); }.bind(this);
    	Event.observe(element, eventType, handler);
    	return handler;
    },
    
    bindKey: function(keyCode, methodName) {
    	var handler;
    	
    	if( !Object.isFunction(this[methodName]) ) {
    		return;
    	}
    	
    	handler = function(evt) { (evt.keyCode == keyCode) && this[methodName](); }.bind(this);
		Event.observe(document, 'keydown', handler);
		return handler;
    },

    getItems: function() {
    	return this.items;
    },
    
    _fireEvent: function(evtType, memo) {
    	
    	var _memo = {
    			currentIndex: this._currentIndex,
    			items: this.items
    	};
    	
    	if( !Object.isFunction(this._callbacks[evtType]) ) {
    		return;
    	}
    	
    	if(memo) {
    		_memo = Object.extend(_memo, memo);
    	}
    	
    	this._callbacks[evtType](_memo);
    },
    
    _navigate: function(by) {
    	var nextIndex = this._currentIndex + by,
    		item = this.items[nextIndex]; // get next or prev item that needs to be rendered and transitioned in
    		
    	if(!item || this._locked) {
    		return;
    	}
        
    	this._fireEvent('beforeNavigation', { nextIndex: nextIndex });
        this._locked = true;
        this.slideViewer[(by > 0 ? 'push' : 'unshift')](this.itemToElement(item));
        this.slideViewer.navigate(by, {
        	onComplete: function() {
                this.slideViewer[(by > 0 ? 'shift' : 'pop')]();
                this._currentIndex = nextIndex;
                this._locked = false;
                
                this._fireEvent('navigationComplete');
            }.bind(this)
        });
    }
    
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Carousel.js'

// global.js: begin JavaScript file: '/js/ResponsiveCarousel.js'
// ================================================================================
Ss.ResponsiveCarousel = Class.create({
	initialize: function(options) {
	    var ctr = options.ctr;
		this.els = {
		    ctr: ctr,
            rel: ctr.down('.rc_rel'),
            abs: ctr.down('.rc_abs ')
		};
		this._fire();
	},
	next: function() {
        var firstHidden = this.getFirstHidden();
        if(firstHidden) {
            var left = firstHidden.positionedOffset().left;
            this.els.abs.setStyle({'left': (-left) + 'px'});
        }
        this._fire();
	},
	prev: function() {
		var newLeft = Math.min(0, this.els.abs.positionedOffset().left + this.els.rel.getWidth());
		this.els.abs.setStyle({'left': newLeft + 'px'});
		this._fire();
	},
    getFirstHidden: function() {
        var firstHidden;
        var instance = this;
        var items = this.els.abs.childElements();
        var lastVisible = items.filter(function(elem) {
            return instance._startVisible(elem) && instance._endVisible(elem);
        }).last();
        var lastVisibleIndex = items.indexOf(lastVisible);
        if(lastVisibleIndex != -1 && lastVisibleIndex < items.length - 1) {
            firstHidden = items[lastVisibleIndex + 1];
        }
        return firstHidden;
    },
    atEnd: function() {
        return this._endVisible(this.els.abs.childElements().last()); 
    },
    atStart: function() {
        return this._startVisible(this.els.abs.childElements().first());
    },
    _startVisible: function(elem) {
        var eLeft = this._getElemLeft(elem);
        return eLeft >= 0 && eLeft < this._getWidth() + this.BUFFER;
    },
    _endVisible: function(elem) {
        var eLeft = this._getElemLeft(elem);
        return eLeft >= 0 && eLeft + elem.getWidth() < this._getWidth();
    },
    _getElemLeft: function(elem) {
        return elem.positionedOffset().left + this._getLeft();
    },
    _getLeft: function() {
        return parseInt(this.els.abs.getStyle('left'));;        
    },
    _getWidth: function() {
        return this.els.rel.getWidth();
    },
    _fire: function() {
        var ctr = this.els.ctr;
        var rc = this;
        (function(){
            ctr.fire('rc:navigate', {
                atStart: rc.atStart(),
                atEnd: rc.atEnd()
            });
        }).defer();
    },
    BUFFER: 10
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ResponsiveCarousel.js'

// global.js: begin JavaScript file: '/js/recent_carousel.js'
// ================================================================================
Ss = window.Ss || {};
Ss.recent = Ss.recent || {};

Ss.recent.carousel = {
    
    tabs: [],
    
    _currentTab: null,
    
    data: {},
    
    _dataLoaded: false,
    
    itemsPerSlide: 5,
    
    initialize: function(args) {
        this.elements = args.elements;
        this.counts = args.counts;
        

        this.carousel = new Ss.Carousel(
        {
            slideViewer: new Ss.SlideViewer(
            {
                mover: 		this.elements.mover,
                clipper: 	this.elements.clipper
            })
        });
        

        this._events();
    },
    
    setData: function(key, data) {
        this.data[key] = data;
    },
    
    getData: function(key) {
        return this.data[key];
    },
    
    setTab: function(key, element) {
        if(!Object.isElement(element)) {
            return;
        }
        var recent = this;
        var notch = this.elements.notch;
        var fader = this.elements.fader;
        var tabSelector = this.elements.tabSelector;
        var tab = {
            key: key,
            element: element
        };
        
        this.tabs.push(tab);
        
        tab.pos = tab.element.positionedOffset().left + (tab.element.getWidth()/2) - 6;
        
        var switchTab = function() {
            if(tab.key == recent._currentTab) {
                return;
            }
            if( fader.CSSTransitionsSupported() ) {
                tabSelector.className = tab.key + '_selected'; // setting this first to start the motion of the notch/triangle
                if(notch) {
                    notch.setStyle({ left: tab.pos + 'px'});
                }
                fader.setOpacity(0); // fading out the old
                (function() {
                    recent.showTab(tab.key); // loading in the new
                    fader.setOpacity(1); // fading in the new
                }).delay(.25); // ...after the old has finished fading out
            } else {
                recent.showTab(tab.key); // .. just load the new tab!
            }
        };
        

        tab.element.observe('click', function(evt) {
            if(!recent._dataLoaded) {
                recent._load(switchTab);
            } else {
                switchTab();
            }
        });
    },
    
    getTab: function(key) {
        return this.tabs.find(
            function(tab){
                return tab.key == key;
            }
        );
    },
    
    showTab: function(key) {
        var data = this.getData(key);
        var tab = this.getTab(key);
        var recent = this;
        var itemToElement = (
            key == 'images' ?
                recent._recentImageToHTML.bind(this) :
                recent._recentSearchToHTML.bind(this)
        );
        

        if(!tab || !data) {
            return;
        }
        

        recent._currentTab = key;
        

        recent.carousel.load({
            items: data.eachSlice(recent.itemsPerSlide), // one 'item' is a set of searches/images
            itemToElement: 	itemToElement, // how to turn an item into a slide
            onNavigationComplete: function(memo) { // after every write, check the boundaries
                var items = memo.items;
                var isLastPage = (memo.currentIndex + 1 >= items.length);
                var isFirstPage = (memo.currentIndex == 0);
                var container = recent.elements.container;
                
                if(recent._dataLoaded) {
                    container[ (isLastPage ? 'addClassName' : 'removeClassName') ]('last_page');
                    container[ (isFirstPage  ? 'addClassName' : 'removeClassName') ]('first_page');
                } else {
                    container.addClassName('first_page');
                    if(recent.counts[recent._currentTab] <= recent.itemsPerSlide) {
                        container.addClassName('last_page');
                    }
                }
            }
        });
        

        recent.elements.tabSelector.className = key + '_selected';
        if(recent.elements.notch) {
            recent.elements.notch.setStyle({ left: tab.pos + 'px'});
        }
    },
    
    _load: function(callback) {
        var recent = this;
        if(recent._dataLoaded) {
            return;
        }
        recent._dataLoaded = true;
        new Ajax.Request('/show_component.mhtml',
            {
                method: 'GET',
                parameters: {
                    'component_path': '/recent_activity/get_all.mj',
                    'client_timestamp': new Date().getTime()
                },
                onSuccess: function(transport) {
                    recent.setData('images', transport.responseJSON.images);
                    recent.setData('searches', transport.responseJSON.searches);
                    if(Object.isFunction(callback)) {
                        callback();
                    }
                }, 
                onError: function() {
                    recent._dataLoaded = false;
                }
            }
        );
    },
    
    _events: function() {
        this._setupPrevNext();
        this._setupRecentSearchHover();
    },
    
    _setupPrevNext: function() {
        var recent = this;
        var next = this.elements.next;
        var prev = this.elements.prev;
        

        prev.observe('click',
            function() {
                recent.carousel.prev();
            }
        );
        


        next.observe('click', 
            function(evt) {
                if(!recent._dataLoaded) {
                    recent._load(
                        function() {
                            recent.showTab(recent._currentTab);
                            recent.carousel.next();
                        }
                    );
                } else {
                    recent.carousel.next();
                }
            }
        );
    },
    
    _setupRecentSearchHover: function() {

        var tid;
        this.elements.container.observe('mouseover', function(evt) {
            var target = Event.element(evt);
            var activeRecentSearchElem = target.hasClassName('.recent_search') ? target : target.up('.recent_search');
            var recentSearchElems = [];
            if(!activeRecentSearchElem) {
                return;
            }
            recentSearchElems = this.select('.recent_search');
            tid && window.clearTimeout(tid);
            tid = (function(){
                recentSearchElems.invoke('addClassName', 'rs_out_of_focus');
                activeRecentSearchElem.removeClassName('rs_out_of_focus');
            }).delay(.1);
        });
        this.elements.container.observe('mouseout', function(evt) {
            var destElem = evt.relatedTarget || evt.toElement;
            if(destElem && !destElem.descendantOf(Ss.recent.carousel.elements.clipper) ) {
                this.select('.recent_search').invoke('removeClassName', 'rs_out_of_focus');
            }
            tid && window.clearTimeout(tid);
        });
    },
    
    _recentImageToHTML: function(images) {
        var html = [];
        var data = this.data.images;
        images.each(
            function(image, i) {
                var slideIndex = (i+1);
                var carouselIndex = (data.indexOf(image)+1);
                var marginTop = Math.round((100 - image.height)/2);
                html.push('<div id="carousel_recent_image_' + carouselIndex + '" class="recent_image item_' + slideIndex + '">');
                html.push('     <div class="thumb_image_container" style="width:' + image.width + 'px;height:' + image.height + 'px; margin-top:' + marginTop + 'px;">');
                html.push('         <a href="' + image.link + '">');
                html.push('             <img class="thumb_image" src="' + image.thumb_url + '" alt="' + image.description + '" />');
                html.push('         </a>');
                html.push('     </div>');
                html.push('</div>');
            }
        );
        return html.join('');
    },
    
    _recentSearchToHTML: function(searches) {
        var html = [];
        var data = this.data.searches;
        searches.each(
            function(search, i) {
                var slideIndex = (i+1);
                var carouselIndex = (data.indexOf(search)+1);
                var thumbStyles = '';
                var thumbURL;                
                if(search.cropped_cover_image && search.cropped_cover_image.elements) {
                    thumbURL = search.cropped_cover_image.thumb_url;
                    Object.keys(search.cropped_cover_image.elements.img).each(
                        function(key) {
                            if(search.cropped_cover_image.elements.img[key]) {
                                thumbStyles += key + ':' + search.cropped_cover_image.elements.img[key] + 'px;'
                            }
                        }
                    );                    
                }
                html.push('<div id="carousel_recent_search_' + carouselIndex + '" class="recent_search item_' + slideIndex + '">');
                html.push('     <div class="image_stack">');
                html.push('         <div class="cropped_image_clipper">');
                if(thumbURL && thumbStyles) {
                    html.push('             <a href="' + search.link + '">');
                    html.push('                 <img style="' + thumbStyles + '" src="' + thumbURL + '" />');
                    html.push('             </a>');
                }
                html.push('         </div>');
                html.push('         <span class="magnifier"></span>');
                html.push('         <div class="rs_desc shadow_dark_gray">');
                html.push(              search.description);
                html.push('             <div class="shadow_arrow_left"><span class="sa_border"></span><span class="sa_arrow"></span></div>');
                html.push('             <div class="shadow_arrow_right"><span class="sa_border"></span><span class="sa_arrow"></span></div>');
                html.push('         </div>');
                html.push('     </div>');
                html.push('     <a class="rs_keywords" href="' + search.link + '">');
                html.push(          search.searchterm);
                html.push('     </a>');
                html.push('</div>');
            }
        );
        return html.join('');
    }

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/recent_carousel.js'

// global.js: begin JavaScript file: '/js/input/TextWithDefault.js'
// ================================================================================
Ss.input = window.Ss.input || {};

Ss.input.TextWithDefault = Class.create({
        initialize: function(args) {
            this.textField = args.textField;
            this.defaultValue = args.defaultValue;
            this.defaultCSS = args.defaultCSS || 'default';
            
            this.textField.observe('focus', this.focus.bind(this));
            this.textField.observe('blur', this.blur.bind(this));
        },
        focus: function(evt) {
            if(!this.textField.hasClassName(this.defaultCSS)) {
                return;
            }
            this.textField.removeClassName(this.defaultCSS);
            this.textField.clear();
        },
        blur: function(evt) {
           if(this.textField.getValue().strip().empty()) {
                this.textField.addClassName('default');
                this.textField.value = this.defaultValue;
            }
        }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/TextWithDefault.js'

// global.js: begin JavaScript file: '/js/input/PassWithDefault.js'
// ================================================================================



Ss.input = window.Ss.input || {};

Ss.input.PassWithDefault = Class.create({
        initialize: function(args) {
            this.textField = args.textField;
            this.fieldName = args.fieldName || this.textField.name;
            
            this.textField.observe('focus', this.focus.bind(this));
            this.passwordField = null; // will be created/inserted when needed
        },
        focus: function(evt) {
            this.showPasswordField();
            this.passwordField.focus();
        },
        blur: function(evt) {
            if(this.passwordField.getValue().strip().empty()) {
                this.showTextField();
            }   
        },
        showPasswordField: function() {
            if(!this.passwordField) {
                this.makePasswordField();
            }
            this.passwordField.show();
            this.textField.hide();
        },
        showTextField: function() {
            this.textField.show();
            this.passwordField.hide();
        },
        makePasswordField: function() {
            this.passwordField = new Element('input', {
                    type:   'password',
                    name:   this.fieldName
            })
            .observe('blur', this.blur.bind(this));
            this.textField.insert({after: this.passwordField});
            this.textField.name = '';
        }
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/PassWithDefault.js'

// global.js: begin JavaScript file: '/js/input/InFieldLabel.js'
// ================================================================================
Ss = window.Ss || {};
Ss.input = window.Ss.input || {};

Ss.input.InFieldLabel = Class.create({
		
		initialize: function(args) {
			

			this.label = args.label;
			this.field = args.field;
			

            this.options = Object.extend(Ss.input.InFieldLabel.defaultOptions, args.options || {});
			

			this.showing = true;
			

			var base = this;
			(function(){

				if(!base.field.getValue().strip().empty()) {
					base.label.hide();
					base.showing = false;
				}
			}).delay(.25);
			
			this._events();
			
		},
		
		showFocus: function() {
			if(this.showing){
				this.setOpacity(this.options.fadeOpacity);
			}
		},
		
		setOpacity: function(opacity) {
			this.label.setOpacity(opacity);
			this.showing = (opacity > 0.0);
		},

		updateText: function(text) {
		    this.label.update(text);
		},
		
		checkForEmpty: function(blur) {
			if(this.field.getValue().strip().empty()){
				if(!this.showing) {
					this.label.show();
				}
				this.setOpacity( blur ? 1 : this.options.fadeOpacity );
			} else {
				this.setOpacity(0.0);
			}
		},
		
		hideOnChange: function(e) {
			if(
				(e.keyCode == 16) || // Skip Shift
				(e.keyCode == 9) // Skip Tab
			  ) return; 
			
			if(this.showing){
				this.label.hide();
				this.showing = false;
			}
		},
		
		subscribe: function(observer) {



			var eventTypes = ['keyup', 'blur', 'change'],
				subject = this;
			
			if(Object.isFunction(observer.update)) {
				eventTypes.each(
					function(eventType) {
						subject.field.observe(eventType, function(evt) {
							observer.update();
						});
					}
				);
			}

		},
		
		clear: function() {
		    this.field.clear();
		    this.update();
		},
		
		update: function() {
			this.checkForEmpty(true);
		},
		
		_events: function() {
			var base = this;
			
			this.field.observe('focus', function(){
				base.checkForEmpty();
				base.showFocus();
				base.field.addClassName(base.options.focusCSS);
			});
			
			this.field.observe('blur', function(){
				base.checkForEmpty(true);
				base.field.removeClassName(base.options.focusCSS);
			});
			
			this.field.observe('keydown', function(e) {
				base.hideOnChange(e);
			});


			this.field.observe('change', function(e){
				base.checkForEmpty();
			});

			if(typeof (this.field.onpropertychange) == "object") {
				this.field.observe('propertychange', function() {
					base.checkForEmpty();
				});
			}

			this.label.observe('click', function() {
				( function(){ base.field.focus(); } ).defer(); // deferment is needed to support explorer
			});
			


			Event.observe(window, 'load', function() {
				if(!base.field.getValue().strip().empty()) {
					base.label.hide();
					base.showing = false;
				}
			});
		}
		
});

Ss.input.InFieldLabel.defaultOptions = {
	fadeOpacity: 0.5, // Once a field has focus, how transparent should the label be
	focusCSS: ''// Once a field has focus, what css class do we write in
};

Ss.input.InFieldLabel.create = function(input) {
    input.insert({ before: '<span class="in_field_label">' + input.getAttribute('placeholder') + '</span>' });
    var label = input.previous('.in_field_label');
    var inFieldLabel = new Ss.input.InFieldLabel({
        label: label,
        field: input
    });
    input.setAttribute('placeholder', '');
    return inFieldLabel;
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/input/InFieldLabel.js'

// global.js: begin JavaScript file: '/js/storage/storage.js'
// ================================================================================
Ss = window.Ss || {};
Ss.storage = {};

Ss.storage.session = {

    _purgeProofKeys: ['_keys', 'search', 'pending_event', 'search_announcement_seen'],
    
    _clearProofKeys: ['pending_event', 'search_announcement_seen'],
    
    getItem: function(key) {
		if (window.location.protocol === "https:") {
			key = "_s_" + key;
		}
        var value = window.sessionStorage.getItem(key);
        if(Object.isString(value) && value.isJSON()) {
            value = value.evalJSON()
        }
        return value;
    },
    
    setItem: function(key, value) {
		if (key.match('^_s_')) {

			return;
		}
		if (window.location.protocol === "https:") {

			key = "_s_" + key;
		}
        var keys = this.getKeys();
        
        if(!Object.isString(value)) {
            value = Object.toJSON(value);
        } 
        
        try {
            
            window.sessionStorage.setItem(key, value);
            keys.push(key);
            window.sessionStorage.setItem('_keys', keys.join(','));
            
        } catch(e) {

            if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            
                var excludeKeys = Ss.storage.session._purgeProofKeys;
                var tempKey = '';
                var deleteCount = (window.sessionStorage.length/2).round();

                while(deleteCount > 0) {
					var noSkip = window.location.protocol === 'https:' ? '^_s_.*' : '^(?!_s_).*$';
                    tempKey = keys.shift();
					if (!tempKey.match(noSkip)) {
						continue;
					}
                    if(excludeKeys.include(tempKey)) {
                        keys.push(tempKey);
                        continue;
                    }
                    window.sessionStorage.removeItem(tempKey);
                    deleteCount--;
                }
                window.sessionStorage.setItem(key, value);
                keys.push(key);
                window.sessionStorage.setItem('_keys', keys.join(','));

            }
            
        }
    },
    
    removeItem: function(key, arg) {
		if (arg && arg.noPrefix) {

		} else {
			if (window.location.protocol === "https:") {
				key = "_s_" + key;
			}
		}
        var keys = this.getKeys();
        window.sessionStorage.removeItem(key);
        window.sessionStorage.setItem('_keys', keys.without(key).join(','));
    },
    
    clear: function() {
        var excludeKeys = this._clearProofKeys,
            excludeItems = new Hash();
		var noSkip = window.location.protocol === 'https:' ? '^_s_.*' : '^(?!_s_).*$';
        excludeKeys.each(
            function(key) {
                var item = window.sessionStorage.getItem(key);
                if(item) {
                    excludeItems.set(key, item);
                }
            }
        );
        

		try {
			this.getKeys().each(
				function(key) {
					if (key.match(noSkip)) {
						Ss.storage.session.removeItem(key, {noPrefix: 1});
					} 
				}
			);
		} catch (e) {

		}
        
        excludeItems.each(
            function(entry) {
                window.sessionStorage.setItem(entry.key, entry.value);
            }
        );
        
    },
    
    getKeys: function() {
        var keys = [];
        var sKeys = window.sessionStorage.getItem('_keys');
        if(sKeys) {
            keys = sKeys.split(',');
        }
        return keys;
    },
    
    supported: function() {
    	return 'sessionStorage' in window;
    }
    
};
/*
    notes: 150 thumb pages max out at about page 53.
    
    1. improve strategy around 'what' to remove
    
    2. move expired items to a javascript structure instead of just removing them
    
    3. improve prefetching strategy
    
    4. support _exclude keys manipulation via an arg to setItem
    
*/
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/storage/storage.js'

// global.js: begin JavaScript file: '/js/location.js'
// ================================================================================
Ss = window.Ss || {};

Ss.location = {
    
    hasHashParams: function() {
        return !window.location.hash.empty();
    },
    
    getHashParams: function() {
        return this.extractHashQueryString().toQueryParams();
    },
    
    getHashParam: function(name) {
        if(this.hasHashParams()) {
            return this.getHashParams()[name];
        }
        return null;
    },
    
    setHashParams: function(params) {
        var qs = Object.toQueryString(params);
        window.location.hash = qs;
        return qs;
    },
    
    extractHashQueryString: function() {
        return window.location.hash.split('#')[1] || '';
    },
    
    getQueryParams: function() {
        return window.location.search.toQueryParams()
    },
    
    hashchangeSupported: function() {
        return 'onhashchange' in window;
    }
    
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/location.js'

// global.js: begin JavaScript file: '/js/search/search.js'
// ================================================================================
Ss = window.Ss || {};

Ss.search = {
    
    currentPage: null,
    
    _initialized: false,

    _subscribers: {},
    
    _lastScrollY: null,
    
    elements: null,
    
    modifications: null,
    
    CSS: {
        loading: 'search_loading'
    },
    
    initialize: function(args) {
        this.initialPage = parseInt(args.initialPage);
        this.currentPage = this.initialPage;
        this.totalPages = parseInt(args.totalPages);
        this.canonicalURL = args.canonicalURL;
        this.text = args.text;
        this.thumbSize = args.thumbSize;
        this.elements = {
            container: $('cat_container')
        };
        

        if(this.thumbSize != 'mosaic') {
            Ss.image.grid.initialize();
        }
        
        Ss.search.history.initialize();
        Ss.search.nextButton.initialize(this.initialPage, this.totalPages);
        Ss.search.pagers.initialize(this.initialPage, this.totalPages);
        
        this._initialized = true;
    },
    
    initialized: function() {
        return this._initialized;
    },
    
    ajaxSupported: function() {
        return ( 
            Ss.search.history.APISupported() || 
            (Ss.location.hashchangeSupported() && Ss.storage.session.supported())    
        );
    },
    

    addResultsCallback: function(f) {
    	Ss.search.subscribe('show', f);
    },
    

    addDetailCallback: function(f) {
    },
    
    update: function(state) { 
        



        var response = state.responseJSON || state;
        

        if(this.thumbSize == 'mosaic') {
            Ss.image.mosaic.update(response.results); 
        } else {
            Ss.image.grid.update(response);
        }
        this.currentPage = parseInt(response.page);
        this.setSrcID(response.searchSrcID);      


        window._scrollTo(0,0);
        this.nextButton.update(this.currentPage, this.totalPages);
        this.pagers.update(this.currentPage, this.totalPages);


        this._publish('update', response);


        this.show();
    },
    


    show: function() {

        if(!this.visible()) {
            

            this.elements.container.show();
            

            document.body.addClassName('search_results');
            
            if(this._lastScrollY) {
                window._scrollTo(0, this._lastScrollY);
                this._lastScrollY = null;
            }
        }
        

        this._publish('show');
    },
    
    hide: function() {
        if(!this.elements.container.visible()) {
            return;
        }
        this._lastScrollY = (window.scrollY || window.pageYOffset);
        this.elements.container.hide();
    },
    
    visible: function() {
        return this.elements.container.visible();
    },

    showLoading: function() {
        document.body.addClassName(this.CSS.loading);
    	cancelPreview();
    },
    
    hideLoading: function() {
    	document.body.removeClassName(this.CSS.loading);
    },

    isInitialPage: function() {
        return this.getInitialPage() == this.getCurrentPage();
    },
    
    getInitialPage: function() {
        return parseInt(this.initialPage);
    },
    
    getCurrentPage: function() {
        return parseInt(this.currentPage);
    },
    
    getSrcID: function() {
        return Ss.search.client.getParam('src');
    },

    setSrcID: function(id) {
        Ss.search.client.setParam('src', id);
        Ss.search.client.setParam('search_source_id', id);
    },
    
    getTotalPages: function() {
        return parseInt(this.totalPages);
    },
    
    getCanonicalURL: function(params) {
        if(!params || !params.page) {
            throw 'pasrams and page required';
        }


        var canonicalParams = this.canonicalURL.params;
        var urlParams = Object.clone(params);
        Object.keys(canonicalParams).each(function (key) {
            if (Object.isUndefined(urlParams[key])) {
                urlParams[key] = canonicalParams[key];
            }
        });
        var url = this.canonicalURL.base;
        var qs = Object.toQueryString(urlParams);
        return url + '?' + qs ;
    },
    
    sanitizePageNumber: function(page) {
        var totalPages = this.getTotalPages();
        if(page < 1) {
            page = 1;
        }
        if(page > totalPages) {
            page = totalPages;
        }
        return page;
    },

    goToPage: function(page) {
        if(!Object.isNumber(page)) {
            throw 'page (Number) is required';
        }
        var params = { 
            'page': this.sanitizePageNumber(page) 
        };
        Ss.search.history.pushState(params, this.getCanonicalURL(params));
    },

    paginate: function(delta) {
        if(!Object.isNumber(delta)) {
            throw 'delta (Number) is required';
        }
        var params = { 
            'page': this.sanitizePageNumber(this.getCurrentPage() + delta)
        };
        Ss.search.history.pushState(params, this.getCanonicalURL(params));
    },
    
    subscribe: function(type, f) {
        if(!Object.isString(type) || !Object.isFunction(f)) {
            throw 'type (String) and f (Function) required';
        }
        this._subscribers[type] = this._subscribers[type] || [];
        this._subscribers[type].push(f);
    },

    _publish: function(type, evt) {
        if(!Object.isString(type) || 
            !Object.isArray(this._subscribers[type]) || 
            !this._subscribers[type].length) {
            return;
        }
        evt = evt || {};
        evt.type = type;
        this._subscribers[type].each(function(f){
            try { f(evt); } 
            catch(e) { }
        });
    },


    modify: function(modifications) {
        var numBins = 20;
        var binSize = 5;
        if(!Object.isArray(modifications) || modifications.length != numBins || modifications.uniq().length != numBins || modifications.min() !== 0) {
            throw 'Invalid modifications';
        }
        var els = {
            grid: $('grid_cells'),
            cells: Ss.page.thumb_size == 'mosaic' ? $$('#grid_cells .mosaic_cell') : $$('#grid_cells .gc'),
            fragment: document.createDocumentFragment()
        };
        var sourceBins = els.cells.inGroupsOf(binSize);
        var destBins = modifications.map(function(destIndex){
            return sourceBins[destIndex];
        });

        destBins.flatten().compact().each(function(node) {
	            els.fragment.appendChild(node);
        });

        els.grid.appendChild(els.fragment);
    },
    
    lightboxes: {}

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/search.js'

// global.js: begin JavaScript file: '/js/search/client.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = Ss.search || {};

Ss.search.client = {

	_cache: {},

    _params: {
        'component_path':   '/search/get_results.md',
        'search_type':      'keyword_search'
    },

	setParam: function(key, value) {

        if(Object.isString(value)) {
            try {
                this._params[key] = decodeURIComponent(escape(value));
            } catch(e) { 
                this._params[key] = value;
            }
        } else {
            this._params[key] = value;
        }
	},
	
    getParam: function(key) {
        return this._params[key];
    },

	getParams: function() {


        return Object.extend(Ss.search.preferences.get(), this._params);
	},
	
	execute: function(parameters, callback) {
		
		if(!Object.isFunction(callback) || Object.isUndefined(parameters)) {
		    throw 'parameters and callback are required';
		}
        
        parameters = Object.extend(this.getParams(), parameters);
		    
		var cached = this.getCached(parameters);
		
		if(cached) {
			callback(cached);	
			return;
		}

        new Ajax.Request('/show_component.mhtml', {
        
            method: 'GET',
            
            parameters: parameters,
            
            onSuccess: function(response) {
                var _response = {
                    'parameters': parameters,
                    'responseText': response.responseText,
                    'responseJSON': response.responseJSON
                };
                callback(_response);
                Ss.search.client.cache(_response);
            }

        });
        
	},
	
	getKey: function(parameters) {
	    if(parameters.page) {
	        return 'page_' + parameters.page;
	    }
		return Object.toQueryString(parameters);
	},
	
	getCached: function(parameters) {
		return this._cache[ this.getKey(parameters) ];
	},
	
	cache: function(data) {
		this._cache[ this.getKey(data.parameters) ] = data;
	},
	
	toQueryString: function() {
        return Object.toQueryString(this.getParams());
	},
	
	toHiddenInputs: function() {
	    var params = this.getParams();
        return Object.keys(params).map(function(name) {
            return new Element('input', {
                type: 'hidden',
                name: name,
                value: params[name]
            });
        });
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/client.js'

// global.js: begin JavaScript file: '/js/search/history/history.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};

Ss.search.history = {
    
    initialize: function() {
        this._events();
        this._prefetch(1);
    },
    
    APISupported: function() {
        return !!(window.history && window.history.pushState);
    },
    
    shimEnabled: function() {
        return (
            !Ss.search.history.APISupported() &&
            Ss.location.hashchangeSupported() && 
            Ss.storage.session.supported()
        );
    },
    
    pushState: function(params, url) {
        this._modifyState(params, url, 'pushState');
    },
    
    replaceState: function(params, url) {
        this._modifyState(params, url, 'replaceState');
    },
    
    isLoading: function() {
        return this._loading;
    },
    
    isPrefetching: function(page) {
        return (this._fetchPage && this._fetchPage == page);
    },
    
    observePopstate: function(f) {
        /* onload of the page, register a popstate handler
         * it's done onload for two reasons
         * (1) the logic inside of onpopstate handler breaks if the page takes a long time to load
         *     and the user navigates away from the first search page before the browser fires a popstate 
         *     onload
         * (2) the browser doesn't fire popstate events until after the load event anyway
         */
        if(!Ss.search.history.APISupported() || !Object.isFunction(f)) {
            return;
        }
        Event.observe(window, 'load', function(evt){
            (function() {
                Event.observe(window, 'popstate', f);
            }).defer();
        });
    },
    
/* Internals
 ***********/
     _loading: false,
    
    _fetchPage: null,
    
    _startLoading: function() {
        this._loading = true;
        Ss.search.showLoading();
    },
    
    _stopLoading: function() {
        this._loading = false;
        Ss.search.hideLoading();
    },
    
    _modifyState: function(params, url, method) {
        if(!params || !url || !params.page) {
            throw 'url and page param required';
        }
        if(method != 'replaceState' && method != 'pushState') {
            throw 'method of replaceState or pushState required';
        }
        if(this.isLoading()) {
            return;
        }
        this._startLoading();
        if(params.page) {
            var currentPage = Ss.search.getCurrentPage();
            var delta = this._getDelta(currentPage, params.page);
            var success = function(response) {
                Ss.search.history._stopLoading();
                Ss.search.update(response);
                window.history[method](response, '', url);
            };
            if(this.isPrefetching(params.page)) {
                this._pollUntilPrefetchResponse(params.page, function(response){
                        success(response);
                        Ss.search.history._prefetch(delta);
                });
            } else {
                Ss.search.client.execute(params, success);
                this._prefetch(delta);
            }
        }
    },
    
    _onpopstate: function(event) {
        if(!event.state) {
            Ss.search.show();
            if(!Ss.search.isInitialPage()) {
                var params = Ss.location.getQueryParams();
                var page = params.page || 1;
                Ss.search.history.replaceState({'page': page }, window.location.toString());
            }
            return;
        }
        if(Ss.search.preferences.conflict(event.state.parameters)) {
            Ss.search.preferences.resolve(event.state.parameters);
            return;
        }
        if (event.state.parameters.page) {
            Ss.search.update(event.state, true);
        }
    },
    
    _events: function() {
        this.observePopstate(Ss.search.history._onpopstate);
    },
     
    _prefetch: function (delta, page) {
        if(delta != -1 && delta != 1) {
            return;
        }
        page = page || Ss.search.getCurrentPage();
        var parameters = { 
            'page': Ss.search.sanitizePageNumber(page + delta)
        };
        if(parameters.page > Ss.search.getTotalPages() || parameters.page < 1 ) {
            return;
        }
        
        var cached = Ss.search.client.getCached(parameters);
        if(cached) {
            this._prefetchThumbs(cached.responseJSON.results);
            return;
        }
        this._fetchPage = parameters.page;
        Ss.search.client.execute(
            parameters,
            function (response) {
                Ss.search.history._fetchPage = null;
                Ss.search.history._prefetchThumbs(response.responseJSON.results);
            }
        );
    },
    
    _prefetchThumbs: function(results) {
        results.pluck('thumb_url').each(
            function(url){
                var img = new Image();
                img.src = url;
            }
        );
    },
    
    _pollUntilPrefetchResponse: function(page, onComplete) {
        if(!Object.isFunction(onComplete)) {
            return;
        }
        new PeriodicalExecuter(
            function(pe) {
                var cached = Ss.search.client.getCached({ page: page });
                if(cached) {
                    pe.stop();
                    onComplete(cached);
                }
            }, .0015
        );
    },
    
    _getDelta: function(srcPage, destPage) {
        var delta = 1;
        if(srcPage && destPage && (destPage == (srcPage-1))) {
            delta = -1;
        }
        return delta;
    }
    
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/history.js'

// global.js: begin JavaScript file: '/js/search/history/shim.js'
// ================================================================================
(function(){

    if(!Ss.search.history.shimEnabled()) {
        return;
    }
    
    Object.extend(Ss.search.history, {
        initialize: function() {
            Event.observe(window, 'hashchange', this._onhashchange.bind(this));
            this._initializeStorage();
            this._prefetch(1);
        },
        
        pushState: function(params) {
            if(!params || !params.page) {
                throw 'page required';
            }
            Ss.location.setHashParams(params);
        },
        
        replaceState: function() {
            throw 'replaceState is not supported by this history shim';
        },
        
        _onhashchange: function(evt, onComplete) {
            

            if(this.isLoading()) {
                return;
            }
            
            var hashParams = Ss.location.getHashParams();
            


            var hashPage = parseInt(hashParams.page);
            var currentPage = Ss.search.getCurrentPage();
            if(!hashPage) {
                Ss.search.show();
                if(!Ss.search.isInitialPage()) {
                    this.pushState({ 'page': Ss.search.getInitialPage() });
                }
                return;
            } 
            
            var delta = this._getDelta(currentPage, hashPage);
            


            if(!this._loadAndDisplayStoredPage(hashPage, onComplete)) {
                

                this._startLoading();
                


                if(this.isPrefetching(hashPage)) {
                    new PeriodicalExecuter(
                        function(pe) {     
                            if(Ss.search.history._loadAndDisplayStoredPage(hashPage, onComplete)) {
                                pe.stop();
                                Ss.search.history._stopLoading();
                                Ss.search.history._prefetch(delta);
                            }
                        }, .0015);
                    return;
                }
    

                Ss.search.client.execute(
                    Ss.location.getHashParams(),
                    function (response) {
                        Ss.search.history._stopLoading();
                        Ss.search.update(response);
                        if(onComplete && Object.isFunction(onComplete)) {
                            onComplete(response);
                        }
                        Ss.search.history._storePage(hashPage, response.responseText);
                    }
                );
            }
            this._prefetch(delta);
        },
        
        _initializeStorage: function() {


            var qs = Object.toQueryString(Ss.search.client.getParams());
            if(qs != Ss.storage.session.getItem('search')) {
                Ss.storage.session.clear();
                Ss.storage.session.setItem('search', qs);
            }
        },
        
        _storePage: function(page, responseText) {
            var key = 'page=' + page;
            Ss.storage.session.setItem(key, responseText);
        },
        
        _getStoredPage: function(page) {
            var key = 'page=' + page;
            var storedResponse = Ss.storage.session.getItem(key);
            return storedResponse;
        },
        
        _loadAndDisplayStoredPage: function(page, onComplete) {
            var storedPage = this._getStoredPage(page);
            if(storedPage) {
                Ss.search.update(storedPage);
                if(onComplete && Object.isFunction(onComplete)) {
                    onComplete(storedPage);
                }
            }
            return storedPage;
        },
        
        _prefetch: function(delta) {
            if(delta != -1 && delta != 1) {
                return;
            }
            var parameters = Ss.location.getHashParams();
            var page = parseInt(parameters.page || Ss.search.getInitialPage());
            parameters.page = delta + page;
            if(parameters.page > Ss.search.getTotalPages() || parameters.page < 1 ) {
                return;
            }
            var storedPage = Ss.search.history._getStoredPage(parameters.page);
            if(storedPage) {
                Ss.search.history._prefetchThumbs(storedPage.results);
                return;
            }
            Ss.search.history._fetchPage = parameters.page;
            Ss.search.client.execute(
                parameters,
                function(response) {
                    Ss.search.history._fetchPage = null;
                    Ss.search.history._storePage(parameters.page, response.responseText);
                    Ss.search.history._prefetchThumbs(response.responseJSON.results); // cache images
                }
            );
        },
        
        _supportHashParamsOnload: function() {
            document.write('<style id="temp_style">#bodyContentCenter, #ui_widgets, select, .gc_thumb img { visibility: hidden !important; } #bodyContent{background: url("http://s2.picdn.net/images/loading_icon_2.gif") no-repeat 25px 25px;}</style>');
            Event.observe(document, 'dom:loaded', function(evt) {
                var ajaxLoad = function() {
                    Ss.search.history._onhashchange(null,
                        function(){
                            $('temp_style').remove();
                        }
                    );
                };
                if(Ss.search.initialized()) {
                    ajaxLoad();
                    return;
                }
                var _pe = new PeriodicalExecuter(
                    function(pe) {
                        if(Ss.search.initialized()) {
                            ajaxLoad();
                            pe.stop();
                        }
                    }, 0.025
                );
            });
        }
    });
    
})();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/shim.js'

// global.js: begin JavaScript file: '/js/search/history/support_hash_onload.js'
// ================================================================================
/* running _supportHashParamsOnLoad right away  
 * (in the head of the page) so that the user   
 * doesn't see the query page get replaced by 
 * the hash page
 */
(function(){


    if(!Ss.ENV || Ss.ENV.SCRIPT_NAME != "/cat.mhtml" || !Ss.location.hasHashParams()) {
        return;
    }
 
    var params = Ss.location.getHashParams();



    if(!params.page && !params.id) {
        return;
    }




    if(Ss.search.getInitialPage() == params.page && !params.id) {
        return;
    }
    



    if(Ss.search.history.shimEnabled()) {
        Ss.search.history._supportHashParamsOnload();
    } else {
        if(params.id) {
            window.location = '/pic.mhtml?' + Object.toQueryString(params);
        } else if (params.page) {
            params = Object.extend(Ss.location.getQueryParams(), params);
            window.location = window.location.pathname + '?' + Object.toQueryString(params);
        }
    }

})();
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/history/support_hash_onload.js'

// global.js: begin JavaScript file: '/js/search/nextButton.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};


Ss.search.nextButton = {

    initialize: function(currentPage, totalPages) {
        var element = $('search-results-next-button');
        
        if(!Object.isElement(element)) {
            return;
        }
        
        this.element = element;
        
        if(currentPage && totalPages) {
            this.update(currentPage, totalPages);
        }
        
        this.element.observe('click', function(evt) {
                Ss.search.paginate(1);
                evt.preventDefault();
        });
    },
    
    update: function(currentPage, totalPages) {
        if(!this.element) {
            return;
        }
        var isLastPage = currentPage >= totalPages;
        if(isLastPage) {
            this.element.hide();
        } else {
            this.element.show();
        }
    }
    
};

/*
      if(this.images != images) {
            images.push({
                _next: true,
                width: this.max,
                height: this.max
            });
        }
        this.next.setStyle({
            width: this._next._width + 'px',
            height: this._next._height + 'px'
        });

        getHTML:
        if(image._next) {
                 mosaic.setNext(image);
        }
 */
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/nextButton.js'

// global.js: begin JavaScript file: '/js/search/Pager.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};

Ss.search.Pager = Class.create({
    
    DISABLED_CSS: {
        prev: 'grid_pager_button_prev_disabled',
        next: 'grid_pager_button_next_disabled'
    },
    
    initialize: function(elements) {
        this.elements = elements; // form, input, prev, next
        
        this._prevDisabled = this.elements.prev.hasClassName(this.DISABLED_CSS.prev);
        this._nextDisabled = this.elements.next.hasClassName(this.DISABLED_CSS.next);
        
        this._events();
    },
    

    update: function(currentPage, totalPages) {
        var next = this.elements.next;
        var prev = this.elements.prev;
        var input = this.elements.input;
        var isLastPage = (currentPage >= totalPages);
        var isFirstPage = (currentPage <= 1);
        
        this.setFieldValue(currentPage);
        

        if(!isLastPage && this._nextDisabled) {
            next.removeClassName(this.DISABLED_CSS.next);
            this._nextDisabled = false;
        }


        if(isLastPage) {
            next.addClassName(this.DISABLED_CSS.next);
            this._nextDisabled = true;
        }        
        

        if(this._prevDisabled && !isFirstPage) {
            prev.removeClassName(this.DISABLED_CSS.prev);
            this._prevDisabled = false;
        }
        

        if(isFirstPage) {
            prev.addClassName(this.DISABLED_CSS.prev);
            this._prevDisabled = true;
        }
    },
    
    getFieldValue: function() {
        return parseInt($F(this.elements.input));
    },
    
    setFieldValue: function(page) {
        var input = this.elements.input;
        input.value = page;
        if(input.value.length > input.size) {
            input.size = input.value.length;
        }
    },
    
    _events: function() {
        var instance = this;
        this.elements.form.observe('submit',
            function(evt) {
                Ss.search.goToPage(instance.getFieldValue());
                evt.preventDefault();
            }
        );
        this.elements.prev.observe('click',
            function(evt) {
                Ss.search.paginate(-1);
                evt.preventDefault();
            }
        );
        this.elements.next.observe('click',
            function(evt) {
                Ss.search.paginate(1);
                evt.preventDefault();
            }
        );
    }
        
});


Ss.search.pagers = {
    
    initialize: function(currentPage, totalPages) {
        this.topPager = new Ss.search.Pager({
            form:   $('grid_options_top'),
            input:  $('grid_page_number_top'),
            prev:   $('grid_pager_prev_top'),
            next:   $('grid_pager_next_top')
        });
        this.bottomPager = new Ss.search.Pager({
            form:   $('grid_options_bottom'),
            input:  $('grid_page_number_bottom'),
            prev:   $('grid_pager_prev_bottom'),
            next:   $('grid_pager_next_bottom')
        });
        this.update(currentPage, totalPages);
    },
    
    update: function(currentPage, totalPages) {
        [this.topPager, this.bottomPager].invoke('update', currentPage, totalPages);
    }

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/Pager.js'

// global.js: begin JavaScript file: '/js/search/preferences.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = Ss.search || {};

Ss.search.preferences = {

	initialize: function(args) {
		this.form = args.form;
		this.pageInput = args.pageInput;
		this.trigger = args.trigger;
		this.container = args.container;
		this.panel = args.panel;
		this.spriteImage = args.spriteImage;
		this.safesearchTrigger = args.safesearchTrigger;
		this.safesearchContent = args.safesearchContent;
		this.safesearchClose = args.safesearchClose;

		this._setup();
		this._setPreferencesOnClick();
	},

	get: function() {
		return this.form.serialize().toQueryParams();
	},

	showLoading: function() {
		Ss.search.showLoading();
		Ss.search.preferences.container.addClassName('loading');
	},
	


	conflict: function(parameters) {
        return (
            parameters &&
            parameters['thumb_size'] &&
            (parameters['thumb_size'] == 'mosaic' || Ss.search.thumbSize == 'mosaic') &&
            parameters['thumb_size'] != Ss.search.thumbSize
        );
	},
	

	resolve: function(parameters) {
	    parameters['thumb_size'] = Ss.search.thumbSize;
	    Ss.search.history.replaceState(parameters, window.location.toString());
	},

	_setPreferencesOnClick: function() {
		var grid = Ss.image.grid;
		var preferences = this;
		var store = function() {
			var parameters = Object.extend(preferences.get(), {
				'component_path': 'set_display_prefs.md'
			});
			delete parameters.redirect;
			new Ajax.Request( '/show_component.mhtml', {
				method: 'POST',
				parameters: parameters
			});
		};
		preferences.form.delegateClick('input', function(evt){
			var input = Event.findElement(evt, 'input');
			var isActive;
			if(!Object.isElement(input)) {
				return;
			}
			isActive = Object.isElement(input.up('label.active'));
			if(isActive) {
				return;
			}
			preferences.pageInput.value = Ss.search.getCurrentPage();
			if(input.name == 'show_descriptions') {
				grid.toggleDescriptions(input.checked);
				store();
			}
			else if(input.name == 'image_previews') {
				Ss.image.Preview[(input.checked ? 'on' : 'off' )]();
				store();
			}
			else {
				preferences.showLoading();
				preferences.form.fire('preferences:submit');
				preferences.form.submit();
			}
			preferences.hide(.150);
		});
	},

	hide: function(delay) {
	    var preferences = this;
        (function(){
            preferences.panel.hide();
            document.body.removeClassName('preferences_menu_open');
        }).delay(delay || 0);
	},
	
	_setup: function() {
		var preferences = this;

		this.container.show();

		document.body.observe('click', function(e) {
			var elem = e.findElement();


			if(elem.isElementOrDescendantOf(preferences.trigger)) {
				preferences.panel.toggle();
				document.body[preferences.panel.visible() ? 'addClassName' : 'removeClassName' ]('preferences_menu_open');
			}


			if(elem == preferences.safesearchTrigger || elem == preferences.safesearchClose) {
				preferences.safesearchContent.toggle();
			}


			else if(preferences.panel.visible() && !elem.isElementOrDescendantOf(preferences.container)) {
				preferences.hide();
				preferences.safesearchContent.hide();
			}
		});
	}

};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/preferences.js'

// global.js: begin JavaScript file: '/js/search/related.js'
// ================================================================================
Ss = window.Ss || {};
Ss.search = window.Ss.search || {};


Ss.search.related = {
	
	_previewLimit: 5,
	
	_firstPreview: true,
	
	initialize: function(relatedPreviews) {

		this.relatedPreviews = relatedPreviews;
		
		this.elements = {
			container:	$('related_searches_container'),
			preview: 	$('ss_shadow_container')
		};
	
		if(
			!Object.isElement(this.elements.container) ||
			!Object.isArray(relatedPreviews)
		) {


			return;
		}


		this.elements.container.observe('mouseover',
			function(evt) {
				var link = evt.findElement('a');
				if(!Object.isElement(link) || !link.match('a')) {
					return;
				}
				Ss.search.related.preview(link);
			}
		);
		
	},


	setPreviewLimit: function(previewLimit) {
		this._previewLimit = previewLimit;
	},
	

	getPreviewResults: function(searchterm) {
		if(!Object.isString(searchterm)) {
			return;
		}
		
		var resultsObject = this.relatedPreviews.find(
			function(obj){
				return Object.keys(obj).include(searchterm);
			}
		);
		return resultsObject[searchterm].slice(0, this._previewLimit);
	},
	

	preview: function(link) {
		if(!Object.isElement(link)) {
			return;
		}
		
		var html = [],
			searchterm = link.innerHTML.stripTags(),
			results = this.getPreviewResults(searchterm),
			borderMarginPadding = 12,
			minWidth = results.inject(0, function(acc, result){ return acc + parseInt(result.thumb_width) + borderMarginPadding; });
			
		html.push('<ul class="clearfix" style="min-width: ' + minWidth + 'px;">');
		results.each(
			function(result, i) {
				html.push('<li>');
				html.push('<a id="related_search_image_' + (i+1) + '" style="width:' + result.thumb_width + 'px; height:' + result.thumb_height+ 'px;" href="' + result.link + '">');
				html.push('<img src=' + result.thumb_url + ' />');
				html.push('</a>');
				html.push('</li>');
			}
		);
		html.push('</ul>');
		html.push('<div class="rs_hover"></div>');
		this.show( html.join(''), link);
	},
	

	show: function(content, link) {
		
		var scElem = null;
		var related = Ss.search.related;
		var args = {
			modal: false,
			position: {
					target:		link,
					type:		'bottom-center',
					offsetY:	11
	
			},
			notch: {
				type: 'top'
			},
			closeButton: false,
			className: 'related_preview' + (this._firstPreview ? ' opac_0' : '')
		};
	

		var write = function() {

			document.body.addClassName('related_preview_visible');
			

			scElem = Ss.ShadowContainer.write(content, args);
			

			Ss.ShadowContainer.positionNotch(link);
		};
		

		var writeAndFadeIn = function() {
			write();
			if(scElem.CSSTransitionsSupported()) { // if css transitions are available
				scElem.addClassName('animate_opacity'); // add the css class used for css transitions (if available)
				scElem.removeClassName('opac_0'); // unset the 0 opacity to trigger the transition
			} else {
				scElem.fadeIn({ onComplete: function(){ scElem.removeClassName('opac_0'); } }); // do the transition with javascript, unset the 0 opacity after it has completed
			}
			related._firstPreview = false;
		};


		if(this._firstPreview) {

			this._tid = writeAndFadeIn.delay(.25); 
		} else {

			write();
		}
		
		this.observeMouseout();
	},
	

	hide: function() {


		document.body.removeClassName('related_preview_visible');
		

		if(this._tid) {
			window.clearTimeout(this._tid);
			this._tid = null;
		}
		

		if(Ss.ShadowContainer.visible()) {
			Ss.ShadowContainer.hide(); // hide it
		}
		
		this.stopObservingMouseout();
	},
	
	mouseoutHandler: function(evt) {
		var destinationElement = evt.relatedTarget || evt.toElement;
		


		if(
			Object.isElement(destinationElement) &&
			!destinationElement.isElementOrDescendantOf(Ss.search.related.elements.container) &&
			!destinationElement.isElementOrDescendantOf(Ss.search.related.elements.preview)
		) {
			Ss.search.related.hide();
		}
	},
	
	observeMouseout: function() {
		[this.elements.container, this.elements.preview].invoke('observe', 'mouseout', this.mouseoutHandler);
	},
	
	stopObservingMouseout: function() {
		[this.elements.container, this.elements.preview].invoke('stopObserving', 'mouseout', this.mouseoutHandler);
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/search/related.js'

// global.js: begin JavaScript file: '/js/image/Preview.js'
// ================================================================================
/* Copyright (c) 2008 Shutterstock Images LLC */
Ss = window.Ss || {};
Ss.image = window.Ss.image || {};

Ss.image.Preview = Class.create({
        
        initialize: function(args) {
            
            this.elements = args.elements;
    
            this.showing = false;
    
            this.locks = {
                thumbLoad: {}
            };
    
            this.activeResultSlot = {};
            

            this.elements.previewImage = new Image();
            $(this.elements.previewImage).hide();
            this.elements.thumb.parentNode.insertBefore(
                this.elements.previewImage,
                this.elements.thumb
            );
        
            this.elements.thumb.observe('load', this.show.bind(this));
        },

        populate: function(args) {






            var resultSlot = args.resultSlot;
            var isMosaic = args.isMosaic;
            this.showing = true;





            var thumb = resultSlot.elements.thumb;
            var previewThumb = this.elements.thumb;
            var previewImage = this.elements.previewImage;
            var pageContainer = this.elements.pageContainer;
            var previewDescription = this.elements.description;
            var descriptionText = args.descriptionText;
            var showDescription = !Object.isUndefined(args.descriptionText);


            var imageSrc = resultSlot.previewThumbSrc
                ? resultSlot.previewThumbSrc
                : ['http:/', resultSlot.result.host, 'photos', 'display_pic_with_logo', resultSlot.result.set_name, resultSlot.result.filename].join('/');


            if (previewImage.src == imageSrc) {
                this.show();
            } else {
                this.locks[resultSlot.id] = true;


                var hqAnnotationHeight = 20;

                var dimensionMax = 450;


                var aspectRatio = args.resultSlot.result.aspect_ratio;
                var displayHeight = aspectRatio < 1
                    ? dimensionMax
                    : Math.round(dimensionMax / aspectRatio);
                var displayWidth = aspectRatio < 1
                    ? Math.round(dimensionMax * aspectRatio)
                    : dimensionMax;


                var previewContainer = previewThumb.parentNode;
                previewContainer.style.height = displayHeight + 'px';
                previewContainer.style.width = displayWidth + 'px';
                previewContainer.style.overflow = 'hidden';
                

                if(previewDescription && showDescription) {
                	previewDescription.style.width = displayWidth + 'px';
                	previewDescription.update(descriptionText);
                }


                var iframeBacking = this.elements.iframeBacking;
                if (iframeBacking) {
                    iframeBacking.style.height = (displayHeight + 65) + 'px';
                    iframeBacking.style.width = (displayWidth + 65) + 'px';
                }


                this.position( {
                    resultSlot: resultSlot,
                    placement: args.placement,
                    fixedContainer: args.fixedContainer,
                    fixedAncestor: args.fixedAncestor,
                    pageContainer: pageContainer,
                    showDescription: showDescription,
                    cellMax: args.cellMax,
                    isMosaic: isMosaic
                } );


                previewThumb.show();
                previewImage.hide();



                previewImage.src = imageSrc;
                previewImage.height = displayHeight + hqAnnotationHeight;
                previewImage.width = displayWidth;

                previewImage.onload = function () {

                    if (this.locks[resultSlot.id]) {
                        toggleCursorState('revert', this.activeResultSlot.elements.thumb, 'local');
                        this.locks[resultSlot.id] = false;
                    }
                    previewThumb.hide();
                    previewImage.show();
                }.bind(this);




                if(!thumb) {

                    return;
                }
                previewThumb.src = thumb.src;
                previewThumb.height = aspectRatio <= 1
                    ? dimensionMax
                    : dimensionMax * (thumb.naturalHeight || thumb.height) / (thumb.naturalWidth || thumb.width);
                previewThumb.width = aspectRatio <= 1
                    ? dimensionMax * (thumb.naturalWidth || thumb.width) / (thumb.naturalHeight || thumb.height)
                    : dimensionMax;
                



                this.elements.container.style.display = 'block';
            }



            setTimeout(function() {
                if (this.locks[resultSlot.id]) {
                    toggleCursorState('progress', thumb, 'local');
                }
            }.bind(this), 1000);

        },

        unPopulate: function(args) {
            if (!args) args = {};
            this.locks[this.activeResultSlot.id] = false;
            this.elements.container.style.display = 'none';	
            this.showing = false;
            if (this.activeResultSlot.elements && !args.dontClearCursor) {
                toggleCursorState('revert', this.activeResultSlot.elements.thumb, 'local'); 
            }

            newlyActiveThumb = false;
        },

        position: function(args) { // resultSlot, placement

            this.activeResultSlot = args.resultSlot;

            var thumbPosition;
            var isMosaic = args.isMosaic;
            var pageContainer = args.pageContainer;
            
            if (args.fixedContainer && args.fixedAncestor) {
                thumbPosition = getFixedPosition(args.fixedContainer, args.resultSlot.elements.container, args.fixedAncestor);
            } else {
                thumbPosition = getElementScreenPosition(args.resultSlot.elements.container);
            }

            var viewportDimensions = document.viewport.getDimensions();
            var viewportOffsets = document.viewport.getScrollOffsets();



            if(isMosaic) {
                var previewPadding = 60;

                if (Ss.image.mosaic && Ss.image.mosaic.options && Ss.image.mosaic.options.hover === 'hover_michal') {
                    previewPadding = 100;
                }
            } else {
                var previewPadding = (args.cellMax ? 35 : 60);
            }

            var padding = (args.cellMax ? 6 : 10);
            var descriptionHeight = 25;


            var dimensions = args.resultSlot.getDimensions(450);
            var previewHeight = dimensions.height + previewPadding;
            var previewWidth = dimensions.width + previewPadding;
            


            var cellMax = args.cellMax;

			var thumbWidth, thumbHeight;
			
			try {
			    var elem = this.activeResultSlot.elements.container.getDimensions();
				thumbWidth = parseInt(elem.width);
				thumbHeight = parseInt(elem.height);
			} catch (e) {
            	thumbWidth = thumbHeight = activeThumbSize.max_dimension_pixels;
			}
			
            var berth = {
                top: thumbPosition.top - previewHeight,
                left: thumbPosition.left - previewWidth,
                bottom: viewportDimensions.height - thumbPosition.top - previewHeight,
                right: viewportDimensions.width - thumbPosition.left - thumbWidth - previewWidth
            };

            var bestPlacement;
            $H(berth).keys().each( function(placement) {
                bestPlacement = bestPlacement ? bestPlacement : placement;
                bestPlacement = berth[placement] > berth[bestPlacement] ? placement : bestPlacement;
            } );

            bestPlacement = bestPlacement ? bestPlacement : 'bottom';
            var previewPosition, diffThumbCellX, diffThumbCellY;

            switch (bestPlacement) {
                case 'top':
                    previewPosition = {
                        top: thumbPosition.top - previewHeight - padding,
                        left: thumbPosition.left + (thumbWidth / 2) - (previewWidth / 2)
                    };
                    
					if(cellMax) {
						diffThumbCellY = cellMax - thumbHeight;
						previewPosition.top -= (diffThumbCellY + previewPadding - padding);
					}
                    break;
                case 'left':
                    previewPosition = {
                        top: thumbPosition.top + (thumbHeight / 2) - (previewHeight / 2),
                        left: thumbPosition.left - previewWidth - padding - 3
                    };
					
					if(cellMax) {
						diffThumbCellX = cellMax - thumbWidth;
						previewPosition.left -= (diffThumbCellX/2).round();
					}
                    break;
                case 'bottom':
                    previewPosition = {
                        top: thumbPosition.top + thumbHeight + padding,
                        left: thumbPosition.left + (thumbWidth / 2) - (previewWidth / 2)
                    };
                    
                    if(cellMax) {
                    	


                    	previewPosition.top += cellMax - Ss.image.grid.calculateTopMargin(thumbHeight) - thumbHeight;
                    	

                    	if(Ss.image.grid.hasDescriptions()) {
                    		previewPosition.top += descriptionHeight;
                    	}
                    	
                    }
                    break;
                case 'right':
                    previewPosition = {
                        top: thumbPosition.top + (thumbHeight / 2) - (previewHeight / 2),
                        left: thumbPosition.left + thumbWidth + padding
                    };
                    
					if(cellMax) {
						diffThumbCellX = cellMax - thumbWidth;
						previewPosition.left += (diffThumbCellX/2).round();
					}
                    break;
            }


            var offsetTop = pageContainer.cumulativeOffset();
            var viewportHeight = viewportDimensions.height;
            if(offsetTop && offsetTop[1] && previewPosition['top']) {
                previewPosition['top'] -= offsetTop[1];
                viewportHeight -= offsetTop[1];
            }

            var containerStyle = this.elements.container.style;
            $w('top left').each( function(dimension) {
                if (previewPosition[dimension] !== null) {

                    if ((bestPlacement == 'left' || bestPlacement == 'right') && (dimension  == 'top')
                        || (bestPlacement == 'top' || bestPlacement == 'bottom') && (dimension  == 'left')) {
                    
                        if (previewPosition[dimension] < 0) {
                            previewPosition[dimension] = padding;

                        } else if (dimension == 'left' && previewPosition[dimension] + previewWidth > viewportDimensions.width) {
                            previewPosition[dimension] = viewportDimensions.width - previewWidth - padding;

                        } else if (dimension == 'top' && previewPosition[dimension] + previewHeight > viewportHeight) {
                            previewPosition[dimension] = viewportHeight - previewHeight - padding;
                        }
    
                    }

                    if (dimension == 'top' || dimension == 'bottom') {
                        containerStyle[dimension] = previewPosition[dimension] + viewportOffsets.top + 'px';
                    } else {
                        containerStyle[dimension] = previewPosition[dimension] + 'px';
                    }
                
                } else {
                    containerStyle[dimensions] = null;
                }
            } );

        },
        show: function() {
            if (!this.showing) return;
            this.elements.container.style.display = 'block';
        }
});

Object.extend(Ss.image.Preview, {
        initialize: function() {

            window.resultPreview = new Ss.image.Preview( { 
                elements: {
                    container: $('photo-details-container'),
                    thumb: $('photo-comp-thumb'),
                    iframeBacking: document.getElementById('photo-details-iframe-backing'),
                    description: $('photo-details-description'),
                    pageContainer: $('shutterstock_page')
                }
            });
            
            window.activeThumbSize = { max_dimension_pixels: 100 };
        },
        
        on: function() {
            var grid = $('grid_cells');
            if(!Object.isElement(grid)) {
                return;
            }
            grid.observe('mouseover', function(evt) {
                var thumb = Event.findElement(evt, 'img');
                var mousingFromAddToLightbox = Object.isElement(evt.relatedTarget) && Object.isElement(evt.relatedTarget.up('.add_to_lightbox'));
                if(mousingFromAddToLightbox) {
                    return;
                }
                if(thumb) {
                    previewThumb(thumb);
                }
            });
            grid.observe('mouseout', function(evt) {
                var cell;
                var thumb;
                
                if(Ss.image.mosaic.isActive()) {
                    cell = Event.findElement(evt, '.gc_clip');
                    if(cell && (!evt.relatedTarget || (evt.relatedTarget && !evt.relatedTarget.isElementOrDescendantOf(cell)))) {
                        thumb = cell.down('img');
                    }
                } else {
                    thumb = Event.findElement(evt, 'img');
                }
                if(thumb) {
                    cancelPreview(thumb);
                }
            });
        },
        
        off: function() {
            var grid = $('grid_cells');
            if(!Object.isElement(grid)) {
                return;
            }
            grid.stopObserving('mouseover');
            grid.stopObserving('mouseout');
        }
        
});


/************************************************************
 * Dependencies/functions moved from other deprecated classes
 **/
var legacyActiveThumb; // dump this out into the global namespace for show_image.mh
var initialElementCursorStyles = {};

function previewThumb(e, descriptionText, cellMax) {
	legacyActiveThumb = e;
	if (!Object.isElement(legacyActiveThumb)) {
	    return;
	}
	setTimeout( function() {
		if (legacyActiveThumb && legacyActiveThumb.src == e.src) {

		    var container;
		    var selectors = [
		        '.thumb_image_container',
		        '.gc_c',
		        '.gc_thumb',
		        '.mosaic_cell'
		    ];
			selectors.each(function(s){
			    var ctr = legacyActiveThumb.up(s);
			    if(ctr) {
			        container = ctr;
			    }
			});
			
			if(!container || container.hasClassName('no_preview') || container.up('.no_preview')) {
			    return;
			}
			
            var thumbWidth;
            var thumbHeight;
	        var isMosaic = Ss.image.mosaic.isActive();

            if(isMosaic && e.up('.mosaic_cell')) {
                var thumb = container.hasClassName('gc_clip') ? container : container.down('.gc_clip');
                thumbWidth = parseInt(thumb.style.width);
                thumbHeight = parseInt(thumb.style.height);
            } else {
                thumbWidth =  parseInt(container.style.width);
                thumbHeight = parseInt(container.style.height);
            }

			var previewThumbSrc;
			
            if(legacyActiveThumb.src.match(/display_pic_with_logo/)) {
                previewThumbSrc = legacyActiveThumb.src;
            } else {
                previewThumbSrc = legacyActiveThumb.src.replace(/\/(thumb_small|thumb_large)\//, '/display_pic_with_logo/');
                if (!previewThumbSrc.match(/https?:\/\/[^\/]+\/photos\//ig)) {
                    /* we are using seo optimized photo url, we can use image.shutterstock.com */
                    previewThumbSrc = previewThumbSrc.replace(/(https?:\/\/)([^\/]+)/,'$1' + 'image.shutterstock.com');
                }
            }

			var fakeResultSlot = {
				elements: {
					container: container,
					thumb: legacyActiveThumb
				},
				getDimensions: function(maxDimensionPixels) {
					
					var multiplier = maxDimensionPixels / Math.max(thumbWidth, thumbHeight);
					return { 
						width: thumbWidth * multiplier, 
						height: thumbHeight * multiplier
					};
				},
				result: {
					aspect_ratio: (thumbWidth / thumbHeight)
				},
				previewThumbSrc: previewThumbSrc
			};

			if (window.resultPreview) {
				var lightboxContainer = document.getElementById('lightbox-contents-table');
				var lightboxFixedAncestor = document.getElementById('lightbox-preview-container');
				var fixedContainer = lightboxContainer && Element.extend(legacyActiveThumb).descendantOf(lightboxContainer) ? lightboxContainer: null;
				resultPreview.populate( { resultSlot: fakeResultSlot, fixedContainer: fixedContainer, fixedAncestor: lightboxFixedAncestor, descriptionText: descriptionText, cellMax: cellMax, isMosaic: isMosaic } );
				resultPreview.show();
			}
		}
	}, 250);
}

function cancelPreview(e) {
	legacyActiveThumb = null;
	if (window.resultPreview) {
		resultPreview.unPopulate();
	}
}

function toggleCursorState(state, e, scope) {

    if (this.isSafari) {
        
        var cursorIndicator = $('cursor-indicator');

        if (state == 'revert') {
            cursorIndicator.hide();	

        } else {
            this.showingCursorIndicator = true;
            this.positionCursorIndicator();
            cursorIndicator.show();
        }

    } else {

        if (state == 'revert') {
            if (e && e.style.cursor == 'progress') {
                e.style.cursor = initialElementCursorStyles[e.id];
            }
            if (scope != 'local') {
                document.body.style.cursor = 'auto';
            }

        } else {
            if (e && e.style.cursor != 'progress') {
                initialElementCursorStyles[e.id] = e.style.cursor;
            }

            if (e) e.style.cursor = state;

            if (scope != 'local') {
                document.body.style.cursor = state;
            }
        }
    }

}

function getElementScreenPosition(e, fixedOffsets) {

    var elementPagePosition = getElementPosition(e);
    var scrollOffsets = fixedOffsets ? fixedOffsets : document.viewport.getScrollOffsets();

    return { 
        left: elementPagePosition.left - scrollOffsets.left,
        top: elementPagePosition.top - scrollOffsets.top
    };

}

function getFixedPosition(container, element, fixedAncestor) {

    var elementPosition = getElementPosition(element, container.id);

    var elementAdjustedTop = elementPosition.top - container.scrollTop;
    var elementAdjustedLeft = elementPosition.left - container.scrollLeft;
    
    var containerPosition;
    if (Element.getStyle(fixedAncestor, 'position') == 'fixed') {
        containerPosition = getElementPosition(container);
    } else {
        containerPosition = getElementScreenPosition(container);
    }

    var elementScreenTop = elementAdjustedTop + containerPosition.top;
    var elementScreenLeft = elementAdjustedLeft + containerPosition.left;

    return { top: elementScreenTop, left: elementScreenLeft };

}

function getElementPosition(obj, containerId) {

        var left = 0, top = 0;
        if (obj.offsetParent) {
                do {
                    if (containerId && obj.id == containerId) {
                        break;
                    }
                    left += obj.offsetLeft;
                    top += obj.offsetTop;
                } while (obj = obj.offsetParent);
        }
    
    return { left: left, top: top };

}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/Preview.js'

// global.js: begin JavaScript file: '/js/image/grid.js'
// ================================================================================
Ss.image = window.Ss.image || {};

Ss.image.grid = {
    
    cells: [],
    
    element: null,

    _hasPreview: null,
    
    recycleElements: Prototype.Browser.WebKit || Ss.Browser.isIEVersion(10),

    setup: function(){
        this.element = $('grid_cells');
        this.handleLightboxClicks();
    },

    initialize: function() {
        this.element.select('.gc').each( 
            function(elem, index) {
                
                var content = elem.down('div');
                var imageLink = elem.down('.gc_thumb');
                var image = elem.down('.gc_thumb img');
                var descriptionLink = elem.down('.gc_desc');
                var picIcon = elem.down('.pic_btn');
                var id = elem.id.replace('gc_', '');
                
                if(this.recycleElements) {
                    this.cells.push(
                        new Ss.image.Cell({
                            index: index,
                            elements: {
                                container: elem,
                                content: content,
                                imageLink: imageLink,
                                image: image,
                                descriptionLink: descriptionLink,
                                picIcon: picIcon
                            },
                            id: id
                        })
                    );
                }
            }.bind(this));
    },

    update: function(response) {
        if(this.recycleElements) {
            this.cells.each(
                function(cell, i) {
                    var result = response.results[i];
                    result ? cell.update(result) : cell.clear();
                }
            );
        } else {
            this.element.innerHTML = this.getHTML(response.results);
        }
    },
    
    getHTML: function(results) {
		var output = [], result, id, href;
		for(var i=0, len=results.length; i<len; i++) {
			result = results[i];
			id = result.id;
			href = result.photo_detail_link;
			output.push('<div class="gc" id="gc_' + id + '">');
			output.push('    <div data-id="' + id + '">');
			output.push('        <a class="gc_thumb" href="'+ href + '" style="height: ' + result.thumb_height + 'px; width: ' + result.thumb_width +'px;">');
			output.push('            <img src="' + result.thumb_url + '" />')
			output.push('        </a>');
			output.push('        <a class="gc_desc" href="' + href + '">')
			output.push(result.display_description);
			output.push('        </a>');
			output.push('        <div class="gc_btns">');
			output.push('            <a class="lbx_btn" title="' + Ss.search.text.lightbox + '"></a>');
			output.push('            <a class="pic_btn" title="' + Ss.search.text.download + '" href="' + href + '"></a>');
			output.push('        </div>');
			output.push('    </div>');
			output.push('</div>');
		}
		return output.join('');
    },
    
    handleLightboxClicks: function() {
        if(!Object.isElement(this.element)) {
            return;
        }
        this.element.delegateClick('.lbx_btn', function(evt) {
            var cell = Event.findElement(evt, '.gc>div, .mosaic_cell');
            var placeholder;
            var photoId;
            var isMosaic = Ss.image.mosaic.isActive();
            
            if(!Object.isElement(cell)) {
                return;
            }
            
            Event.stop(evt);

            photoId = cell.getAttribute('data-id');
            

            dropdownDialogShowing = true;
            selectedPhotoId = photoId;
            

            placeholder = isMosaic ? cell : cell.down('.gc_btns');
            

            placeholder.insert(Ss.Lightbox.multipleAdder.getPulldown().getElement());
            Ss.Lightbox.multipleAdder.getPulldown().expand();
            

            if(Ss.user.loggedIn) {
                Ss.Lightbox.multipleAdder.refresh();
            }
        });
    },
    
    writeDescriptions: function() {
		this.element.select('.gc_desc').each(
			function(desc) {
				if(desc.title && !desc.title.empty()) {
					desc.update(desc.title);
					desc.title = '';
				}
			}
		);
    },
    
    showDescriptions: function() {
        this.element.addClassName('descriptions_on');
        this.writeDescriptions();
    },

    hideDescriptions: function() {
    	this.element.removeClassName('descriptions_on');
    },
    
    toggleDescriptions: function(showOrHide) {
        if(Object.isUndefined(showOrHide)) {
            showOrHide = !this.hasDescriptions();
        }

        if(showOrHide) {
            this.showDescriptions();
        } else {
            this.hideDescriptions();
        }
    },

    hasDescriptions: function() {
    	return this.element.hasClassName('descriptions_on')
    },
    
	getCellById: function(id) {
	    return $('gc_' + id);
	}
    
};

Ss.image.Cell = Class.create({
        
        initialize: function(args) {
            this.index = args.index;
            this.elements = args.elements;
            
            this.elements.image.onload = function(evt) {
            	this.setStyle({
            			visibility: 'visible'
            	});
            };
        },
        
        update: function(result) {
        	

            var container = this.elements.container;
            var content = this.elements.content;
            var imageLink = this.elements.imageLink;
            var image = this.elements.image;
            var descriptionLink = this.elements.descriptionLink;
            var picIcon = this.elements.picIcon;


            if(image.src === result.thumb_url) {
                return;
            }
        	
            container.id = 'gc_' + result.id; 

            content.setAttribute('data-id', result.id)
            

            imageLink.style.cssText = 'width: ' + result.thumb_width + 'px; ' + 'height: ' + result.thumb_height + 'px';
            

            image.setStyle({
            		visibility: 'hidden'
            });
            

            image.src = result.thumb_url;
            


            image.alt = '';
            

            descriptionLink.innerHTML = result.display_description;
            

            picIcon.href = imageLink.href = descriptionLink.href = result.photo_detail_link;
            

            !container.visible() && container.show();
            
        },
        
        clear: function() {
            this.elements.container.hide();
        }
        
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/grid.js'

// global.js: begin JavaScript file: '/js/image/mosaic/mosaic.js'
// ================================================================================
Ss = window.Ss || {};
Ss.image = Ss.image || {};

Ss.image.mosaic = {
	
	options: {
		margin: 3,
		size: 280,
		border: 1
	},
	
	constraints: {
		minWidth: 150,
		maxWidth: 310,
		tolerance: 0.20,
		minHeight: 135
	},
	
	initialize: function(args) {
		this.element = args.element;
		this.grid = new Ss.image.mosaic.Grid();
		
		this._events();
	},

	isActive: function() {
		return Ss.search.thumbSize && Ss.search.thumbSize == 'mosaic';
	},

	update: function(images) {
		if (!Object.isArray(images) || !images.length) {
			return;
		}
		this.element.fire('mosaic:beforeUpdate');
		images.each(function(image){
			image.width = image.width || image.thumb_width;
			image.height = image.height || image.thumb_height;
		});
		this.rows = this.grid.create(images, this.options, this.constraints);
		this.element.update(this.makeHTML(this.rows));
		this.images = images;
	},

	layout: function(targetWidth) {
		var mosaic = Ss.image.mosaic;
		targetWidth = (Object.isNumber(targetWidth) ? targetWidth : mosaic.element.getWidth());
		if(!targetWidth || mosaic.grid.getWidth() == targetWidth) {
			return;    
		}
		mosaic.grid.setWidth(targetWidth); 
		mosaic._layout();
	},

	_layout: function() {
		var cells = this.readCells();
		var rows = this.grid.create(cells, this.options, this.constraints);
		
		rows.flatten().each(function(cell){
			var top = '';
			if(cell.data.type == 'maxWidth') {
				top = Math.floor((cell.data.containerHeight - cell.data.height)/2) + 'px';
			}
			cell.elements.clipper.setStyle({
				'width': Math.floor(cell.data.width) + 'px',
				'height': Math.floor(cell.data.height) + 'px',
				'top': top
			});
			cell.elements.anchor.setStyle({
				'width': Math.floor(cell.data.containerWidth) + 'px',
				'height': Math.floor(cell.data.containerHeight) + 'px'
			});
		});
	},

	readCells: function() {
		return this.element.select('.mosaic_cell').map(function(cell){
			return {
				width: parseInt(cell.getAttribute('data-width')),
				height: parseInt(cell.getAttribute('data-height')),
				aspect: cell.getAttribute('data-aspect'),
				elements: {
					anchor: cell.down('a'),
					clipper: cell.down('.gc_clip')
				}
			};
		});
	},
	
	makeHTML: function(rows) {
		var html = [];
	
		rows.flatten().each(function(image) {
			var clipperStyles = [
				 'width:' + Math.floor(image.data.width) + 'px',
				 'height:' + Math.floor(image.data.height) + 'px'
			];
			var containerStyles = [
				'width:' + Math.floor(image.data.containerWidth) + 'px',
				'height:' + Math.floor(image.data.containerHeight) + 'px'
			];
			if(image.data.type == 'maxWidth') {
				var vCenter = Math.floor( (image.data.containerHeight - image.data.height) / 2);
				clipperStyles.push('top:' + vCenter + 'px');
			}
			
			html.push('<div class="mosaic_cell" data-id="' + image.id + '" data-width="' + image.width + '" data-height="' + image.height + '" data-aspect="' + image.aspect + '">');
			html.push('    <a href="' + image.photo_detail_link + '" style="' + containerStyles.join(';') + '">');
			html.push('        <span class="gc_clip" style="' + clipperStyles.join(';') + '">')
			html.push('            <img src="' + image.thumb_url + '" alt="' + (image.full_description || '') + '" />');
			html.push('        </span>');
			html.push('        <span class="gc_desc">' + image.display_description + '</span>');
			html.push('        <span class="gc_btns">');
			html.push('            <span class="lbx_btn"></span>');
			html.push('            <span class="pic_btn"></span>');
			html.push('        </span>');
			html.push('    </a>');
			html.push('</div>');
		 });
		return html.join('');
	},
	
	getLastCellOnRow: function(cell) {
		var next = null;
		var top = cell.getBoundingClientRect().top;
		while(next = cell.next('.mosaic_cell')) {
			if(next.getBoundingClientRect().top != top) {
				break;
			}
			cell = next;
		}
		return cell;
	},

	getCellById: function(id) {
	    return this.element.down('.mosaic_cell[data-id=' + id + ']');
	},
	
	_resize: function() {
		this.layout(this.element.getWidth());
	},

	_events: function() {
		var resize = this._resize.bind(this);
		Event.observe(window, 'resize', resize);
		Event.observe(window, 'focus', resize);
	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/mosaic.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Grid.js'
// ================================================================================
Ss.image.mosaic.Grid = Class.create({

    initialize: function() {

    },

    setWidth: function(width) {
        this.width = width;
    },

    getWidth: function() {
        return this.width;
    },

    create: function(images, options, constraints) {
        var instance = this;
        




        this._scale(images, options.size);
        
        var rows = [ new Ss.image.mosaic.Row(instance.width, options, constraints) ];
        images.each( 
            function(image, i) {
                var fits = rows.last().addImage(image);
                if(!fits) {
                    rows.push(new Ss.image.mosaic.Row(instance.width, options, constraints));
                    rows.last().addImage(image);
                }
            }
        );
        return rows.map(
            function(row) {
                return row.getImages();
            }
        );
    },





	_scale: function(images, size) {
        if(images[0].width == size || images[0].height == size) {
            return;
        }
        var scale = size/450;
        images.each(function(image) {
            image.width *= scale;
            image.height *= scale;
        });
	    return images;
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Grid.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Row.js'
// ================================================================================
Ss.image.mosaic.Row = Class.create({

    initialize: function(width, options, constraints) {
        this.width = width;
        this.margin = options.margin || 5;
        this.border = options.border || 0;
        this.size = options.size;
        this.constraints = constraints;
        
        this.images = [];
        this.height = null;
    },

    getImages: function() {
        return this.images;
    },

    getImagesByType: function() {
        return this.images.inject({}, function(types, image) {
            if(image.data) {
                types[image.data.type] = types[image.data.type] || [];
                types[image.data.type].push(image);
            }
            return types;
        });
    },

    addImage: function(image) {


        if(!this.hasRemainingPixels()) {
            this.setWidth(this.numUsablePixels()); 
            return false;
        }
        

        this.images.push(image);


        this.setHeight(this._calculateHeight());


        this._handleMinorConstraintViolations();


        if(!this.hasRemainingPixels()) {
            this.setWidth(this.numUsablePixels());    
        }
        return true;
    },                           

    setHeight: function(height, setContainers) {
        this.height = height;
        var constraints = this.constraints;
        var cells = this.images.map(function(image){
            return new Ss.image.mosaic.Cell(image, constraints);
        });
        return cells.invoke('setHeight', height, setContainers);
    },


    setWidth: function(width) {


        var rowHeight = width/this.numUsedPixels() * this.height;
        this.setHeight(rowHeight, true);
        this._fixRoundingError(width);
    },

    numUsedPixels: function() {
        return Ss.util.sum(this.images.pluck('data'), 'containerWidth');
    },

    numUsablePixels: function() {
        return this.width - this.numUnusablePixels();
    },

    numUnusablePixels: function() {
        return (this.margin * 2 + this.border * 2) * this.images.length;
    },
    
    numRemainingPixels: function() {
        return this.numUsablePixels() - this.numUsedPixels();
    },
    
    hasRemainingPixels: function() {
        return this.numRemainingPixels() > 0;
    },

    _calculateHeight: function() {

        var rowHeight = Ss.util.avg(this.images, 'height');
        

        var types = this.getImagesByType();
        

        if(types.maxWidth) {
            var candidates = [];
            $H(types).each(function(type){
                if(type.key != 'maxWidth') {
                    candidates = candidates.concat(type.value);
                }
            });
            if(candidates.length) {
                rowHeight = Ss.util.avg(candidates, 'height');
            }
        }
        

        if(this.constraints.minHeight) {
            return Math.max(rowHeight, this.constraints.minHeight);
        }

        return rowHeight;
    },
    

    _handleMinorConstraintViolations: function() {
        var types = this.getImagesByType();



        if(types.minWidthMinor) {

            var optimalHeight = types.minWidthMinor.pluck('data').pluck('optimalHeight').max();


            this.setHeight(optimalHeight);



            var newTypes = this.getImagesByType();
            if(types.maxWidth && newTypes.maxWidth && newTypes.maxWidth.length <= types.maxWidth.length) {
                this.height = optimalHeight;
                types = newTypes;
            } else {
                this.setHeight(this.height);
            }
        }



        if(types.maxWidthMinor) {
            types.maxWidthMinor.each(
                function(image){
                    image.data.width = image.data.containerWidth = image.data.optimalWidth;
                    image.data.height = image.data.containerHeight = image.data.optimalHeight;
                }
            );
        }
        
    },

    _fixRoundingError: function(width) {
        var error = this.numUsedPixels() - width;
        var errorPerImage = error/this.images.length;
        var accumulatedError = 0;
        var rounded;
        if(!error) {
            return;
        }
        this.images.each(
            function(image) {
                accumulatedError += errorPerImage;
                rounded = Math.round(accumulatedError);
                image.data.containerWidth -= rounded;
                if(image.data.width > image.data.containerWidth) {
                    image.data.width = image.data.containerWidth;
                    image.data.height = image.data.width * 1 / image.aspect;
                }
                accumulatedError -= rounded;
            }
        );
    }

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Row.js'

// global.js: begin JavaScript file: '/js/image/mosaic/Cell.js'
// ================================================================================
Ss.image.mosaic.Cell = Class.create({

	initialize: function(image, constraints) {
		this.image = image;
        this.constraints = constraints;
	},

	setHeight: function(height, setContainers) {
		var image = this.image;
        var constraints = this.constraints;
        var aspect = image.aspect;
        var newImageWidth = height * aspect;
        var newImageHeight, optimalHeight, optimalWidth, newContainerWidth;

        if(newImageWidth > constraints.maxWidth) { // too wide
            if(setContainers) {
                newContainerWidth = height * (image.data.containerWidth/image.data.containerHeight);
                image.data = {
                    type: 'maxWidth',
                    width: newContainerWidth,
                    height: newContainerWidth * 1 / aspect,
                    containerWidth: newContainerWidth,
                    containerHeight: height
                };
            } else {
                newImageWidth = constraints.maxWidth;
                newImageHeight = newImageWidth * 1 / aspect;
                error = (height - newImageHeight) / height;
                optimalHeight = height;
                optimalWidth = optimalHeight * aspect;
                image.data = {
                    type: (error < constraints.tolerance ? 'maxWidthMinor' : 'maxWidth'),
                    width: newImageWidth,
                    height: newImageHeight,
                    containerWidth: newImageWidth,
                    containerHeight: height,
                    optimalWidth: optimalWidth,
                    optimalHeight: optimalHeight
                };
            }
        } else if(newImageWidth < constraints.minWidth) { // too narrow
            error = (constraints.minWidth - newImageWidth) / constraints.minWidth;
            optimalWidth = constraints.minWidth + constraints.minWidth * error;
            optimalHeight = optimalWidth * 1 / aspect;
            image.data = {
                type: (error < constraints.tolerance ? 'minWidthMinor' : 'minWidth'),
                width: newImageWidth,
                height: height,
                containerWidth: constraints.minWidth,
                containerHeight: height,
                optimalWidth: optimalWidth,
                optimalHeight: optimalHeight
            };
        } else { // normal case
            image.data = {
                type: 'success',
                containerWidth: newImageWidth,
                containerHeight: height,
                width: newImageWidth,
                height: height
            };
        }
        return image;
	}

});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/image/mosaic/Cell.js'

// global.js: begin JavaScript file: '/js/instant/client.js'
// ================================================================================
Ss = window.Ss || {};
Ss.instant = {};
Ss.instant.client = {
	
	SIZES: {
	    mosaic: {
		    scale: 280/150,
		    name: 'display_pic_with_logo'
	    },
	    large: {
		    scale: 1,
		    name: 'thumb_large'
	    },
	    small: {
		    scale: 100/150,
		    name: 'thumb_small'
	    }
	},
	
	cb: null,
	
	get: function(params, cb) {
		params = Object.extend({
		    mt: 'all',
		    thumb_size: 'mosaic',
            ns: 'ss50', //  for ss50 50 results, 'shutterstock' for 20 results
            wrap: 'Ss.instant.client.cb',
            m: 1
		}, params || {});
		
		if(!params.kw) {
			throw 'Keyword Required';
		}
		if(!this.SIZES[params.thumb_size]) {
			throw 'invalid thumb size';
		}
		var size = this.SIZES[params['thumb_size']];
		this.cb = function(response) {
			var results = [];
			var related = [];
			var obj = {};
			if(
			   Object.isArray(response) && 
			   Object.isArray(response[1]) && 
			   Object.isArray(response[1][0]) && 
			   response[1][0][0] == ''
			){
				obj = response[1][0][1];
				results = obj['instant_results'].map(function(enc){
				    var id = enc[0];
				    var width = enc[2] * size.scale;
				    var height = enc[3] * size.scale;
				    var thumbURL = _getThumbURL(enc, size.name);
				    return {
                        photo_detail_link: '/pic-' + id + '.html',
                        id: id,
                        aspect: width/height,
                        thumb_width: width,
                        thumb_height: height,
                        display_description: "",
                        thumb_url: thumbURL
				    }
				});
				if(Object.isArray(obj['related'])) {
				    related = obj['related'].map(function(obj){
				        return Object.keys(obj).first();
				    });
				}
			}
			cb({
			    page: 1,
			    results: results,
			    searchSrcID: '',
			    num_results: obj['num_results'],
			    related: related,
                params: params
			});
		};
		var scr = document.createElement('script');
		scr.src = 'http://instantsearch.shutterstock.com/ac/' + params.kw + '?' + Object.toQueryString(params);
		$$('head')[0].insert(scr);
		function _getThumbURL (enc, size) {
			var photoFilename = function(id, filename) {
				filename = filename.replace(/\@/, id);
				filename = filename.replace(/(\d+)&/, '$1/$1');
				return filename;
			};
			var getHostFromFilename = function(filename) {
				var thumbServers = ['thumb1.shutterstock.com', 'thumb7.shutterstock.com', 'thumb9.shutterstock.com', 'thumb10.shutterstock.com' ];
				var match = filename.match(/.*(\d{1,3})/);
				var key = ( match ? parseInt(match[1]) : 0 );
				host = thumbServers[ key % thumbServers.length ];
				return host;
			};
			var filename = photoFilename(enc[0], enc[1]);
			var host = getHostFromFilename(filename);
			return 'http://' + host + '/' + size + '/' + filename + '/' + enc[0] + '.jpg';
		}
	}
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/instant/client.js'

// global.js: begin JavaScript file: '/js/pic/pic.js'
// ================================================================================
Ss = window.Ss || {};

Ss.pic = {
    
  initDownloadOptions: function() {
    var allTabs = $$('.dl_tab');
    var allTabContent = $$('.tab_content');
    var allRows = $$('.tab_content tr');
    var selectRow = function(row) {
      allRows.invoke('removeClassName', 'selected');
      row.addClassName('selected');
      row.down('input[type=radio]').checked = true;
    };
			

    allTabs.invoke('observe', 'click', function(evt) {
      var tab = this;
      var tabContentId = tab.getAttribute('data-tab-content-id');
      var tabContent =  $(tabContentId);

      var selectedRow = tabContent.select('tr').find(
        function(row) {
          return row.down('input[type=radio]').checked;
        }
      );
      allTabs.invoke('removeClassName', 'selected');
      tab.addClassName('selected'); 
      allTabContent.invoke('hide');
      tabContent.show();
      if(selectedRow) {
        selectRow(selectedRow);
      }
    });
		

    allRows.invoke('observe', 'click', function(evt){ 
      selectRow(this); 
    });
  },
	
  attachThumbEvents: function (thumbs) {
    var j, thumb;
    
    if (j = thumbs.length) {
      while (thumb = thumbs[--j]) {
        Event.observe(thumb, 'mouseover', this.previewThumb);
        Event.observe(thumb, 'mouseout', cancelPreview);
      }
    }
  },

	previewThumb: function (e, descriptionText, cellMax) {
	    
	    var targetImage = Object.isElement(e) ? e : e.target;
	    
	    legacyActiveThumb = targetImage;

	    if (!Object.isElement(legacyActiveThumb)) {
	        return;
	    }

	    setTimeout( function() {
	        if (legacyActiveThumb && legacyActiveThumb.src == targetImage.src) {

	            var container = Element.up(legacyActiveThumb, '.thumb_image_container'); // not using legacyActiveThumb.up() because it won't work in IE9
	           
	            var thumbWidth = parseInt(legacyActiveThumb.getAttribute("data-width"), 10);
	            var thumbHeight = parseInt(legacyActiveThumb.getAttribute("data-height"), 10);

	            var previewThumbSrc = legacyActiveThumb.src.replace(/\/thumb_(small|large)\//, '/display_pic_with_logo/');
	            
	            if (!previewThumbSrc.match(/https?:\/\/[^\/]+\/photos\//ig)) {
	                /* we are using seo optimized photo url, we can use image.shutterstock.com */
	                previewThumbSrc = previewThumbSrc.replace(/(https?:\/\/)([^\/]+)/,'$1' + 'image.shutterstock.com');
	            }
	            var fakeResultSlot = {
	                elements: {
	                    container: container,
	                    thumb: legacyActiveThumb
	                },
	                getDimensions: function(maxDimensionPixels) {
	                    
	                    var multiplier = maxDimensionPixels / Math.max(thumbWidth, thumbHeight);
	                    return { 
	                        width: thumbWidth * multiplier, 
	                        height: thumbHeight * multiplier
	                    };
	                },
	                result: {
	                    aspect_ratio: (thumbWidth / thumbHeight)
	                },
	                previewThumbSrc: previewThumbSrc
	            };

	            if (window.resultPreview) {
	                var lightboxContainer = document.getElementById('lightbox-contents-table');
	                var lightboxFixedAncestor = document.getElementById('lightbox-preview-container');
	                var fixedContainer = lightboxContainer && Element.extend(legacyActiveThumb).descendantOf(lightboxContainer) ? lightboxContainer: null;
	                resultPreview.populate( { resultSlot: fakeResultSlot, fixedContainer: fixedContainer, fixedAncestor: lightboxFixedAncestor, descriptionText: descriptionText, cellMax: cellMax } );
	                resultPreview.show();
	            }
	        }
	    }, 150);
	},
	
	subscribe: function(){



	}
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/pic/pic.js'

// global.js: begin JavaScript file: '/js/pic/inline.js'
// ================================================================================
Ss = window.Ss || {};
Ss.pic = Ss.pic || {};
Ss.pic.inline = {
    IS_MASON: true
};
Ss.pic.inline.client = {
	getBrowsePath: function(parameters, callback) {
		parameters.component_path = '/pic/inline/browse_path.mh';
		this.execute(parameters, callback);
	},
	getMetadata: function(parameters, callback) {
		parameters.component_path = '/pic/inline/metadata.mh';
		this.execute(parameters, callback);
	},
	execute: function(parameters, callback) {
		if(!parameters || !parameters.id || !parameters.component_path || !Object.isFunction(callback)) {
			throw 'photo id, component_path parameter and callback required';
		}
		if(Ss.page && Ss.page.language) {
		    parameters.language = Ss.page.language;
		}
		var transport = new Ajax.Request('/show_component.mhtml', {
			method: 'GET',
			parameters: parameters,
			evalScripts: true,
			onSuccess: function(response) {
				callback({ 
					parameters: parameters,
					responseText: response.responseText
				});
			},
			onFailure: function() {
				window.location = '/pic-' + parameters.id + '.html';
			}
		});
		return transport;
	}
};
Ss.pic.inline.history = {
	initialize: function() {
		var params = Ss.location.getQueryParams();

		if(params.inline) {
		    (function() {
                Ss.pic.inline.ui.animate.off();
                Ss.pic.inline.ui.write({ 
                    id: params.inline,
                    noAnimation: true
                });
			}).defer();
		}
	},
	replaceState: function(id) {
		if(!Ss.search.history.APISupported()) {
				return;
		}
		var params = Ss.location.getQueryParams();
		if(!params.page) {
				params.page = Ss.search.getCurrentPage();
		}
		if(id) {
				params.inline = id;
		} else if(params.inline) {
				delete params.inline;
		}
		var url = '?' + Object.toQueryString(params);

		url = url.replace(/%2B|\+/g, '%20');
		window.history.replaceState(history.state, '', url);
	}
};
Ss.pic.inline.ui = {
	container: null,
	lastImageId: null,
	animationTime: 0.35,
	scrollTime: 200,
	spacerHeightDifference: 95,
	minRowPx: 30,
	loaded: {},
	initialize: function() {
	    this.container = $('inline_pic_container');
	    this.elements = {
            spacer: $('inline_spacer'),
            content: {
                container: $('inline_pic_content'),
                imageContainer: $('inline_image_container'),
                image: $('inline_image'),
                metadata: $('image_metadata_and_download'),
                imageLink: $('inline_image_link')
            },
            paths: $('inline_pic_paths'),
            arrow: $('inline_pic_arrow'),
            close: $('inline_pic_close'),
            spacerReference: null
        };
		this._events();
		this._interceptClicks();
	},
	

	animate: {
		on: function() {
			document.body.removeClassName('inline_pic_noanimate');
		},
		off: function() {
			document.body.addClassName('inline_pic_noanimate');
		}
	},


	setImage: function(cell, callback) {
		var annotationHeight = 20;
		var self = this;
		var anchor = cell.down('a');
		var img = cell.down('img');
		var src = img.getAttribute('src').replace('thumb_small', 'display_pic_with_logo');
		var image = new Image();
		
        this.elements.content.imageLink.href = '/subscribe?clicksrc=inline_thumb';
        if(Ss.user.hasPaidAccount) {
            this.elements.content.imageLink.href = anchor.href;
        }
		image.onload = function() {
            self.setHeights(image.height);
            self.elements.content.image.setAttribute('src', src);
            self.elements.content.imageContainer.setStyle({
                height: image.height - annotationHeight + 'px'
            });
            if(typeof callback === 'function') {
                callback({
                    height: image.height
                });
            }
		};
		image.src = src;
	},


	hide: function(spacer) {
		if(spacer !== null && this.elements.spacerReference !== null) {
			var currentReference = spacer || this.elements.spacerReference;

			currentReference.setStyle({
				height: null
			});
			currentReference.removeClassName('in');
			this.container.removeClassName('active');

			(function() {
				if(currentReference && currentReference.parentNode) {
					currentReference.remove();
				}
			}).delay(this.animationTime);
		}
	},


	close: function() {
		this.hide();
		this.clearActive();
		document.body.removeClassName('inline_pic_visible');
		Ss.pic.inline.history.replaceState();
	},

	spacerIsFullyVisible: function() {
	    var spacer = this.elements.spacerReference;
	    var sVpo;
	    var sDim;
	    var vpDim;
	    
	    if(!spacer) {
	        return false;
	    }
	    
	    sVpo = spacer.viewportOffset();
	    sDim = spacer.getDimensions();
	    vpDim = document.viewport.getDimensions();
	    
	    return (
	        sVpo.top > 0 &&
	        sVpo.top + sDim.height < vpDim.height
	    );
	},


	next: function() {
		var cell = this._currentCell();
		if(cell) {
			var nextCell = cell.next('.mosaic_cell');
			if(nextCell) {
				this.write({
					srcCell: nextCell,
                    matchViewportOffset: this.spacerIsFullyVisible(),
                    noAnimation: true
				});
			}
		}
	},


	previous: function() {
		var cell = this._currentCell();
		if(cell) {
			var previousCell = cell.previous('.mosaic_cell');
			if(previousCell) {
				this.write({
					srcCell: previousCell,
					matchViewportOffset: this.spacerIsFullyVisible(),
					noAnimation: true
				});
			}
		}
	},


	isOpen: function() {
		return document.body.hasClassName('inline_pic_visible');
	},


	setHeights: function(height) {
		var heights = this.calcHeights(height);

		this.container.setStyle({
			height: heights.containerHeight + 'px'
		});

		this.elements.spacerReference.setStyle({
			height: heights.spacerHeight + 'px'
		});
	},


	calcHeights: function(imageHeight) {
		var maxImageHeight = 470;
		var maxContainerHeight = 615;
		var minHeight = 336;
		var height = imageHeight > minHeight ? imageHeight : minHeight;

		height = maxContainerHeight - (maxImageHeight - height);

		return {
			containerHeight: height,
			spacerHeight: height + this.spacerHeightDifference
		};
	},


	currentId: function() {
		return this.lastImageId;
	},


	write: function(args) {
		var srcCell = args.srcCell || $$('.mosaic_cell[data-id=' + args.id + ']')[0];
		if(!srcCell) {
			throw 'valid id (image id) or srcCell (Element of class .mosaic_cell) required';
		}
		var imageId = this.lastImageId = args.id || srcCell.getAttribute('data-id');
		var lastCellOnRow = Ss.image.mosaic.getLastCellOnRow(srcCell);
		var spacerHeight = null;
        var callback = Prototype.emptyFunction;
        var ui = Ss.pic.inline.ui;
        var oldSpacer = this.elements.spacerReference;
        var spacer = this._getNewSpacer(srcCell);
        var spacerIsCrossingRows = spacer != oldSpacer;
        
		this.setActive(srcCell);
		this.positionArrow(srcCell);


		if(spacerIsCrossingRows) {
			callback = function(data) {

				newSpacerHeight = ui.calcHeights(data.height).spacerHeight;
				

                ui.scrollIntoView({
                    cell: srcCell, 
                    prevSpacer: oldSpacer, 
                    nextSpacer: spacer, 
                    calculatedHeight: newSpacerHeight, 
                    matchViewportOffset: args.matchViewportOffset, 
                    noAnimation: args.noAnimation
                });
                

				ui.hide(oldSpacer);
				spacer.addClassName('in');
			};
		} else if (args.matchViewportOffset) {
		    callback = function(data) {
                ui.scrollIntoView({
                    cell: srcCell, 
                    prevSpacer: null, 
                    nextSpacer: ui.elements.spacerReference, 
                    calculatedHeight: null, 
                    matchViewportOffset: true,
                    noAnimation: args.noAnimation
                });
		    };
		} else {
		    callback = function(data) {

				newSpacerHeight = ui.calcHeights(data.height).spacerHeight;
				
		        ui.scrollIntoView({
                    cell: srcCell, 
                    prevSpacer: null, 
                    nextSpacer: ui.elements.spacerReference, 
                    calculatedHeight: newSpacerHeight, 
                    matchViewportOffset: false,
                    noAnimation: args.noAnimation
		        });
		    }
		}
        this.setImage(srcCell, callback);
        this._writeMetadata(imageId, srcCell);
        this._writeSimilar(imageId, srcCell);
		document.body.addClassName('inline_pic_visible');
		Ss.pic.inline.history.replaceState(imageId);
	},
	selectSimilar: function(similarThumb) {
	    var ui = this;
        var activeGridCell = $$('#grid_cells .inline_active')[0];
        

	    $$('#inline_pic_paths .thumb_image_container').invoke('removeClassName', 'active');
        

        similarThumb.addClassName('active');
        

        this.container.addClassName('loading');
        this.setImage(similarThumb, function(data){

            newSpacerHeight = ui.calcHeights(data.height).spacerHeight;
            
            ui.scrollIntoView({
                cell: activeGridCell, 
                prevSpacer: null, 
                nextSpacer: ui.elements.spacerReference, 
                calculatedHeight: newSpacerHeight, 
                matchViewportOffset: false
            });
        });
        

        this._writeMetadata(similarThumb.getAttribute('data-id'), similarThumb);
        
        if(activeGridCell) {
            activeGridCell.addClassName('similar_selected');
        }
	},
	_writeSimilar: function(id, srcCell) {
		var loaded = this.loaded[id];
		var params = { id: id };
		if(srcCell) {
			Object.extend(params, this.getParams(srcCell));
		}
		if(!loaded) {
			this.elements.content.container.addClassName('loading');
		}
        this.elements.paths.removeClassName('active');
        Ss.pic.inline.client.getBrowsePath(params, function(response) {
            if(Ss.pic.inline.ui.currentId() === id) {
                Ss.pic.inline.ui.elements.content.container.removeClassName('loading');
                Ss.pic.inline.ui.elements.paths.addClassName('active');
                Ss.pic.inline.ui.elements.paths.update(response.responseText);
                Ss.pic.inline.ui.loadPathImages();
            }
        });
		this.elements.content.container.addClassName('active');
	},
	_writeMetadata: function(id, srcCell) {
		var loaded = this.loaded[id];
		var params = { id: id };
		if(srcCell) {
			Object.extend(params, this.getParams(srcCell));
		}
		if(!loaded) {
			this.elements.content.container.addClassName('loading');
		}

		Ss.pic.inline.client.getMetadata(params, function(response) {
			if(!loaded) {
				Ss.pic.inline.ui.elements.content.container.removeClassName('loading');
			}

			Ss.pic.inline.ui.elements.content.metadata.update(response.responseText);
			Ss.pic.inline.ui.loaded[params.id || Ss.pic.inline.ui.currentId()] = true;
			Ss.pic.inline.ui.container.removeClassName('loading');
			Ss.pic.inline.ui.setRasterTooltipPosition();
		});

		this.elements.content.container.addClassName('active');
	},



	positionArrow: function(cell) {
		var cellLeft = cell.getBoundingClientRect().left;
		var cellWidth = cell.getWidth();
		var containerOffset = this.container.getBoundingClientRect().left;
		var arrowWidth = 17;

		this.elements.arrow.setStyle({
			left: (cellLeft - containerOffset) + (cellWidth / 2) - arrowWidth + 'px'
		});
	},


	setActive: function(cell) {
		this.clearActive();
		cell.addClassName('inline_active');
		cell.addClassName('no_preview');
	},


	clearActive: function() {
		var previousActive = $$('.inline_active')[0];

		if(previousActive) {
			previousActive.removeClassName('inline_active');
			previousActive.removeClassName('no_preview');
			previousActive.removeClassName('similar_selected');
		}
	},
	scrollIntoView: function(args) {





	    
	    var cell = args.cell;
	    var prevSpacer = args.prevSpacer;
	    var nextSpacer = args.nextSpacer;
	    var calculatedHeight = args.calculatedHeight;
	    var matchViewportOffset = args.matchViewportOffset;
	    var noAnimation = args.noAnimation;
        var data = {
            viewport: document.viewport.getDimensions(),
            row: this.minRowPx,
            margin: 6,
            cell: {
                height: cell.getHeight(),
                viewportOffset: cell.viewportOffset().top,
                cumulativeOffset: cell.viewportOffset().top
            },
            nextSpacer: {
                height: calculatedHeight,
                viewportOffset: nextSpacer.viewportOffset().top,
                cumulativeOffset: nextSpacer.cumulativeOffset().top
            }
        };
        var prevSpacerHeight;
        if(prevSpacer) {
            prevSpacerHeight = prevSpacer.getHeight();
            if(prevSpacerHeight) {
                data.prevSpacer = {
                    height: prevSpacerHeight,
                    viewportOffset: prevSpacer.viewportOffset().top,
                    cumulativeOffset: prevSpacer.cumulativeOffset().top
                };
            }
        }
        var viewportIsTooSmall = data.row + data.nextSpacer.height > data.viewport.height;
        var prevIsAboveNext = !!(data.prevSpacer && data.prevSpacer.viewportOffset < data.nextSpacer.viewportOffset);
		var nextLandsBelowFold = (data.nextSpacer.viewportOffset + data.nextSpacer.height >= data.viewport.height);
		var scrollBy;
		var offset;
		var prevSpacerOffset;
		
        if(viewportIsTooSmall) {
			offset = prevIsAboveNext ? data.row + data.prevSpacer.height : data.row;
			nextSpacer.scrollTo();
			window.scrollBy(0, -1 * offset);
		}
		else if(matchViewportOffset && prevSpacer) {
		    prevSpacer.hide();
		    
		    if(prevIsAboveNext) {
                window.scrollBy(0, data.cell.height + data.margin);
            } else {



                prevSpacerOffset = data.prevSpacer.viewportOffset - data.nextSpacer.height
                nextSpacer.scrollTo();
                window.scrollBy(0, -1 * prevSpacerOffset);
            }
		}
        else if(prevIsAboveNext) {

            if(data.nextSpacer.viewportOffset + data.nextSpacer.height <= data.viewport.height) {
                prevSpacer.hide();
                nextSpacer.scrollTo();
                window.scrollBy(0, -data.nextSpacer.viewportOffset);
            } else {

                scrollBy = data.nextSpacer.viewportOffset + data.nextSpacer.height - data.viewport.height - data.prevSpacer.height + data.row;
                window.scrollBy(0, scrollBy);
            }
		}
		else if(nextLandsBelowFold) {
            scrollBy = data.nextSpacer.viewportOffset + data.nextSpacer.height - data.viewport.height + data.row;
            if(noAnimation) {
                window.scrollBy(0, scrollBy);
            } else {
                window.animateScrollByY(scrollBy);
            }
		}
		else if(!matchViewportOffset) {

		    var spacerEnd = data.nextSpacer.viewportOffset + data.nextSpacer.height;
		    
            if(data.nextSpacer.viewportOffset < this.minRowPx) {
                scrollBy = -1 * (this.minRowPx - data.nextSpacer.viewportOffset);
                if(noAnimation) {
                    window.scrollBy(0, scrollBy);    
                } else {
                    window.animateScrollByY(scrollBy);
                }
            } else if(spacerEnd > data.viewport.height) {
                scrollBy = spacerEnd - data.viewport.height;
                if(noAnimation) {
                    window.scrollBy(0, scrollBy);
                } else {
                    window.animateScrollByY(scrollBy);
                }
            }
		}
	},
	getParams: function(srcCell) {
		if(!srcCell) {
				srcCell = $$('.mosaic_cell[data-id=' + this.lastImageId + ']')[0];
		}

		var anchor = srcCell.down('a');
		var params = {};
		params.mediaType = srcCell.getAttribute('data-media-type');
		var matches;

		if(anchor && anchor.href) {
			matches = anchor.href.match(/pic-(\d+)/);
			if(matches && matches[1]) {
				params.id = matches[1];
			}
			if(anchor.href.include('?')) {
				Object.extend(params, anchor.href.toQueryParams());
			}
		}
		return params;
	},


	loadPathImages: function() {
		var images = $$('.browse-path.active img');

		if(images) {
			images.each(function(image) {
				var loader = new Image();

				loader.onload = function() {
					image.addClassName('active');
				};

				loader.src = image.getAttribute('src');
			});
		}
	},

	setRasterTooltipPosition: function() {
		var rasterVectorBubble = $$('.vector-jpeg-option .tooltip-bubble');

		if(rasterVectorBubble.length) {
			var viewport = document.viewport.getDimensions();
			var width = viewport.width;

			if(width >= 1400) {
				rasterVectorBubble[0].className = 'tooltip-bubble bubble-right';
			} else {
				rasterVectorBubble[0].className = 'tooltip-bubble bubble-left';
			}
		};
	},

	_events: function() {
		var container = this.container;
		
		document.observe('keyup', function(e) {
			if(Ss.pic.inline.ui.isOpen()) {

				var tooltip = $('usage_rights_help_2');
				if(tooltip && Ss.HelpText.isActive(tooltip)) {
					Ss.HelpText.hideText(tooltip);
				}


				if(Event.KEY_ESC == e.keyCode) {
					Ss.pic.inline.ui.close();
				}

				if(document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "SELECT") {

					if(Event.KEY_LEFT == e.keyCode) {
						Ss.pic.inline.ui.animate.off();
						Ss.pic.inline.ui.previous();
					}


					if(Event.KEY_RIGHT == e.keyCode) {
						Ss.pic.inline.ui.animate.off();
						Ss.pic.inline.ui.next();
					}
				}
			}
		});
		container.observe('click', function (e) {
			var tab = Event.findElement(e, '#inline_pic_paths .browse-path-tab');
			var close = Event.findElement(e, '#inline_pic_close');
			var pathId;
			var path;
			var params;
			var srcCell;
			if(tab) {

				pathId = tab.getAttribute('data-path-id');
				path = $(pathId);


				container.select('.browse-path, .browse-path-tab').invoke('removeClassName', 'active');


				container.select('.no-results').invoke('remove');


				tab.addClassName('active');

				if(path) {
					path.addClassName('active');
				} else {
					params = Object.extend({ path_id: pathId }, Ss.pic.inline.ui.getParams());

					Ss.pic.inline.client.getBrowsePath(params, function(response) {
						if($$('.browse-path-tab.active').first().getAttribute('data-path-id') === pathId) {
							Ss.pic.inline.ui.elements.paths.insert(response.responseText);
							Ss.pic.inline.ui.loadPathImages();
						}
					});
				}
			}
			if(close) {
				Ss.pic.inline.ui.close();
			}
		});
		
		var _tid;
		Element.observe(document.body, "window:resizeEnd", function() {
			var spacer = $$('.inline_spacer')[0];
			if(spacer) {
				Ss.pic.inline.ui._placeSpacer(spacer);
			}

			Ss.pic.inline.ui.setRasterTooltipPosition();
		});
	},
	_currentCell:  function() {
	    var currentId = this.currentId();
	    if(currentId) {
	        return this._getCellById(currentId);
	    }
	    return null;
	},
	_getCellById: function(id) {
	    return $$('.mosaic_cell[data-id=' + id + ']').first();
	},
	_placeSpacer: function(spacer) {
	    spacer.remove();
	    var srcCell = this._currentCell();
	    var lastCell = Ss.image.mosaic.getLastCellOnRow(srcCell);
	    this.positionArrow(srcCell);
	    lastCell.insert({ after: spacer });
	},
	_getNewSpacer: function(srcCell) {
	    var lastCellOnRow = Ss.image.mosaic.getLastCellOnRow(srcCell);
	    var spacer;

		if(lastCellOnRow && (!lastCellOnRow.next() || !lastCellOnRow.next().hasClassName('inline_spacer'))) {
			spacer = this.elements.spacer.cloneNode();
			lastCellOnRow.insert({
				after: spacer
			});
			spacer.insert({
				top: this.container
			});
			this.elements.spacerReference = spacer;
		} else {
		    spacer = this.elements.spacerReference;
		}
		return spacer
	},
	_interceptClicks: function() {


		var container = $('cat_container');
		var _middleClick = false;
		var isMiddleClick = function(evt) {
				return (_middleClick || evt.metaKey || evt.shiftKey || evt.altKey || evt.ctrlKey);
		};
		container.observe('mousedown', function(evt) {
				_middleClick = evt.isMiddleClick() || evt.which == 2;
		});
		container.delegateClick('.mosaic_cell .gc_btns, #inline_pic_container img, .mosaic_cell > a', function(evt) {
			var imageId;
			var srcCell;
			if(isMiddleClick(evt)) {
				return;
			}
			srcCell = Event.findElement(evt, '.mosaic_cell');
			picThumb = Event.findElement(evt, '#inline_pic_paths .thumb_image_container');
			if(!srcCell && !picThumb) {
				return;
			}
			if(srcCell && srcCell.hasClassName('inline_active') && !srcCell.hasClassName('similar_selected')) {
			    Ss.pic.inline.ui.close();
			    srcCell.removeClassName('inline_active');
			    evt.preventDefault();
			    return;
			}
			if(srcCell) {
				Ss.pic.inline.ui.animate.on();
				Ss.pic.inline.ui.write({
					srcCell: srcCell,
					id: srcCell.getAttribute('data-id')
				});
			}
			if(picThumb) {
                Ss.pic.inline.ui.selectSimilar(picThumb);
			}
			cancelPreview();
			evt.stop();
		});
	}
};
if(Ss.Browser.isIE()) {
    document.observe('mosaic:beforeUpdate', function(evt) {
        var ui = Ss.pic.inline.ui;
        if(ui.elements.spacerReference) {
            ui.elements.spacerReference.remove();
        }
    });
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/pic/inline.js'

// global.js: begin JavaScript file: '/js/feedback/FeedbackForm.js'
// ================================================================================
Ss.FeedbackForm = Class.create({
		initialize: function(container) {
			
			if(!Object.isElement(container)) {
				throw 'form container required.';
			}
			
			this.elements = {
				container: container,
				form: container.down('form'),
				textarea: container.down('textarea'),
				label: container.down('label.placeholder'),
				placeholder_span: container.down('span.placeholder_span'),
				placeholderText: null
			};
			
			if(!Object.isElement(this.elements.form)) {
				throw 'form required.';
			}
			
			this._events();
			

			Ss.FlyoutLayer.write(container);
		},
		
		enable: function() {
			this.elements.container.removeClassName('feedback_form_disabled');
			/* IE9 didn't like the select using a comma for both so I've seperated it out -fcrow */
			this.elements.container.select('textarea').invoke('enable');
			this.elements.container.select('input[type=radio]').invoke('enable');
		},
		
		disable: function() {
			this.elements.container.addClassName('feedback_form_disabled');
			/* IE9 didn't like the select using a comma for both so I've seperated it out -fcrow */
			this.elements.container.select('textarea').invoke('disable');
			this.elements.container.select('input[type=radio]').invoke('disable');
		},
		
		isDisabled: function() {
			return this.elements.container.hasClassName('feedback_form_disabled');
		},
		
		showThanks: function() {
			this.elements.container.down('.feedback_thanks').show();
		},
		
		hideThanks: function() {
			this.elements.container.down('.feedback_thanks').hide();
		},
		
		clear: function() {
			this.elements.textarea.clear();
			this.elements.textarea.setAttribute('placeholder', '');
			this.elements.container.select('input[type=radio]').each( function(radio) { radio.checked = false; } );
		},
		
		reset: function() {
			this.hideThanks();
			this.clear();
			this.enable();
		},
		
		_events: function() {
			var feedbackForm = this,
				form = this.elements.form,
				textarea = this.elements.textarea;
			
			var reset = function(evt) {
				if(evt && evt.type == 'close') {
					feedbackForm.reset();
					Ss.FlyoutLayer.unsubscribeObserver(reset);
				}
			};
			
			form.observe('submit', function(evt) {





					if(evt.preventDefault) {
						evt.preventDefault();
					} 
					if(evt.returnValue) {
						evt.returnValue = false;
					} 
					if(window.event) {
						window.event.returnValue = false;
					}
					
					if(feedbackForm.isDisabled()) {
						return;
					}
					
					form.request({ method: 'POST' });
					



					feedbackForm.showThanks();
					

					Ss.FlyoutLayer.subscribeObserver(reset);
					

					feedbackForm.disable();
					

					(function(){
						if(Ss.FlyoutLayer.isOpen()) {
							Ss.FlyoutLayer.close();
						}
					}).delay(3);
			});
			
			form.select('input[type=radio]').invoke('observe', 'click', function(evt) {
				var value = $F(this), 
					placeholderInput = $$('input[name=default_' + value + ']')[0], 
					placeholderText = '';

				if (placeholderInput) {
					placeholderText = $F(placeholderInput);
				}
				
				form.select('label.placeholder span.placeholder_span')[0].update(placeholderText);
				
				if(!feedbackForm.placeholderText){
					feedbackForm.placeholderText = new Ss.input.InFieldLabel({
						   label: form.select('label.placeholder span.placeholder_span')[0],
						   field: form.select('textarea')[0]
					});
				}   
			});
	}
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/feedback/FeedbackForm.js'

// global.js: begin JavaScript file: '/js/Autocompleter.js'
// ================================================================================
/*
    script.aculo.us controls.js v1.9.0, Thu Dec 23 16:54:48 -0500 2010
    
    Copyright (c) 2005-2010 Thomas Fuchs (http:script.aculo.us, http:mir.aculo.us)
           (c) 2005-2010 Ivan Krstic (http:blogs.law.harvard.edu/ivan)
           (c) 2005-2010 Jon Tirsen (http:www.tirsen.com)
    Contributors:
        Richard Livsey
        Rahul Bhargava
        Rob Wills
    
    script.aculo.us is freely distributable under the terms of an MIT-style license.
    For details, see the script.aculo.us web site: http:script.aculo.us/
    
    Autocompleter.Base handles all the autocompletion functionality
    that's independent of the data source for autocompletion. This
    includes drawing the autocompletion menu, observing keyboard
    and mouse events, and similar.
    
    Specific autocompleters need to provide, at the very least,
    a getUpdatedChoices function that will be invoked every time
    the text inside the monitored textbox changes. This method
    should get the text for which to provide autocompletion by
    invoking this.getValue()
    Specific auto-completion logic (AJAX, etc) belongs in getUpdatedChoices.
    
    Removed Features: Tokenization support, Ajax support (esmiling)
    
    Add extra key codes
*/

Object.extend(Event, {
  KEY_SHIFT:    16,
  KEY_CTRL:     17,
  KEY_ALT:      18,
  KEY_CMD:      91
});

var Autocompleter = { };

if (window.newAutocomplete === undefined) {
	window.newAutocomplete = 0; 
}

Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    this.noChangeKeys = [
      Event.KEY_TAB,
      Event.KEY_RETURN,
      Event.KEY_ESC,
      Event.KEY_LEFT,
      Event.KEY_UP,
      Event.KEY_RIGHT,
      Event.KEY_DOWN,
      Event.KEY_PAGEUP,
      Event.KEY_HOME,
      Event.KEY_END,
      Event.KEY_PAGEDOWN,
      Event.KEY_INSERT,
      Event.KEY_ALT,
      Event.KEY_CTRL,
      Event.KEY_SHIFT,
      Event.KEY_CMD
    ];

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.frequency    = 0;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!$(update).style.position || $(update).style.position=='absolute') {
          $(update).style.position = 'absolute';
          Position.clone(element, $(update), {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        $(update).show();
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ update.hide() };

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(window, 'resize', function(){
	if(this.oldElementValue != '' && this.hasFocus == true){
		this.options.onShow(element, update);
	}
    }.bind(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  fireKeydown: function(event) {
    this.element.focus();
    if(this.element.value.strip()) {
        this.element.value += ' ';
    }
    this.onKeyPress.bind(this).defer(event);
  },
  
  onKeyPress: function(event) {
    if(this.active) {
      this.changed = true;
      switch(event.keyCode) {
       case Event.KEY_RETURN:
         this.selectEntry();
         this.hide();
         return;
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_TAB:
         this.onTab(event);
         Event.stop(event);
         return;
      }
    } else {
      try{
          if(this.noChangeKeys.member(event.keyCode) ||
            (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) {
            return;
          } else {
            this.changed = true;
          }
      } catch(e) {
      }
    }
    this.hasFocus = true;
    if(this.observer) { clearTimeout(this.observer); }
    this.observer =
      setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onTab: function(event) {
      var index = Math.max(this.index, 0);
      var entry = this.getEntry(index);
      this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },
  
  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {

    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) {
        this.index--;
    } else {
        this.index = this.entryCount-1;
    }
    var entry = this.getEntry(this.index);
    entry.scrollIntoView(false);
    this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },

  markNext: function() {
    if(this.index < this.entryCount-1) {
        this.index++;
    } else {
        this.index = 0;
    }
    var entry = this.getEntry(this.index);
    entry.scrollIntoView(false);
    this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
  },

  getEntry: function(index) {
    if(index < 0) {
      return;
    }
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    var currentEntry = this.getCurrentEntry();
    this.active = false;
    if (currentEntry !== undefined) {
      this.updateElement(currentEntry);
      currentEntry.fire('Autocompleter:selectEntry');
    }
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');
    this.element.value = value;
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement) {
      this.options.afterUpdateElement(this.element, selectedElement);
    }
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = -1;
      this.render();
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },


  onObserverEvent: function() {
    this.changed = false;
    if(this.getValue().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getValue: function() {
    return this.element.value.strip();
  }

});


/*
    This is the Shutterstock-specific/Local Autocompleter. It extends the base.
    
    The constructor takes four parameters. The first two are, as usual,
    the textbox, and the autocompletion menu.
    The third is the array you want to autocomplete from, and the fourth
    is the options block.
*/

Autocompleter.Local = Class.create(Autocompleter.Base, {
    initialize: function(element, update, options) {
	
		if (window.newAutocomplete) {
			this.url = "http://www.shutterstock.com/webstack/autocomplete/shutterstock/image";
		} else {
			this.url = "http://autocomplete.shutterstock.com/ac?version=fuzzy";
		}
		
        this.element = element;
        this.currentValue = this.getValue();
        this.choices = [];
        this.headNode = $$("head")[0];
        this.baseInitialize(element, update, options);
		Ss.suggest.sdp = "/webstack/sdp/photo_autocomplete";
    },

    setOptions: function(options) {
        var instance = this;
        this.options = Object.extend({
            language: options.language || 'en',
            formatChoices: function() {
                var beginMatches = [];
                var insideMatches = [];
                var entry = instance.getValue();
                var choices = instance.choices;
                var maxChoices = 10;
                for (var i = 0; i < choices.length && beginMatches.length < maxChoices; i++) {
					var choice = choices[i];
					if (window.newAutocomplete) {
						choice = choice.pattern;
					}
					var foundPos = choice.toLowerCase().indexOf(entry.toLowerCase());
					if (foundPos == -1) { 
						beginMatches.push('<li><strong>' + choice + '</strong></li>');
					}
					else if (foundPos == 0 && choice.length != entry.length) {
						beginMatches.push("<li>" + choice.substr(0, entry.length) + "<strong>" + choice.substr(entry.length) + "</strong></li>");
					}
                }
                if (insideMatches.length) {
                    beginMatches = beginMatches.concat(insideMatches.slice(0, maxChoices - beginMatches.length));
                }
                return "<ul>" + beginMatches.join('') + "</ul>";
            }
        }, options || { });
    },
    

    processChoices: function (choices) {
		this.choices = [];
		if (window.newAutocomplete) {
			if (choices.autocompletions!== undefined) {
				this.choices = choices.autocompletions;
			}
		} else {
			if (choices[0].toLowerCase() !== this.currentValue.toLowerCase()) {
				return;
			}

			if (choices[1]) {
				this.choices = choices[1].findAll(function(s) {
					return s.length;
				}).invoke('first');
			}
		}
		this.updateChoices(this.options.formatChoices());
    },

    selectEntry: function() {
      var currentEntry = this.getCurrentEntry();
      var userInput;
      this.active = false;
      if (currentEntry !== undefined) {
        userInput = this.currentValue.strip();
        this.updateElement(currentEntry);
        currentEntry.fire('Autocompleter:selectEntry', {inputValue: userInput, value: this.element.value, index: this.index});
      }
      window.Ss.tracker.logEvent('click', { element_id: "autocomplete_suggestion_selected", input_value: this.element.value });
    },

    getUpdatedChoices: function() {

        var script = document.createElement('script');
        var base = this.url.split('?')[0];
		var params = this.url.toQueryParams();
        var url;
        var value = this.element.value;
		var client_page = (function () {
			var location = window.location.pathname;
			if (location === '/cat.mhtml') {return 'image-mason-search'}
			if (location === '/index-in.mhtml') {return 'image-mason-lihp'}
			return 'image-mason-unknown'
		})();
		if (window.newAutocomplete) {
			base = this.url;
			params = {};
		}
        Object.extend(params, {
            'q': value,
            'language': this.options.language,
			'maxresults': 10,
			'client_id': client_page		
        });
        url = base + '?' + Object.toQueryString(params);
        script.type = 'text/javascript';
        script.src = url;
        this.currentValue = value;
        this.headNode.appendChild(script);
    },

    onObserverEvent: function() {
      this.changed = false;
      if(this.getValue().length>=this.options.minChars) {
        this.getUpdatedChoices();
        this.element.fire('Autocompleter:queryChanged', {inputValue: this.getValue()});
      } else {
        this.active = false;
        this.hide();
      }
      this.oldElementValue = this.element.value;
    },

    setIndex: function (direction) {
      if (direction === 'previous') {
        if(this.index > 0) {
            this.index--;
        } else {
            this.index = this.entryCount-1;
        }
      } else if (direction === 'next') {
        if(this.index < this.entryCount-1) {
            this.index++;
        } else {
            this.index = 0;
        }
      }
    },

    markItem: function (direction) {
      var entry;
      this.setIndex(direction);
      entry = this.getEntry(this.index);
      entry.scrollIntoView(false);
      this.element.value = Element.collectTextNodesIgnoreClass(entry, 'informal');
      entry.fire('Autocompleter:cursorMoved', {value: this.element.value, index: this.index});
    },

    markPrevious: function() {
      this.markItem('previous');
    },

    markNext: function() {
      this.markItem('next');
    }
	
});
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Autocompleter.js'

// global.js: begin JavaScript file: '/js/suggest.js'
// ================================================================================
Ss = window.Ss || {};




Ss.suggest = {
    
    instances: [],


    autocompleteData: {
        customer_id: Ss.user.customerId,
        autocomplete_details: []
    },

    create: function(args) {
        var isNewData;
        if(!Object.isElement(args.input) || !Object.isElement(args.layer)) {
            throw 'input[Element] and layer[Element] options are required';
        }
        var form = args.input.up('form');
        var autocompleter = new Autocompleter.Local(args.input, args.layer, { language: this.autocompleteLanguage(args.language) });
        this.instances.push(autocompleter);

        var autocompleteStack = {
            queryChanged: undefined,
            cursorMoved: undefined
        };

        function setAutocompleteId () {

            Ss.suggest.autocompleteData.autocomplete_id = Date.now().toString(36) + Math.floor(Math.random() * 1e8).toString(36) + Math.floor(Math.random() * 1e8).toString(36);


            $$("[name=autocomplete_id]")[0].value = Ss.suggest.autocompleteData.autocomplete_id;
        }


        function compareStrings (previousData, newData) {
            var isDifferent;


            if (previousData) {
                isDifferent = (previousData !== newData) ? true : false;
            } else {
                isDifferent = true;
            }

            return isDifferent;
        }

        isNewData = (function () {
            var submittedData;

            return function () {
                var currentData = Ss.suggest.autocompleteData.autocomplete_details.toJSON();
                var isNew = compareStrings(submittedData, currentData);

                submittedData = currentData;

                return isNew;
            };
        }());

        function sanitizeString (str) {
            return (typeof str === "string") ? str.strip() : "";
        }


        function pushToData (userInput, selection, position) {
            var previousData
            var currentData;
            var isNew;
            var detailsArray;

            userInput = sanitizeString(userInput);
            selection = sanitizeString(selection);


            if (userInput !== selection) {
                currentData = {
                    input: userInput,
                    selection: selection,
                    position: position + 1 // 0 index Array vals are passed in
                }

                detailsArray = Ss.suggest.autocompleteData.autocomplete_details;


                if (detailsArray.length) {
                    previousData = detailsArray[detailsArray.length - 1];
                    isNew = compareStrings(Object.toJSON(previousData), Object.toJSON(currentData));


                    if (!isNew) {
                        return;
                    }
                }


                Ss.suggest.autocompleteData.autocomplete_details.push(currentData);
            }
        }

        function handleAutocompleteChange (evt) {
            var eventType = evt.eventName;
            var suggestionObject = evt.memo;


            if (eventType === "Autocompleter:queryChanged") {

                if (autocompleteStack.cursorMoved) {
                    pushToData(autocompleteStack.queryChanged, autocompleteStack.cursorMoved.value, autocompleteStack.cursorMoved.index);
                }


                autocompleteStack.queryChanged = suggestionObject.inputValue;


                autocompleteStack.cursorMoved = undefined;


            } else if (eventType === "Autocompleter:cursorMoved") {

                autocompleteStack.cursorMoved = suggestionObject;
            }
        }

        function handleSearchSubmit (evt) {
            var form = this;



            if (Ss.lilBro && Ss.suggest.autocompleteData.autocomplete_details.length) {

                evt.preventDefault();

                if (LilBro.Module && LilBro.Module.Autocomplete) {


                    if (isNewData()) {

                        setAutocompleteId();


						new LilBro.Module.Autocomplete().track(Ss.suggest.autocompleteData);
						
						var autocomplete_details = Ss.suggest.autocompleteData.autocomplete_details;
						var completed_terms = [];
						var dropdown_positions = [];
						var typed_terms = [];
						var test_cell = {
							autocompletenew: "control"
						};
						
						if (window.newAutocomplete) {
							test_cell.autocompletenew = "test";
						}
						
						for ( var i = 0; i < autocomplete_details.length; i++ ) {
							completed_terms.push(autocomplete_details[i].selection);
							dropdown_positions.push(autocomplete_details[i].position);
							typed_terms.push(autocomplete_details[i].input);
						}
						

						var sdpData = {
							business_unit: 'shutterstock',
							event_id: '',
							session_id: '',
							client_type: '',
							completed_terms: completed_terms,
							country: Ss.user.countryFromIp,
							customer_id: Ss.suggest.autocompleteData.customer_id,
							domain: window.location.hostname,
							dropdown_positions: dropdown_positions,
							event_sub_type: '',
							event_type: 'autocomplete',
							media_type: 'image',
							referring_url: '',
							request_path: window.location.href,
							site: 'shutterstock-mason',
							site_language: Ss.user.language,
							test_cell_assignments: test_cell,
							test_framework: 'Absinthe',
							timestamp: new Date().getTime(),
							typed_terms: typed_terms,
							user_agent: navigator.userAgent,
							version: 'v1.0',
							visit_id: Ss.user.visitId,
							visitor_id: Ss.user.visitorId
						};



						var tempToJSON = Array.prototype.toJSON;
						delete Array.prototype.toJSON;
						var stringified = JSON.stringify(sdpData);
						Array.prototype.toJSON = tempToJSON;

						new Ajax.Request(Ss.suggest.sdp, {
							method: 'POST',
							contentType: 'application/json',
							postBody: stringified
						});
                    }
                }


                setTimeout(function () {
                    form.submit();
                }, 32);



            } else {
                form.submit();
            }
        }




        document.observe('Autocompleter:selectEntry', function(evt) {
            var data = evt.memo;
            pushToData(data.inputValue, data.value, data.index);

            handleSearchSubmit.call(form, evt);
        });


        Event.observe(form, 'submit', handleSearchSubmit)

        document.observe('Autocompleter:cursorMoved', handleAutocompleteChange);
        document.observe('Autocompleter:queryChanged', handleAutocompleteChange);
        
        if(args.focusOnKeydown) {
            this.focusOnKeydown(autocompleter);
        }
        
        return autocompleter;
    },


    autocompleteLanguage: function(language) {
        var defaultEnAutocompleter = {

            'th': 1,
            'ko': 1
        };
        return defaultEnAutocompleter[language] ? 'en' : language;
    },
    
    processSuggestion: function(choices) {
        this.instances.invoke('processChoices', choices);
    },
    
    focusOnKeydown: function(autocompleter) {



        var textInput = autocompleter.element;
        var isHidden = function(element) {
            var dimensions = element.getDimensions();
            return (!element.visible() || dimensions.width <= 0 || dimensions.height <= 0);
        };
        Event.observe(document, 'keydown', function(evt) {
            var nodeName = evt.target.nodeName;
            var keyCode = evt.keyCode || evt.which;
            var isLetterKey = keyCode >= 65 && keyCode <= 90;
            var hasModifierKey = evt.ctrlKey || evt.altKey || evt.shiftKey || evt.metaKey;
            if(isHidden(textInput)) {
                return;
            }
            if(nodeName.match(/INPUT|TEXTAREA/i)) {
                return;
            }
            if(!isLetterKey || hasModifierKey) {
                return;
            }
            
            autocompleter.fireKeydown(evt);
        });
    }
	
};
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/suggest.js'

// global.js: begin JavaScript file: '/js/Anim.js'
// ================================================================================
(function(ns){
   ns.Anim = {};
   ns.Anim = function(set, duration, interval, callback, easing){
	    this.set = set;
		this.increment = 1 / (duration / interval);
		this.callback = callback || null;
		this.interval = interval || 30;
		this.easing = easing || ns.Anim.easing.in_out;
		this.val = 0;
		this._stop = null;
		this._timeout = null;
   };

   ns.Anim.easing = {
		'in': function (t) {
			return t*t;
		},
		'out': function (t) {
			return -1*t*(t-2);
		},
		'in_out': function (t) {
			if ((t/=1/2) < 1) return 1/2*t*t;
			return -1/2 * ((--t)*(t-2) - 1);
		},
		'none': function(t){ return t; }
   };

   ns.Anim.prototype = {
		start: function(){ this._run()},
		stop: function(){ this._stop = true;},
	    _run: function(){
		     var self = this;
			 if(this._stop){
				 this._stop = null;
				 return;
			 }
			 var val = this.val + this.increment;
			 var easeval = this.easing(this.val);
			 if(val >= 1){
			   this.set(1);
			   this.val = 1;
			   if(this.callback){ this.callback()}
			 }else{
			   this.set(easeval);
			   this._timeout = setTimeout(function(){ self._run()}, this.interval);
			   this.val = val;
			 }
	   }
   }
})(window);
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/Anim.js'

// global.js: begin JavaScript file: '/js/ImagePaginator.js'
// ================================================================================
function ImagePaginator(displayDuration, images){
	var instance = this;

	this.paginator = $('image_paginator');
	this.currentImage;
	this.images = images;
	this.currentIndex = 0;
	this.imagePreloader = new Image();

	this.loadCount = 1;
	this.deleterTimer = null;
	this.loopTimer = null;
	this.displayDuration = displayDuration * 1000;
	
	this.init = function(){
		this.initializePagination();
		this.initializeImages();
	}
	this.initializeImages = function(){
		this.preloadImages();
		this.loadImage(0);
	}
	this.preloadImages = function(){
		Event.observe(window, 'load', function() {
			for(var x=0;x<instance.images.length;x++){
				var tmp = new Image();
				tmp.src = instance.images[x].image_url;
			}
		});
	}
	this.initializePagination = function(){
		var paginator_wrapper = document.createElement('div');
		paginator_wrapper.className = 'paginator_wrapper';
		this.paginator.appendChild(paginator_wrapper);
		
		var html = '';
		for(var x=0;x<this.images.length;x++){
			var classString = (x==this.currentIndex?'pager_selected':'');
			html += '<div class="pager ' + classString + '"></div>';
		}

		paginator_wrapper.innerHTML = html;
		paginator_wrapper.style.marginLeft = - (paginator_wrapper.offsetWidth / 2) + 'px';
		this.setPaginatorEventListeners();
	}
	this.setPaginatorEventListeners = function(){
		$$('#image_paginator .paginator_wrapper .pager').each(function(target,x){
			target.observe('click',function(){
				instance.loadImage(x);
			});
			target.observe('mouseover',function(){
				if(!this.hasClassName('pager_selected'))
					target.addClassName('pager_hover');
			});
			target.observe('mouseout',function(){
				if(!this.hasClassName('pager_selected'))
					target.removeClassName('pager_hover');
			});
		});
	}
	this.updatePageBullets = function(){
		$$('#image_paginator .paginator_wrapper .pager').each(function(target,x){
			if(x == instance.currentIndex){
				target.addClassName('pager_selected');
				target.removeClassName('pager_hover');
			}else{
				target.removeClassName('pager_selected');
				target.removeClassName('pager_hover');
			}
		});
	}
	this.setNextIndex = function(){
		this.currentIndex++;
		if(this.currentIndex >= this.images.length) this.currentIndex = 0;
	}
	this.loadImage = function(idx){

		this.setImagesToDeleter();
		this.stopLoopTimer();
		this.stopDeleterTimer();
		this.currentIndex = idx;
		this.updatePageBullets();
		
		var loadingImage = new Element('IMG');
		loadingImage.addClassName('bgimage');
		loadingImage.src = this.images[idx].image_url;
		loadingImage.setStyle({
			'position': 'absolute',
			left: 0,
			top: 0,
			zIndex: this.loadCount
		});
		loadingImage.setOpacity(0);
		this.paginator.insert(loadingImage);

		this.loadCount++;

		var increment = Prototype.Browser.LTE(9) ? 0.042 : 1 / 60;
        var pe = loadingImage.setStylePeriodically({
           	property:     'opacity',
            endValue:     1,
            increment:    increment,
            units:        '',
            onComplete:   instance.removeDeleterImages,
            startValue:   0,
            interval:     1 / 60
        });
	}
	this.setImagesToDeleter = function(){
		$('image_paginator').select('.bgimage').each(function(target,x){
			target.addClassName('deleter');
		});
	}
	this.removeDeleterImages = function(){
		instance.stopDeleterTimer();
		instance.deleterTimer = setTimeout(function(){
			$$('#image_paginator .deleter').each(function(target,x){
				target.remove();
			});
			

			instance.loadCount = 1;
			$$('#image_paginator .bgimage').each(function(target,x){
				target.style.zIndex = instance.loadCount;
			});
		},1000);
		
		

		instance.stopLoopTimer();
		instance.loopTimer = setTimeout(function(){
			instance.setNextIndex();
			instance.loadImage(instance.currentIndex);
		},instance.displayDuration);
		
	}
	this.stopDeleterTimer = function(){
		clearTimeout(this.deleterTimer);
		this.deleterTimer = null;
	}
	this.stopLoopTimer = function(){
		clearTimeout(this.loopTimer);
		loopTimer = null;
	}
	this.init();
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/ImagePaginator.js'

// global.js: begin JavaScript file: '/js/MarketingModule.js'
// ================================================================================
function MarketingModuleRotator(args) {
	var instance = this;
	this.currentPage = 0;
	this.totalPages = 0;
	this.itemsPerPage = 3;
	this.isIE = $('lil_brother').hasClassName('ie');
	this.items = args.items;
	
	this.init = function(){
		this.initializeCalloutRotator();
		this.addEventListeners();
	};
	
	this.initializeCalloutRotator = function(){

		this.getCalloutData();
		this.loadPages();
		

		this.setPage(0);


		var opac = 0;
		if(this.isIpad() || this.isIphone()) opac = 1;
		$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(x){
			x.setOpacity(opac);
		});
	};
	this.loadPages = function(){
		var html = '';
		for (var x=0; x < this.callout_data.items.length; x++) {
			var item = this.callout_data.items[x];
			if (x % this.itemsPerPage === 0)
				html += '<ul class="animate" style="left:' + (x * 100) + '%;">';
			var isLast = ((x % this.itemsPerPage) == (this.itemsPerPage - 1));
			var li_width = Math.floor(100 / this.itemsPerPage - 1);
			var thisId = 'MM_' + x;
			if (((x-1) % 3 === 0) && !this.isIE)
				li_width += 1;

			html += '<li class="' + (isLast ? 'last' : '') + '"id="' + thisId + '" style="width:' + li_width + '%;">';

			if (item.hasContainer)
				html += '<div class="image_wrapper">';
			else
				html += '<div class="none_border_wrapper">';

			var target = item.target ? 'target="' + item.target + '" ' : '';

			var second_line = '<h5>';
			if (!this.callout_data.items[x].no_link_text_anchor) second_line += '<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">';
			second_line += this.callout_data.items[x].link_text;
			if (!this.callout_data.items[x].no_link_text_anchor) second_line += '</a>';
			second_line += '</h5>';
			
			html+='			<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">' +
			' 				<img class="module_image" src="' + this.callout_data.items[x].img_src + '" border="0"/></a>'+
			'			</div>'+
			'		<h4 class="light">' + '<a ' + target + 'href="' + this.callout_data.items[x].link_href + '">' + this.callout_data.items[x].title + '</a></h4>' + second_line +
			'	</li>';
			if(x%this.itemsPerPage == (this.itemsPerPage-1) || x == this.callout_data.items.length-1) html+= '</ul>';
		}

		$('rotation_wrapper').innerHTML = html;


		this.totalPages = $$('#rotation_wrapper ul').length;
		html = '';
		for(var x=0;x<this.totalPages;x++){
			var classString = (x==this.currentPage?'pager_selected':'');
			html += '<div class="pager ' + classString + '"></div>';
		}

		var paginator_wrapper = $$('.callout_wrapper .paginator_wrapper')[0];
		paginator_wrapper.update(html);
		paginator_wrapper.style.marginLeft = - (paginator_wrapper.offsetWidth / 2) + 'px';
	}
	this.addEventListeners = function(){
		var target = $('callout_rotator');

		target.mouseenter(function(e) {
			$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(el) {
				el.setOpacity(1);
			});
		});

		target.mouseleave(function(e) {
			$$('#navigation_wrapper .nav_left, #navigation_wrapper .nav_right').each(function(el) {
				el.setOpacity(0);
			});
		});

		$$('#callout_rotator #navigation_wrapper .navigation_arrow').each(function(x){
			x.observe('click',function(target){
				if(this.hasClassName('nav_left')){
					if(instance.currentPage - 1 < 0) instance.currentPage = instance.totalPages;
					instance.setPage(--instance.currentPage);
				}else{
					if(instance.currentPage +1 >= instance.totalPages) instance.currentPage = -1;
					instance.setPage(++instance.currentPage);
				}
			});
			x.observe('mouseover',function(){
				if(this.hasClassName('nav_left')){
					this.style.backgroundPosition = '-2px -126px';
				}else{
					this.style.backgroundPosition = '-2px -46px';
				}
			});
			x.observe('mouseout',function(){
				if(this.hasClassName('nav_left')){
					this.style.backgroundPosition = '-2px -86px';
				}else{
					this.style.backgroundPosition = '-2px -6px';
				}
			});
		});
		$$('.callout_wrapper .paginator_wrapper .pager').each(function(target,x){
			target.observe('click',function(){
				instance.setPage(x);
			});
			target.observe('mouseover',function(){
				if(!this.hasClassName('pager_selected'))
					target.addClassName('pager_hover');
			});
			target.observe('mouseout',function(){
				if(!this.hasClassName('pager_selected'))
					target.removeClassName('pager_hover');
			});
		});
		$$('#callout_rotator .image_wrapper').each(function(target,x){
			target.observe('mouseover',function(){
				this.addClassName('selected');
			});
			target.observe('mouseout',function(){
				this.removeClassName('selected');
			});
		});
	}
	
	/* function to navigate the callout pages */
	this.setPage = function(idx){
		this.currentPage = idx;
		this.setULCoordinates();
		this.updatePaginator();
	}
	this.setULCoordinates = function(){
		$$('#rotation_wrapper ul').each(function(target, x){
			if(target.CSSTransitionsSupported()){
				target.style.left = (x - instance.currentPage) * 100 + '%';
			}else{
				target.setStylePeriodically({
					property:     'left',
					endValue:     (x - instance.currentPage) * 100,
					increment:    10,
					units:        '%',
					onComplete:   null
				});
			}
		});
	}
	this.updatePaginator = function(){
		$$('.callout_wrapper .paginator_wrapper .pager').each(function(target,x){
			if(x == instance.currentPage){
				target.addClassName('pager_selected');
				target.removeClassName('pager_hover');
			}else{
				target.removeClassName('pager_selected');
				target.removeClassName('pager_hover');
			}
		});
	}
	this.isIpad = function(){
		var uagent = navigator.userAgent.toLowerCase();
		return uagent.search('ipad') > -1
	}
	this.isIphone = function(){
		var uagent = navigator.userAgent.toLowerCase();
		return uagent.search('iphone') > -1
	}

	this.getCalloutData = function(){
		this.callout_data = this.items;
	}
	this.init();
}
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/MarketingModule.js'

// global.js: begin JavaScript file: '/js/absinthe.min.js'
// ================================================================================
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.Absinthe=t()}}(function(){var define,module,exports;return function t(e,n,r){function i(a,s){if(!n[a]){if(!e[a]){var u="function"==typeof require&&require;if(!s&&u)return u(a,!0);if(o)return o(a,!0);var c=new Error("Cannot find module '"+a+"'");throw c.code="MODULE_NOT_FOUND",c}var l=n[a]={exports:{}};e[a][0].call(l.exports,function(t){var n=e[a][1][t];return i(n?n:t)},l,l.exports,t,e,n,r)}return n[a].exports}for(var o="function"==typeof require&&require,a=0;a<r.length;a++)i(r[a]);return i}({1:[function(t,e,n){e.exports={production:"production",development:"development",disabled:"disabled"}},{}],2:[function(t,e,n){(function(n){"use strict";function r(t){try{this.util=f(n),this.events=y({aborted:"error",error:"error",loaded:"info"}),t=i(t),this.segmentations=new d(t.segmentations),this.visitor=new v(l(t,"visitId","visitorId","externalAccountId")),this.page=new h(u({},t,{api_key:t.apiKey,segmentations:this.segmentations,visitor:this.visitor})),this._definitionLoader=new g(l(t,"apiKey","server","definitionServer"),this.util),m.configure({apiKey:t.apiKey,host:t.server})}catch(e){this.events.aborted.emit(e.message),this.initialize=c}}function i(t){if(t=s({},t,{definitionServer:"absinthe.picdn.net",server:"absinthe.shutterstock.com"}),!t.apiKey)throw new Error("apiKey is required");return t}function o(t,e){t.pageURL=e.page.pageURL,t.segmentations=e.segmentations,t.recordEvent=a(e.page.recordEvent,e.page),t.run=a(e.run,e)}var a=t("lodash/function/bind"),s=t("lodash/object/defaults"),u=t("lodash/object/extend"),c=t("lodash/utility/noop"),l=t("lodash/object/pick"),f=t("./utility"),p=t("./browser"),h=t("./page"),d=t("./segmentations"),v=t("./visitor"),g=t("./loads-definitions"),y=t("./creates-console-signals"),m=t("./utility/request");e.exports=r,r.version="1.3.0x",r.prototype.initialize=function(){try{return(new p).guard().segment(this.segmentations),o(r,this),this._definitionLoader.load(),this}catch(t){this.events.aborted.emit(t.message)}},r.prototype.run=function(t){try{this.page.metrics=t.metrics,this.page.experiments=t.experiments,this.page.initialize(),this.page.applyVariations(),this.page.applyMetrics(),this.page.recordAssignments(),this.events.loaded.emit()}catch(e){this.events.error.emit(e)}}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./browser":4,"./creates-console-signals":6,"./loads-definitions":10,"./page":12,"./segmentations":13,"./utility":17,"./utility/request":25,"./visitor":26,"lodash/function/bind":52,"lodash/object/defaults":140,"lodash/object/extend":141,"lodash/object/pick":146,"lodash/utility/noop":156}],3:[function(t,e,n){"use strict";function r(t){return r[i(t)]}var i=t("lodash/string/camelCase");e.exports=r,r.visitorId="visitor_id",r.externalAccountId="external_account_id"},{"lodash/string/camelCase":148}],4:[function(t,e,n){(function(n){"use strict";function r(t){a.assign(this,i(t)),this.devicePixelRatio=n.devicePixelRatio||1}function i(t){return s.browser._detect(o(t))}function o(t){return t||n.navigator&&n.navigator.userAgent}var a=t("lodash"),s=t("bowser");e.exports=r,r.prototype.guard=function(){if(!this.name)throw new Error("bot or unknown user agent");if(this.msie&&this.version<9)throw new Error("unsupported browser");return this},r.prototype.segment=function(t){return t.add({ua:this.name+";"+this.version,mobile:this.mobile||!1,tablet:this.tablet||!1,browser:this.name||"unknown",pixel_ratio:this.devicePixelRatio}),this}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{bowser:28,lodash:54}],5:[function(t,e,n){"use strict";var r=t("domready");e.exports=r},{domready:42}],6:[function(t,e,n){"use strict";var r=t("lodash"),i=t("signal-emitter");i._bind=r.bind;var o=t("./utility/console"),a=t("./utility/client-config"),s=t("./utility/emitter"),u=new o(a.get("abloglevel"));e.exports=function(t,e){return r.mapValues(t,function(t,n){return s.on(n,function(){var i=r.toArray(arguments),o=r.bind(u[t],u,"[Absinthe]","["+n+"]");if(e){var a=r.template(e)(r.last(arguments));i.unshift(a)}o.apply(this,i)}),new i(s,n)})}},{"./utility/client-config":18,"./utility/console":19,"./utility/emitter":20,lodash:54,"signal-emitter":166}],7:[function(t,e,n){"use strict";function r(t){return this instanceof r?void(this.config=i(t)):new r(t)}function i(t){var e={server:"absinthe.shutterstock.com",definitionServer:"absinthe.picdn.net",callback:"Absinthe.run"};return u(t).pick("apiKey","callback","mode","server","definitionServer").defaults(e).value()}function o(t){return t.mode?t.server:t.definitionServer}function a(t){return u(t).pick("apiKey","callback","mode").omit(u.isUndefined).mapValues(String).mapKeys(c).value()}var s=t("url"),u=t("lodash");e.exports=r,r.prototype.toString=function(){return s.format({host:o(this.config),pathname:"/public/definitions.js",query:a(this.config)})};var c=u.rearg(u.snakeCase,1)},{lodash:54,url:171}],8:[function(t,e,n){"use strict";function r(t){try{return t=s(t).mapKeys(f).pick("id","title","isActive","assignmentType","eligibilityTest","eligibilityUrlRegex","eligibilityPercent","variations").transform(u({assignmentType:l,eligibilityTest:o,eligibilityUrlRegex:s.ary(RegExp,1),variations:i})).value(),new c(t)}catch(e){c.prototype.events.ExperimentError.emit(e,t)}}function i(t){return s(t).map(a).indexBy("id").value()}function o(t){return s.wrap(new Function(t),function(t){try{return t()}catch(e){this.events.ExperimentError.emit("Error in eligibilityJS",e,this)}})}function a(t){return t.id=t._id,t}var s=t("lodash"),u=t("./utility/lodash-ext/transform-object"),c=t("./experiment.js"),l=t("./assignment-type.js"),f=s.rearg(s.camelCase,1);e.exports=r},{"./assignment-type.js":3,"./experiment.js":9,"./utility/lodash-ext/transform-object":23,lodash:54}],9:[function(t,e,n){"use strict";function r(t){s(this,t)}function i(t,e){return String(t.id)+String(e.assignmentSeed(t.assignmentType))}function o(t,e){return t.random()>e/100}function a(t,e){e=u(e);var n=t(e.length);return e[n]}var s=t("lodash/object/assign"),u=t("lodash/object/values"),c=t("./creates-console-signals"),l=t("random-seed").create();e.exports=r,r.prototype.events=c({Assigned:"info",EligibilityDetermined:"info",ExperimentError:"warn"},"[Experiment: {{= id }}]"),r.prototype.isEligible=function(t){return this.isActive?this.eligibilityUrlRegex.test(t)?this.eligibilityTest()?(this.events.EligibilityDetermined.emit("Eligible",this),!0):(this.events.EligibilityDetermined.emit("Ineligible by custom eligibilityJS",this),!1):(this.events.EligibilityDetermined.emit("Ineligible by page url",this),!1):(this.events.EligibilityDetermined.emit("Inactive",this),!1)},r.prototype.assign=function(t){return l.seed(i(this,t)),o(l,this.eligibilityPercent)?(this.assignedVariation=void 0,this.events.Assigned.emit("Excluded by eligibility percent",this),this):(this.assignedVariation=a(l,this.variations),this.events.Assigned.emit("Variation: "+this.assignedVariation.id,this),this)}},{"./creates-console-signals":6,"lodash/object/assign":139,"lodash/object/values":147,"random-seed":165}],10:[function(t,e,n){"use strict";function r(t,e){this.document=e.document,this.url=new a({apiKey:t.apiKey,mode:o[s.get("abmode")],server:t.server,definitionServer:t.definitionServer})}function i(t){return!!t.body}var o=t("./abmode"),a=t("./definitions-url"),s=t("./utility/client-config");e.exports=r,r.prototype.load=function(){if(i(this.document)){var t=this.document.createElement("script");t.src=this.url,this.document.body.appendChild(t)}else this.document.write('<script src="'+this.url+'"></script>')}},{"./abmode":1,"./definitions-url":7,"./utility/client-config":18}],11:[function(t,e,n){"use strict";function r(){var t=(o.get("abv")||"").split(",");return i(t).compact().invoke("split","-").object().mapValues(Number).value()}var i=t("lodash"),o=t("./utility/client-config");e.exports=r},{"./utility/client-config":18,lodash:54}],12:[function(t,e,n){(function(n){"use strict";function r(t){t=t||{},this.server=t.server||"",this.api_key=t.api_key||"",this.visitor=t.visitor,this.cookiePrefix=this.api_key.slice(1,8),this.cookieDomain=t.cookieDomain,this.variations=[],this.visitVariations=[],this.experiments=t.experiments||[],this.segmentations=t.segmentations,this.metrics=t.metrics||[],this.eligibilityParams=t.eligibilityParams,this._cookieOverrideJar=t.cookieOverride,this.util=s(t.window?t.window:n),this.pageURL=t.pageURL||this.util.pageURL(),this.variationsApplied=!1,this.metricsApplied=!1,this.events=u({aborted:"warn",deemedEligible:"info",deemedIneligible:"info",variationOverridden:"info",variationAssigned:"info",pageInitialized:"info",variationsApplied:"info",metricsApplied:"info",metricApplied:"info",recordedEvent:"info",recordedAssignments:"info",recordedVisitAssignments:"info"})}var i=t("lodash/object/assign"),o=t("lodash/lang/clone"),a=t("base-64"),s=t("./utility"),u=t("./creates-console-signals"),c=t("./overrides"),l=t("./experiment-builder"),f=t("./service/assignments"),p=t("./service/events"),h=t("./service/visits");r.prototype.initialize=function(){this.variationsApplied&&this.events.aborted.emit("Page already initialized");var t,e,n=c(),r=this.getVisitExperiments();this.variations=[],this.visitVariations=[];for(var i=0;i<this.experiments.length;i++)e=void 0,this.experiments[i].page=this,t=l(this.experiments[i]),t.isEligible(this.pageURL)&&(n[t.id]?(e=t.variations[n[t.id]],this.events.variationOverridden.emit({experimentId:t.id,experimentTitle:t.title})):e=t.assign(this.visitor).assignedVariation,e&&(this.events.variationAssigned.emit({variationId:e.id,variationTitle:e.title}),this.variations.push(e),r[t.id]||(r[t.id]=e._id,this.visitVariations.push(e._id))));this.setVisitExperiments(r),this.events.pageInitialized.emit()},r.prototype.setExperiments=function(t){var e=[];for(var n in t)t.hasOwnProperty(n)&&e.push([n,t[n]].join(":"));var r=new Date;r.setYear(r.getFullYear()+10);var i=this.cookieDomain?"; domain="+this.cookieDomain:"",o="v2/"+a.encode(e.join(","));this.util.cookie.set(this.cookiePrefix+"exp",o,{expires:r.toGMTString()+i})},r.prototype.getExperiments=function(){var t=this.util.cookie.get(this.cookiePrefix+"exp"),e={};if(t){for(var n,r=a.decode(t.substr(3)),i=r.split(","),o=0;o<i.length;o++)n=i[o].split(":"),2===n.length&&(e[n[0]]=n[1]);var s={},u=!1;for(o=0;o<this.experiments.length;o++)s[this.experiments[o]._id]=!0;for(var c in e)e.hasOwnProperty(c)&&(s[c]||(u=!0,delete e[c]));u&&this.setExperiments(e)}return e},r.prototype.setVisitExperiments=function(t){var e=[],n=new Date;n.setTime(n.getTime()+172800);for(var r in t)t.hasOwnProperty(r)&&e.push([r,t[r]].join(":"));var i=a.encode(this.visitor.visitId+"/"+e.join(",")),o=this.cookieDomain?"; domain="+this.cookieDomain:"";this.util.cookie.set(this.cookiePrefix+"visit_exp",i,{expires:n.toGMTString()+o})},r.prototype.getVisitExperiments=function(){var t={},e=this.util.cookie.get(this.cookiePrefix+"visit_exp");if(!e)return t;var n=a.decode(e),r=n.split("/"),i=r[0];if(parseInt(i,10)!==parseInt(this.visitor.visitId,10)||!r[1])return t;for(var o=r[1].split(","),s=0;s<o.length;s++){var u=o[s].split(":");t[u[0]]=u[1]}return t},r.prototype.applyVariations=function(){if(this.variationsApplied)throw new Error("Visit Variations Already Applied");for(var t=0;t<this.variations.length;t++)this.applyVariation(this.variations[t]);return this.variationsApplied=!0,this.events.variationsApplied.emit(t),t},r.prototype.applyVariation=function(t){this.lastAppliedVariation=t,t.css&&""!==t.css&&this.util.injectCSS(t.css),t.js_head&&""!==t.js_head&&this.util.evalJS(this,t.js_head)(),t.js_domready&&""!==t.js_domready&&this.util.domready(this.util.evalJS(this,t.js_domready,t))},r.prototype.applyMetrics=function(){var t=0;if(this.metricsApplied)throw new Error("Metrics Already Applied");for(var e=0;e<this.metrics.length;e++)t+=this.applyMetric(this.metrics[e]);return this.metricsApplied=!0,this.events.metricsApplied.emit(t),t},r.prototype.applyMetric=function(t){return t.url_match_regex&&!this.util.matchURL(t.url_match_regex,this.pageURL)?0:t.javascript?(this.events.metricApplied.emit({metricId:t.id,metricTitle:t.title}),this.util.domready(this.util.evalJS(this,t.javascript,t)),1):0},r.prototype.recordEvent=function(t,e){e=o(e||{});var n=this.getExperiments(),r=[];for(var a in n)n.hasOwnProperty(a)&&r.push(parseInt(n[a],10));i(e,this.visitor.toJson(),{eventName:t,variationId:r,attr:this.segmentations.toJson()}),this.events.recordedEvent.emit(e),p.post(e)},r.prototype.recordAssignments=function(){for(var t,e=this.getExperiments(),n=[],r=[],o=0;o<this.variations.length;o++)t=this.variations[o],e[t.experimentId]?parseInt(e[t.experimentId],10)!==parseInt(t._id,10)&&(r.push(t),n.push(t._id)):(r.push(t),n.push(t._id));if(n.length){var a=i({},this.visitor.toJson(),{variationId:n,attr:this.segmentations.toJson()});for(this.events.recordedAssignments.emit(a),f.post(a),e=this.getExperiments(),o=0;o<r.length;o++)t=r[o],e[t.experimentId]=t._id;this.setExperiments(e)}if(this.visitVariations.length){var s=i({},this.visitor.toJson(),{variationId:this.visitVariations});this.events.recordedVisitAssignments.emit(s),h.post(s)}},e.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./creates-console-signals":6,"./experiment-builder":8,"./overrides":11,"./service/assignments":14,"./service/events":15,"./service/visits":16,"./utility":17,"base-64":27,"lodash/lang/clone":131,"lodash/object/assign":139}],13:[function(t,e,n){"use strict";function r(t){i.assign(this,t)}var i=t("lodash");e.exports=r,r.prototype.add=function(t,e){return 2===arguments.length?this[t]=e:i.assign(this,t),this},r.prototype.toJson=function(){return i(this).omit(i.isNull).omit(i.isUndefined).omit(i.isFunction).value()}},{lodash:54}],14:[function(t,e,n){"use strict";var r=t("../utility/request");e.exports={post:function(t){r({url:{pathname:"/public/assignments",query:t}})}}},{"../utility/request":25}],15:[function(t,e,n){"use strict";var r=t("../utility/request");e.exports={post:function(t){r({url:{pathname:"/public/events",query:t}})}}},{"../utility/request":25}],16:[function(t,e,n){"use strict";var r=t("../utility/request");e.exports={post:function(t){r({url:{pathname:"/public/visits",query:t}})}}},{"../utility/request":25}],17:[function(require,module,exports){(function(global){"use strict";var cookie=require("cookie-cutter"),domready=require("./domready.js"),createConsoleSignalsFor=require("./creates-console-signals");module.exports=function(options){options=options||{};var window=options.window||global||{},document=options.document||window.document||{},location=options.location||window.location||{},_cookie=cookie(document),util={document:document,events:createConsoleSignalsFor({evalError:"warn"}),pageURL:function(){return location.pathname||"no_url"},matchURL:function(t,e){return new RegExp(t).test(e)},evalJS:function(context,script,entity){var Absinthe=context||util,events=this.events;return function(params,stats){params=params||{},stats=stats||{totalTime:-1,variations:[]};var fn,result;try{eval("fn = function(params, stats){"+script+"};"),result=fn(params)}catch(ex){events.evalError.emit(ex,script,entity)}return result}},cookie:{get:function(t){return _cookie.get(t)},set:function(t,e,n){_cookie.set(t,e,n)}},createStyleFromText:function(t){if(!document.createElement||!document.createTextNode)return void 0;var e=document.createElement("style"),n=document.createTextNode(t);return e.type="text/css",e.styleSheet?e.styleSheet.cssText=n.nodeValue:e.appendChild(n),e},injectCSS:function(t){if(t&&document.getElementsByTagName){var e=document.getElementsByTagName("head")[0],n=util.createStyleFromText(t);e&&n&&e.appendChild(n)}},domready:domready};return util}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./creates-console-signals":6,"./domready.js":5,"cookie-cutter":41}],18:[function(t,e,n){(function(n){"use strict";function r(t,e,n,r){this.querystringStorage=t,this.sessionStorage=e,this.localStorage=n,this.cookieStorage=r}function i(t,e){return t?t.getItem(e):void 0}var o=t("lodash/function/bind"),a=t("cookie-cutter")(),s=t("./location")().query;e.exports=r,r.prototype.get=function(t){return this.querystringStorage[t]||i(this.sessionStorage,t)||i(this.localStorage,t)||this.cookieStorage.get(t)};var u=new r(s,n.sessionStorage,n.localStorage,a);r.get=o(u.get,u)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./location":21,"cookie-cutter":41,"lodash/function/bind":52}],19:[function(t,e,n){"use strict";function r(t){this.level=m.get(t),c(this,s(this.level)),i(this),f(this,a())}function i(t){t.trace=t.trace||t.debug,t.debug=t.debug||t.trace}function o(t){return p(b.slice(t))}function a(){var t=v(p(b));return h(t,l(d))}function s(t){return y(g(u,o(t)),u)}var u=t("console"),c=t("lodash/object/assign"),l=t("lodash/utility/constant"),f=t("lodash/object/defaults"),p=t("lodash/array/flatten"),h=t("lodash/object/mapValues"),d=t("lodash/utility/noop"),v=t("lodash/array/object"),g=t("lodash/object/pick"),y=t("./lodash-ext/bind-all-to"),m=t("./log-level");e.exports=r;var b=[];b[m.DEBUG]=["trace","debug"],b[m.INFO]=["info","log"],b[m.WARN]=["warn"],b[m.ERROR]=["error"]},{"./lodash-ext/bind-all-to":22,"./log-level":24,console:30,"lodash/array/flatten":46,"lodash/array/object":48,"lodash/object/assign":139,"lodash/object/defaults":140,"lodash/object/mapValues":144,"lodash/object/pick":146,"lodash/utility/constant":152,"lodash/utility/noop":156}],20:[function(t,e,n){"use strict";var r=t("events").EventEmitter;e.exports=new r},{events:32}],21:[function(t,e,n){(function(n){"use strict";var r=t("url");e.exports=function(t){return t=t||n.location||"",r.parse(t.toString(),!0,!0)}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{url:171}],22:[function(t,e,n){"use strict";var r=t("lodash");e.exports=function(t,e,n){var i=r.toArray(arguments);t=i.shift(),n=i.pop(),e=r.flatten(i),r.isEmpty(e)&&(e=r.keys(t));var o=r.ary(r.partialRight(r.bind,n),1);return r(t).pick(e).mapValues(o).value()}},{lodash:54}],23:[function(t,e,n){"use strict";var r=t("lodash/utility/iteratee");e.exports=function(t){return function(e,n,i,o){e[i]=r(t[i],this)(n,i,o)}}},{"lodash/utility/iteratee":154}],24:[function(t,e,n){"use strict";var r=t("lodash/lang/isString");e.exports={TRACE:1,DEBUG:1,INFO:2,WARN:3,ERROR:4,OFF:5,get:function(t){return(r(t)?this[t.toUpperCase()]:t)||this.OFF}}},{"lodash/lang/isString":137}],25:[function(t,e,n){"use strict";function r(t,e){e=e||c.noop;var n=c.flow(i,o,a,s,u);h.xhr(n(t),e)}function i(t){return c.defaultsDeep({},t,h.requestOptions)}function o(t){return t.url.query._rand=Math.floor(1e7*Math.random()),t}function a(t){return t.url.query._method="POST",t}function s(t){return t.url.search=l.stringify(t.url.query),t}function u(t){return t.url=f.format(t.url),t}var c=t("lodash"),l=t("qs"),f=t("url"),p=t("request");e.exports=r;var h={requestOptions:{url:{protocol:"https"}},xhr:p};r.configure=function(t){c.merge(h,{requestOptions:{url:{host:t.host,query:{api_key:t.apiKey}}},xhr:t.xhr})}},{lodash:54,qs:160,request:172,url:171}],26:[function(t,e,n){"use strict";function r(t){o.assign(this,i(t))}function i(t){return o(t).mapValues(function(t){return t?Number(t)||void 0:void 0}).tap(function(t){if(!t.visitId)throw new Error("visitId is required");if(!t.visitorId)throw new Error("visitorId is required")}).value()}var o=t("lodash"),a=t("./assignment-type");e.exports=r,r.prototype.assignmentSeed=function(t){return t===a.externalAccountId?this.externalAccountId||this.visitorId:this.visitorId},r.prototype.toJson=function(){return o.omit(this,o.isFunction)}},{"./assignment-type":3,lodash:54}],27:[function(t,e,n){(function(t){!function(r){var i="object"==typeof n&&n,o="object"==typeof e&&e&&e.exports==i&&e,a="object"==typeof t&&t;(a.global===a||a.window===a)&&(r=a);var s=function(t){this.message=t};s.prototype=new Error,s.prototype.name="InvalidCharacterError";var u=function(t){throw new s(t)},c="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",l=/[\t\n\f\r ]/g,f=function(t){t=String(t).replace(l,"");var e=t.length;e%4==0&&(t=t.replace(/==?$/,""),e=t.length),(e%4==1||/[^+a-zA-Z0-9/]/.test(t))&&u("Invalid character: the string to be decoded is not correctly encoded.");for(var n,r,i=0,o="",a=-1;++a<e;)r=c.indexOf(t.charAt(a)),n=i%4?64*n+r:r,i++%4&&(o+=String.fromCharCode(255&n>>(-2*i&6)));return o},p=function(t){t=String(t),/[^\0-\xFF]/.test(t)&&u("The string to be encoded contains characters outside of the Latin1 range.");for(var e,n,r,i,o=t.length%3,a="",s=-1,l=t.length-o;++s<l;)e=t.charCodeAt(s)<<16,n=t.charCodeAt(++s)<<8,r=t.charCodeAt(++s),i=e+n+r,a+=c.charAt(i>>18&63)+c.charAt(i>>12&63)+c.charAt(i>>6&63)+c.charAt(63&i);return 2==o?(e=t.charCodeAt(s)<<8,n=t.charCodeAt(++s),i=e+n,a+=c.charAt(i>>10)+c.charAt(i>>4&63)+c.charAt(i<<2&63)+"="):1==o&&(i=t.charCodeAt(s),a+=c.charAt(i>>2)+c.charAt(i<<4&63)+"=="),a},h={encode:p,decode:f,version:"0.1.0"};if("function"==typeof define&&"object"==typeof define.amd&&define.amd)define(function(){return h});else if(i&&!i.nodeType)if(o)o.exports=h;else for(var d in h)h.hasOwnProperty(d)&&(i[d]=h[d]);else r.base64=h}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],28:[function(t,e,n){!function(t,n){"undefined"!=typeof e&&e.exports?e.exports.browser=n():"function"==typeof define&&define.amd?define(n):this[t]=n()}("bowser",function(){function t(t){function n(e){var n=t.match(e);return n&&n.length>1&&n[1]||""}var r,i=n(/(ipod|iphone|ipad)/i).toLowerCase(),o=/like android/i.test(t),a=!o&&/android/i.test(t),s=n(/version\/(\d+(\.\d+)?)/i),u=/tablet/i.test(t),c=!u&&/[^-]mobi/i.test(t);/opera|opr/i.test(t)?r={name:"Opera",opera:e,version:s||n(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)}:/windows phone/i.test(t)?r={name:"Windows Phone",windowsphone:e,msie:e,version:n(/iemobile\/(\d+(\.\d+)?)/i)}:/msie|trident/i.test(t)?r={name:"Internet Explorer",msie:e,version:n(/(?:msie |rv:)(\d+(\.\d+)?)/i)}:/chrome|crios|crmo/i.test(t)?r={name:"Chrome",chrome:e,version:n(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)}:i?(r={name:"iphone"==i?"iPhone":"ipad"==i?"iPad":"iPod"},s&&(r.version=s)):/sailfish/i.test(t)?r={name:"Sailfish",sailfish:e,version:n(/sailfish\s?browser\/(\d+(\.\d+)?)/i)}:/seamonkey\//i.test(t)?r={name:"SeaMonkey",seamonkey:e,version:n(/seamonkey\/(\d+(\.\d+)?)/i)}:/firefox|iceweasel/i.test(t)?(r={name:"Firefox",firefox:e,version:n(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)},/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(t)&&(r.firefoxos=e)):/silk/i.test(t)?r={name:"Amazon Silk",silk:e,version:n(/silk\/(\d+(\.\d+)?)/i)}:a?r={name:"Android",version:s}:/phantom/i.test(t)?r={name:"PhantomJS",phantom:e,version:n(/phantomjs\/(\d+(\.\d+)?)/i)}:/blackberry|\bbb\d+/i.test(t)||/rim\stablet/i.test(t)?r={name:"BlackBerry",blackberry:e,version:s||n(/blackberry[\d]+\/(\d+(\.\d+)?)/i)}:/(web|hpw)os/i.test(t)?(r={name:"WebOS",webos:e,version:s||n(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)},/touchpad\//i.test(t)&&(r.touchpad=e)):r=/bada/i.test(t)?{name:"Bada",bada:e,version:n(/dolfin\/(\d+(\.\d+)?)/i)}:/tizen/i.test(t)?{name:"Tizen",tizen:e,version:n(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i)||s}:/safari/i.test(t)?{name:"Safari",safari:e,version:s}:{},/(apple)?webkit/i.test(t)?(r.name=r.name||"Webkit",r.webkit=e,!r.version&&s&&(r.version=s)):!r.opera&&/gecko\//i.test(t)&&(r.name=r.name||"Gecko",r.gecko=e,r.version=r.version||n(/gecko\/(\d+(\.\d+)?)/i)),a||r.silk?r.android=e:i&&(r[i]=e,r.ios=e);var l="";i?(l=n(/os (\d+([_\s]\d+)*) like mac os x/i),l=l.replace(/[_\s]/g,".")):a?l=n(/android[ \/-](\d+(\.\d+)*)/i):r.windowsphone?l=n(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i):r.webos?l=n(/(?:web|hpw)os\/(\d+(\.\d+)*)/i):r.blackberry?l=n(/rim\stablet\sos\s(\d+(\.\d+)*)/i):r.bada?l=n(/bada\/(\d+(\.\d+)*)/i):r.tizen&&(l=n(/tizen[\/\s](\d+(\.\d+)*)/i)),l&&(r.osversion=l);var f=l.split(".")[0];return u||"ipad"==i||a&&(3==f||4==f&&!c)||r.silk?r.tablet=e:(c||"iphone"==i||"ipod"==i||a||r.blackberry||r.webos||r.bada)&&(r.mobile=e),r.msie&&r.version>=10||r.chrome&&r.version>=20||r.firefox&&r.version>=20||r.safari&&r.version>=6||r.opera&&r.version>=10||r.ios&&r.osversion&&r.osversion.split(".")[0]>=6||r.blackberry&&r.version>=10.1?r.a=e:r.msie&&r.version<10||r.chrome&&r.version<20||r.firefox&&r.version<20||r.safari&&r.version<6||r.opera&&r.version<10||r.ios&&r.osversion&&r.osversion.split(".")[0]<6?r.c=e:r.x=e,r}var e=!0,n=t("undefined"!=typeof navigator?navigator.userAgent:"");return n._detect=t,n})},{}],29:[function(t,e,n){function r(t,e){return h.isUndefined(e)?""+e:h.isNumber(e)&&!isFinite(e)?e.toString():h.isFunction(e)||h.isRegExp(e)?e.toString():e}function i(t,e){return h.isString(t)?t.length<e?t:t.slice(0,e):t}function o(t){return i(JSON.stringify(t.actual,r),128)+" "+t.operator+" "+i(JSON.stringify(t.expected,r),128)}function a(t,e,n,r,i){throw new g.AssertionError({message:n,actual:t,expected:e,operator:r,stackStartFunction:i})}function s(t,e){t||a(t,!0,e,"==",g.ok)}function u(t,e){if(t===e)return!0;if(h.isBuffer(t)&&h.isBuffer(e)){if(t.length!=e.length)return!1;for(var n=0;n<t.length;n++)if(t[n]!==e[n])return!1;return!0}return h.isDate(t)&&h.isDate(e)?t.getTime()===e.getTime():h.isRegExp(t)&&h.isRegExp(e)?t.source===e.source&&t.global===e.global&&t.multiline===e.multiline&&t.lastIndex===e.lastIndex&&t.ignoreCase===e.ignoreCase:h.isObject(t)||h.isObject(e)?l(t,e):t==e}function c(t){return"[object Arguments]"==Object.prototype.toString.call(t)}function l(t,e){if(h.isNullOrUndefined(t)||h.isNullOrUndefined(e))return!1;if(t.prototype!==e.prototype)return!1;if(h.isPrimitive(t)||h.isPrimitive(e))return t===e;var n=c(t),r=c(e);if(n&&!r||!n&&r)return!1;if(n)return t=d.call(t),e=d.call(e),u(t,e);var i,o,a=y(t),s=y(e);if(a.length!=s.length)return!1;for(a.sort(),s.sort(),o=a.length-1;o>=0;o--)if(a[o]!=s[o])return!1;for(o=a.length-1;o>=0;o--)if(i=a[o],!u(t[i],e[i]))return!1;return!0}function f(t,e){return t&&e?"[object RegExp]"==Object.prototype.toString.call(e)?e.test(t):t instanceof e?!0:e.call({},t)===!0?!0:!1:!1}function p(t,e,n,r){var i;h.isString(n)&&(r=n,n=null);try{e()}catch(o){i=o}if(r=(n&&n.name?" ("+n.name+").":".")+(r?" "+r:"."),t&&!i&&a(i,n,"Missing expected exception"+r),!t&&f(i,n)&&a(i,n,"Got unwanted exception"+r),t&&i&&n&&!f(i,n)||!t&&i)throw i}var h=t("util/"),d=Array.prototype.slice,v=Object.prototype.hasOwnProperty,g=e.exports=s;g.AssertionError=function(t){this.name="AssertionError",this.actual=t.actual,this.expected=t.expected,this.operator=t.operator,t.message?(this.message=t.message,this.generatedMessage=!1):(this.message=o(this),this.generatedMessage=!0);var e=t.stackStartFunction||a;if(Error.captureStackTrace)Error.captureStackTrace(this,e);else{var n=new Error;if(n.stack){var r=n.stack,i=e.name,s=r.indexOf("\n"+i);if(s>=0){var u=r.indexOf("\n",s+1);r=r.substring(u+1)}this.stack=r}}},h.inherits(g.AssertionError,Error),g.fail=a,g.ok=s,g.equal=function(t,e,n){t!=e&&a(t,e,n,"==",g.equal)},g.notEqual=function(t,e,n){t==e&&a(t,e,n,"!=",g.notEqual)},g.deepEqual=function(t,e,n){u(t,e)||a(t,e,n,"deepEqual",g.deepEqual)},g.notDeepEqual=function(t,e,n){u(t,e)&&a(t,e,n,"notDeepEqual",g.notDeepEqual)},g.strictEqual=function(t,e,n){t!==e&&a(t,e,n,"===",g.strictEqual)},g.notStrictEqual=function(t,e,n){t===e&&a(t,e,n,"!==",g.notStrictEqual)},g["throws"]=function(t,e,n){p.apply(this,[!0].concat(d.call(arguments)))},g.doesNotThrow=function(t,e){p.apply(this,[!1].concat(d.call(arguments)))},g.ifError=function(t){if(t)throw t};var y=Object.keys||function(t){var e=[];for(var n in t)v.call(t,n)&&e.push(n);return e}},{"util/":40}],30:[function(t,e,n){(function(n){function r(){}function i(){p.log.apply(p,arguments)}function o(){p.log.apply(p,arguments)}function a(){p.warn.apply(p,arguments)}function s(t){y[t]=v()}function u(t){var e=y[t];if(!e)throw new Error("No such label: "+t);var n=v()-e;p.log(t+": "+n+"ms")}function c(){var t=new Error;t.name="Trace",t.message=h.format.apply(null,arguments),p.error(t.stack)}function l(t){p.log(h.inspect(t)+"\n")}function f(t){if(!t){var e=g.call(arguments,1);d.ok(!1,h.format.apply(null,e))}}var p,h=t("util"),d=t("assert"),v=t("date-now"),g=Array.prototype.slice,y={};p="undefined"!=typeof n&&n.console?n.console:"undefined"!=typeof window&&window.console?window.console:{};for(var m=[[r,"log"],[i,"info"],[o,"warn"],[a,"error"],[s,"time"],[u,"timeEnd"],[c,"trace"],[l,"dir"],[f,"assert"]],b=0;b<m.length;b++){var _=m[b],x=_[0],w=_[1];p[w]||(p[w]=x)}e.exports=p}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{assert:29,"date-now":31,util:40}],31:[function(t,e,n){function r(){return(new Date).getTime()}e.exports=r},{}],32:[function(t,e,n){function r(){this._events=this._events||{},this._maxListeners=this._maxListeners||void 0}function i(t){return"function"==typeof t}function o(t){return"number"==typeof t}function a(t){return"object"==typeof t&&null!==t}function s(t){return void 0===t}e.exports=r,r.EventEmitter=r,r.prototype._events=void 0,r.prototype._maxListeners=void 0,r.defaultMaxListeners=10,r.prototype.setMaxListeners=function(t){if(!o(t)||0>t||isNaN(t))throw TypeError("n must be a positive number");return this._maxListeners=t,this},r.prototype.emit=function(t){var e,n,r,o,u,c;if(this._events||(this._events={}),"error"===t&&(!this._events.error||a(this._events.error)&&!this._events.error.length)){if(e=arguments[1],e instanceof Error)throw e;throw TypeError('Uncaught, unspecified "error" event.')}if(n=this._events[t],s(n))return!1;if(i(n))switch(arguments.length){case 1:n.call(this);break;case 2:n.call(this,arguments[1]);break;case 3:n.call(this,arguments[1],arguments[2]);break;default:for(r=arguments.length,o=new Array(r-1),u=1;r>u;u++)o[u-1]=arguments[u];n.apply(this,o)}else if(a(n)){for(r=arguments.length,o=new Array(r-1),u=1;r>u;u++)o[u-1]=arguments[u];for(c=n.slice(),r=c.length,u=0;r>u;u++)c[u].apply(this,o)}return!0},r.prototype.addListener=function(t,e){var n;if(!i(e))throw TypeError("listener must be a function");if(this._events||(this._events={}),this._events.newListener&&this.emit("newListener",t,i(e.listener)?e.listener:e),this._events[t]?a(this._events[t])?this._events[t].push(e):this._events[t]=[this._events[t],e]:this._events[t]=e,a(this._events[t])&&!this._events[t].warned){var n;n=s(this._maxListeners)?r.defaultMaxListeners:this._maxListeners,n&&n>0&&this._events[t].length>n&&(this._events[t].warned=!0,console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.",this._events[t].length),"function"==typeof console.trace&&console.trace())}return this},r.prototype.on=r.prototype.addListener,r.prototype.once=function(t,e){function n(){this.removeListener(t,n),r||(r=!0,e.apply(this,arguments))}if(!i(e))throw TypeError("listener must be a function");var r=!1;return n.listener=e,this.on(t,n),this},r.prototype.removeListener=function(t,e){var n,r,o,s;if(!i(e))throw TypeError("listener must be a function");if(!this._events||!this._events[t])return this;if(n=this._events[t],o=n.length,r=-1,n===e||i(n.listener)&&n.listener===e)delete this._events[t],this._events.removeListener&&this.emit("removeListener",t,e);else if(a(n)){for(s=o;s-->0;)if(n[s]===e||n[s].listener&&n[s].listener===e){r=s;break}if(0>r)return this;1===n.length?(n.length=0,delete this._events[t]):n.splice(r,1),this._events.removeListener&&this.emit("removeListener",t,e)}return this},r.prototype.removeAllListeners=function(t){
var e,n;if(!this._events)return this;if(!this._events.removeListener)return 0===arguments.length?this._events={}:this._events[t]&&delete this._events[t],this;if(0===arguments.length){for(e in this._events)"removeListener"!==e&&this.removeAllListeners(e);return this.removeAllListeners("removeListener"),this._events={},this}if(n=this._events[t],i(n))this.removeListener(t,n);else for(;n.length;)this.removeListener(t,n[n.length-1]);return delete this._events[t],this},r.prototype.listeners=function(t){var e;return e=this._events&&this._events[t]?i(this._events[t])?[this._events[t]]:this._events[t].slice():[]},r.listenerCount=function(t,e){var n;return n=t._events&&t._events[e]?i(t._events[e])?1:t._events[e].length:0}},{}],33:[function(t,e,n){"function"==typeof Object.create?e.exports=function(t,e){t.super_=e,t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}})}:e.exports=function(t,e){t.super_=e;var n=function(){};n.prototype=e.prototype,t.prototype=new n,t.prototype.constructor=t}},{}],34:[function(t,e,n){function r(){if(!s){s=!0;for(var t,e=a.length;e;){t=a,a=[];for(var n=-1;++n<e;)t[n]();e=a.length}s=!1}}function i(){}var o=e.exports={},a=[],s=!1;o.nextTick=function(t){a.push(t),s||setTimeout(r,0)},o.title="browser",o.browser=!0,o.env={},o.argv=[],o.version="",o.versions={},o.on=i,o.addListener=i,o.once=i,o.off=i,o.removeListener=i,o.removeAllListeners=i,o.emit=i,o.binding=function(t){throw new Error("process.binding is not supported")},o.cwd=function(){return"/"},o.chdir=function(t){throw new Error("process.chdir is not supported")},o.umask=function(){return 0}},{}],35:[function(t,e,n){(function(t){!function(r){function i(t){throw RangeError(T[t])}function o(t,e){for(var n=t.length;n--;)t[n]=e(t[n]);return t}function a(t,e){return o(t.split(R),e).join(".")}function s(t){for(var e,n,r=[],i=0,o=t.length;o>i;)e=t.charCodeAt(i++),e>=55296&&56319>=e&&o>i?(n=t.charCodeAt(i++),56320==(64512&n)?r.push(((1023&e)<<10)+(1023&n)+65536):(r.push(e),i--)):r.push(e);return r}function u(t){return o(t,function(t){var e="";return t>65535&&(t-=65536,e+=N(t>>>10&1023|55296),t=56320|1023&t),e+=N(t)}).join("")}function c(t){return 10>t-48?t-22:26>t-65?t-65:26>t-97?t-97:w}function l(t,e){return t+22+75*(26>t)-((0!=e)<<5)}function f(t,e,n){var r=0;for(t=n?D(t/k):t>>1,t+=D(t/e);t>q*A>>1;r+=w)t=D(t/q);return D(r+(q+1)*t/(t+O))}function p(t){var e,n,r,o,a,s,l,p,h,d,v=[],g=t.length,y=0,m=S,b=E;for(n=t.lastIndexOf(C),0>n&&(n=0),r=0;n>r;++r)t.charCodeAt(r)>=128&&i("not-basic"),v.push(t.charCodeAt(r));for(o=n>0?n+1:0;g>o;){for(a=y,s=1,l=w;o>=g&&i("invalid-input"),p=c(t.charCodeAt(o++)),(p>=w||p>D((x-y)/s))&&i("overflow"),y+=p*s,h=b>=l?j:l>=b+A?A:l-b,!(h>p);l+=w)d=w-h,s>D(x/d)&&i("overflow"),s*=d;e=v.length+1,b=f(y-a,e,0==a),D(y/e)>x-m&&i("overflow"),m+=D(y/e),y%=e,v.splice(y++,0,m)}return u(v)}function h(t){var e,n,r,o,a,u,c,p,h,d,v,g,y,m,b,_=[];for(t=s(t),g=t.length,e=S,n=0,a=E,u=0;g>u;++u)v=t[u],128>v&&_.push(N(v));for(r=o=_.length,o&&_.push(C);g>r;){for(c=x,u=0;g>u;++u)v=t[u],v>=e&&c>v&&(c=v);for(y=r+1,c-e>D((x-n)/y)&&i("overflow"),n+=(c-e)*y,e=c,u=0;g>u;++u)if(v=t[u],e>v&&++n>x&&i("overflow"),v==e){for(p=n,h=w;d=a>=h?j:h>=a+A?A:h-a,!(d>p);h+=w)b=p-d,m=w-d,_.push(N(l(d+b%m,0))),p=D(b/m);_.push(N(l(p,0))),a=f(n,y,r==o),n=0,++r}++n,++e}return _.join("")}function d(t){return a(t,function(t){return I.test(t)?p(t.slice(4).toLowerCase()):t})}function v(t){return a(t,function(t){return L.test(t)?"xn--"+h(t):t})}var g="object"==typeof n&&n,y="object"==typeof e&&e&&e.exports==g&&e,m="object"==typeof t&&t;(m.global===m||m.window===m)&&(r=m);var b,_,x=2147483647,w=36,j=1,A=26,O=38,k=700,E=72,S=128,C="-",I=/^xn--/,L=/[^ -~]/,R=/\x2E|\u3002|\uFF0E|\uFF61/g,T={overflow:"Overflow: input needs wider integers to process","not-basic":"Illegal input >= 0x80 (not a basic code point)","invalid-input":"Invalid input"},q=w-j,D=Math.floor,N=String.fromCharCode;if(b={version:"1.2.4",ucs2:{decode:s,encode:u},decode:p,encode:h,toASCII:v,toUnicode:d},"function"==typeof define&&"object"==typeof define.amd&&define.amd)define("punycode",function(){return b});else if(g&&!g.nodeType)if(y)y.exports=b;else for(_ in b)b.hasOwnProperty(_)&&(g[_]=b[_]);else r.punycode=b}(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],36:[function(t,e,n){"use strict";function r(t,e){return Object.prototype.hasOwnProperty.call(t,e)}e.exports=function(t,e,n,o){e=e||"&",n=n||"=";var a={};if("string"!=typeof t||0===t.length)return a;var s=/\+/g;t=t.split(e);var u=1e3;o&&"number"==typeof o.maxKeys&&(u=o.maxKeys);var c=t.length;u>0&&c>u&&(c=u);for(var l=0;c>l;++l){var f,p,h,d,v=t[l].replace(s,"%20"),g=v.indexOf(n);g>=0?(f=v.substr(0,g),p=v.substr(g+1)):(f=v,p=""),h=decodeURIComponent(f),d=decodeURIComponent(p),r(a,h)?i(a[h])?a[h].push(d):a[h]=[a[h],d]:a[h]=d}return a};var i=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)}},{}],37:[function(t,e,n){"use strict";function r(t,e){if(t.map)return t.map(e);for(var n=[],r=0;r<t.length;r++)n.push(e(t[r],r));return n}var i=function(t){switch(typeof t){case"string":return t;case"boolean":return t?"true":"false";case"number":return isFinite(t)?t:"";default:return""}};e.exports=function(t,e,n,s){return e=e||"&",n=n||"=",null===t&&(t=void 0),"object"==typeof t?r(a(t),function(a){var s=encodeURIComponent(i(a))+n;return o(t[a])?r(t[a],function(t){return s+encodeURIComponent(i(t))}).join(e):s+encodeURIComponent(i(t[a]))}).join(e):s?encodeURIComponent(i(s))+n+encodeURIComponent(i(t)):""};var o=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)},a=Object.keys||function(t){var e=[];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&e.push(n);return e}},{}],38:[function(t,e,n){"use strict";n.decode=n.parse=t("./decode"),n.encode=n.stringify=t("./encode")},{"./decode":36,"./encode":37}],39:[function(t,e,n){e.exports=function(t){return t&&"object"==typeof t&&"function"==typeof t.copy&&"function"==typeof t.fill&&"function"==typeof t.readUInt8}},{}],40:[function(t,e,n){(function(e,r){function i(t,e){var r={seen:[],stylize:a};return arguments.length>=3&&(r.depth=arguments[2]),arguments.length>=4&&(r.colors=arguments[3]),v(e)?r.showHidden=e:e&&n._extend(r,e),x(r.showHidden)&&(r.showHidden=!1),x(r.depth)&&(r.depth=2),x(r.colors)&&(r.colors=!1),x(r.customInspect)&&(r.customInspect=!0),r.colors&&(r.stylize=o),u(r,t,r.depth)}function o(t,e){var n=i.styles[e];return n?"["+i.colors[n][0]+"m"+t+"["+i.colors[n][1]+"m":t}function a(t,e){return t}function s(t){var e={};return t.forEach(function(t,n){e[t]=!0}),e}function u(t,e,r){if(t.customInspect&&e&&k(e.inspect)&&e.inspect!==n.inspect&&(!e.constructor||e.constructor.prototype!==e)){var i=e.inspect(r,t);return b(i)||(i=u(t,i,r)),i}var o=c(t,e);if(o)return o;var a=Object.keys(e),v=s(a);if(t.showHidden&&(a=Object.getOwnPropertyNames(e)),O(e)&&(a.indexOf("message")>=0||a.indexOf("description")>=0))return l(e);if(0===a.length){if(k(e)){var g=e.name?": "+e.name:"";return t.stylize("[Function"+g+"]","special")}if(w(e))return t.stylize(RegExp.prototype.toString.call(e),"regexp");if(A(e))return t.stylize(Date.prototype.toString.call(e),"date");if(O(e))return l(e)}var y="",m=!1,_=["{","}"];if(d(e)&&(m=!0,_=["[","]"]),k(e)){var x=e.name?": "+e.name:"";y=" [Function"+x+"]"}if(w(e)&&(y=" "+RegExp.prototype.toString.call(e)),A(e)&&(y=" "+Date.prototype.toUTCString.call(e)),O(e)&&(y=" "+l(e)),0===a.length&&(!m||0==e.length))return _[0]+y+_[1];if(0>r)return w(e)?t.stylize(RegExp.prototype.toString.call(e),"regexp"):t.stylize("[Object]","special");t.seen.push(e);var j;return j=m?f(t,e,r,v,a):a.map(function(n){return p(t,e,r,v,n,m)}),t.seen.pop(),h(j,y,_)}function c(t,e){if(x(e))return t.stylize("undefined","undefined");if(b(e)){var n="'"+JSON.stringify(e).replace(/^"|"$/g,"").replace(/'/g,"\\'").replace(/\\"/g,'"')+"'";return t.stylize(n,"string")}return m(e)?t.stylize(""+e,"number"):v(e)?t.stylize(""+e,"boolean"):g(e)?t.stylize("null","null"):void 0}function l(t){return"["+Error.prototype.toString.call(t)+"]"}function f(t,e,n,r,i){for(var o=[],a=0,s=e.length;s>a;++a)o.push(L(e,String(a))?p(t,e,n,r,String(a),!0):"");return i.forEach(function(i){i.match(/^\d+$/)||o.push(p(t,e,n,r,i,!0))}),o}function p(t,e,n,r,i,o){var a,s,c;if(c=Object.getOwnPropertyDescriptor(e,i)||{value:e[i]},c.get?s=c.set?t.stylize("[Getter/Setter]","special"):t.stylize("[Getter]","special"):c.set&&(s=t.stylize("[Setter]","special")),L(r,i)||(a="["+i+"]"),s||(t.seen.indexOf(c.value)<0?(s=g(n)?u(t,c.value,null):u(t,c.value,n-1),s.indexOf("\n")>-1&&(s=o?s.split("\n").map(function(t){return"  "+t}).join("\n").substr(2):"\n"+s.split("\n").map(function(t){return"   "+t}).join("\n"))):s=t.stylize("[Circular]","special")),x(a)){if(o&&i.match(/^\d+$/))return s;a=JSON.stringify(""+i),a.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)?(a=a.substr(1,a.length-2),a=t.stylize(a,"name")):(a=a.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'"),a=t.stylize(a,"string"))}return a+": "+s}function h(t,e,n){var r=0,i=t.reduce(function(t,e){return r++,e.indexOf("\n")>=0&&r++,t+e.replace(/\u001b\[\d\d?m/g,"").length+1},0);return i>60?n[0]+(""===e?"":e+"\n ")+" "+t.join(",\n  ")+" "+n[1]:n[0]+e+" "+t.join(", ")+" "+n[1]}function d(t){return Array.isArray(t)}function v(t){return"boolean"==typeof t}function g(t){return null===t}function y(t){return null==t}function m(t){return"number"==typeof t}function b(t){return"string"==typeof t}function _(t){return"symbol"==typeof t}function x(t){return void 0===t}function w(t){return j(t)&&"[object RegExp]"===S(t)}function j(t){return"object"==typeof t&&null!==t}function A(t){return j(t)&&"[object Date]"===S(t)}function O(t){return j(t)&&("[object Error]"===S(t)||t instanceof Error)}function k(t){return"function"==typeof t}function E(t){return null===t||"boolean"==typeof t||"number"==typeof t||"string"==typeof t||"symbol"==typeof t||"undefined"==typeof t}function S(t){return Object.prototype.toString.call(t)}function C(t){return 10>t?"0"+t.toString(10):t.toString(10)}function I(){var t=new Date,e=[C(t.getHours()),C(t.getMinutes()),C(t.getSeconds())].join(":");return[t.getDate(),D[t.getMonth()],e].join(" ")}function L(t,e){return Object.prototype.hasOwnProperty.call(t,e)}var R=/%[sdj%]/g;n.format=function(t){if(!b(t)){for(var e=[],n=0;n<arguments.length;n++)e.push(i(arguments[n]));return e.join(" ")}for(var n=1,r=arguments,o=r.length,a=String(t).replace(R,function(t){if("%%"===t)return"%";if(n>=o)return t;switch(t){case"%s":return String(r[n++]);case"%d":return Number(r[n++]);case"%j":try{return JSON.stringify(r[n++])}catch(e){return"[Circular]"}default:return t}}),s=r[n];o>n;s=r[++n])a+=g(s)||!j(s)?" "+s:" "+i(s);return a},n.deprecate=function(t,i){function o(){if(!a){if(e.throwDeprecation)throw new Error(i);e.traceDeprecation?console.trace(i):console.error(i),a=!0}return t.apply(this,arguments)}if(x(r.process))return function(){return n.deprecate(t,i).apply(this,arguments)};if(e.noDeprecation===!0)return t;var a=!1;return o};var T,q={};n.debuglog=function(t){if(x(T)&&(T=e.env.NODE_DEBUG||""),t=t.toUpperCase(),!q[t])if(new RegExp("\\b"+t+"\\b","i").test(T)){var r=e.pid;q[t]=function(){var e=n.format.apply(n,arguments);console.error("%s %d: %s",t,r,e)}}else q[t]=function(){};return q[t]},n.inspect=i,i.colors={bold:[1,22],italic:[3,23],underline:[4,24],inverse:[7,27],white:[37,39],grey:[90,39],black:[30,39],blue:[34,39],cyan:[36,39],green:[32,39],magenta:[35,39],red:[31,39],yellow:[33,39]},i.styles={special:"cyan",number:"yellow","boolean":"yellow",undefined:"grey","null":"bold",string:"green",date:"magenta",regexp:"red"},n.isArray=d,n.isBoolean=v,n.isNull=g,n.isNullOrUndefined=y,n.isNumber=m,n.isString=b,n.isSymbol=_,n.isUndefined=x,n.isRegExp=w,n.isObject=j,n.isDate=A,n.isError=O,n.isFunction=k,n.isPrimitive=E,n.isBuffer=t("./support/isBuffer");var D=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];n.log=function(){console.log("%s - %s",I(),n.format.apply(n,arguments))},n.inherits=t("inherits"),n._extend=function(t,e){if(!e||!j(e))return t;for(var n=Object.keys(e),r=n.length;r--;)t[n[r]]=e[n[r]];return t}}).call(this,t("_process"),"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./support/isBuffer":39,_process:34,inherits:33}],41:[function(t,e,n){var n=e.exports=function(t){t||(t={}),"string"==typeof t&&(t={cookie:t}),void 0===t.cookie&&(t.cookie="");var e={};return e.get=function(e){for(var n=t.cookie.split(/;\s*/),r=0;r<n.length;r++){var i=n[r].split("="),o=unescape(i[0]);if(o===e)return unescape(i[1])}return void 0},e.set=function(e,n,r){r||(r={});var i=escape(e)+"="+escape(n);return r.expires&&(i+="; expires="+r.expires),r.path&&(i+="; path="+escape(r.path)),t.cookie=i,i},e};if("undefined"!=typeof document){var r=n(document);n.get=r.get,n.set=r.set}},{}],42:[function(t,e,n){!function(t,n){"undefined"!=typeof e?e.exports=n():"function"==typeof define&&"object"==typeof define.amd?define(n):this[t]=n()}("domready",function(t){function e(t){for(h=1;t=r.shift();)t()}var n,r=[],i=!1,o=document,a=o.documentElement,s=a.doScroll,u="DOMContentLoaded",c="addEventListener",l="onreadystatechange",f="readyState",p=s?/^loaded|^c/:/^loaded|c/,h=p.test(o[f]);return o[c]&&o[c](u,n=function(){o.removeEventListener(u,n,i),e()},i),s&&o.attachEvent(l,n=function(){/^c/.test(o[f])&&(o.detachEvent(l,n),e())}),t=s?function(e){self!=top?h?e():r.push(e):function(){try{a.doScroll("left")}catch(n){return setTimeout(function(){t(e)},50)}e()}()}:function(t){h?t():r.push(t)}})},{}],43:[function(t,e,n){function r(t,e,n){if(!s(e))throw new TypeError("iterator must be a function");arguments.length<3&&(n=this),"[object Array]"===u.call(t)?i(t,e,n):"string"==typeof t?o(t,e,n):a(t,e,n)}function i(t,e,n){for(var r=0,i=t.length;i>r;r++)c.call(t,r)&&e.call(n,t[r],r,t)}function o(t,e,n){for(var r=0,i=t.length;i>r;r++)e.call(n,t.charAt(r),r,t)}function a(t,e,n){for(var r in t)c.call(t,r)&&e.call(n,t[r],r,t)}var s=t("is-function");e.exports=r;var u=Object.prototype.toString,c=Object.prototype.hasOwnProperty},{"is-function":45}],44:[function(t,e,n){(function(t){"undefined"!=typeof window?e.exports=window:"undefined"!=typeof t?e.exports=t:"undefined"!=typeof self?e.exports=self:e.exports={}}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],45:[function(t,e,n){function r(t){var e=i.call(t);return"[object Function]"===e||"function"==typeof t&&"[object RegExp]"!==e||"undefined"!=typeof window&&(t===window.setTimeout||t===window.alert||t===window.confirm||t===window.prompt)}e.exports=r;var i=Object.prototype.toString},{}],46:[function(t,e,n){function r(t,e,n){var r=t?t.length:0;return n&&o(t,e,n)&&(e=!1),r?i(t,e):[]}var i=t("../internal/baseFlatten"),o=t("../internal/isIterateeCall");e.exports=r},{"../internal/baseFlatten":68,"../internal/isIterateeCall":113}],47:[function(t,e,n){function r(t){var e=t?t.length:0;return e?t[e-1]:void 0}e.exports=r},{}],48:[function(t,e,n){e.exports=t("./zipObject")},{"./zipObject":49}],49:[function(t,e,n){function r(t,e){var n=-1,r=t?t.length:0,o={};for(!r||e||i(t[0])||(e=[]);++n<r;){var a=t[n];e?o[a]=e[n]:a&&(o[a[0]]=a[1])}return o}var i=t("../lang/isArray");e.exports=r},{"../lang/isArray":133}],50:[function(t,e,n){function r(t){if(u(t)&&!s(t)&&!(t instanceof i)){if(t instanceof o)return t;if(f.call(t,"__chain__")&&f.call(t,"__wrapped__"))return c(t)}return new o(t)}var i=t("../internal/LazyWrapper"),o=t("../internal/LodashWrapper"),a=t("../internal/baseLodash"),s=t("../lang/isArray"),u=t("../internal/isObjectLike"),c=t("../internal/wrapperClone"),l=Object.prototype,f=l.hasOwnProperty;r.prototype=a.prototype,e.exports=r},{"../internal/LazyWrapper":55,"../internal/LodashWrapper":56,"../internal/baseLodash":76,"../internal/isObjectLike":117,"../internal/wrapperClone":130,"../lang/isArray":133}],51:[function(t,e,n){var r=t("../internal/getNative"),i=r(Date,"now"),o=i||function(){return(new Date).getTime()};e.exports=o},{"../internal/getNative":107}],52:[function(t,e,n){var r=t("../internal/createWrapper"),i=t("../internal/replaceHolders"),o=t("./restParam"),a=1,s=32,u=o(function(t,e,n){var o=a;if(n.length){var c=i(n,u.placeholder);o|=s}return r(t,o,e,n,c)});u.placeholder={},e.exports=u},{"../internal/createWrapper":98,"../internal/replaceHolders":125,"./restParam":53}],53:[function(t,e,n){function r(t,e){if("function"!=typeof t)throw new TypeError(i);return e=o(void 0===e?t.length-1:+e||0,0),function(){for(var n=arguments,r=-1,i=o(n.length-e,0),a=Array(i);++r<i;)a[r]=n[e+r];switch(e){case 0:return t.call(this,a);case 1:return t.call(this,n[0],a);case 2:return t.call(this,n[0],n[1],a)}var s=Array(e+1);for(r=-1;++r<e;)s[r]=n[r];return s[e]=a,t.apply(this,s)}}var i="Expected a function",o=Math.max;e.exports=r},{}],54:[function(t,e,n){(function(t){(function(){function r(t,e){if(t!==e){var n=null===t,r=t===O,i=t===t,o=null===e,a=e===O,s=e===e;if(t>e&&!o||!i||n&&!a&&s||r&&s)return 1;if(e>t&&!n||!s||o&&!r&&i||a&&i)return-1}return 0}function i(t,e,n){for(var r=t.length,i=n?r:-1;n?i--:++i<r;)if(e(t[i],i,t))return i;return-1}function o(t,e,n){if(e!==e)return g(t,n);for(var r=n-1,i=t.length;++r<i;)if(t[r]===e)return r;return-1}function a(t){return"function"==typeof t||!1}function s(t){return null==t?"":t+""}function u(t,e){for(var n=-1,r=t.length;++n<r&&e.indexOf(t.charAt(n))>-1;);return n}function c(t,e){for(var n=t.length;n--&&e.indexOf(t.charAt(n))>-1;);return n}function l(t,e){return r(t.criteria,e.criteria)||t.index-e.index}function f(t,e,n){for(var i=-1,o=t.criteria,a=e.criteria,s=o.length,u=n.length;++i<s;){var c=r(o[i],a[i]);if(c){if(i>=u)return c;var l=n[i];return c*("asc"===l||l===!0?1:-1)}}return t.index-e.index}function p(t){return Vt[t]}function h(t){return $t[t]}function d(t,e,n){return e?t=Jt[t]:n&&(t=Gt[t]),"\\"+t}function v(t){return"\\"+Gt[t]}function g(t,e,n){for(var r=t.length,i=e+(n?0:-1);n?i--:++i<r;){var o=t[i];if(o!==o)return i}return-1}function y(t){return!!t&&"object"==typeof t}function m(t){return 160>=t&&t>=9&&13>=t||32==t||160==t||5760==t||6158==t||t>=8192&&(8202>=t||8232==t||8233==t||8239==t||8287==t||12288==t||65279==t)}function b(t,e){for(var n=-1,r=t.length,i=-1,o=[];++n<r;)t[n]===e&&(t[n]=V,o[++i]=n);return o}function _(t,e){for(var n,r=-1,i=t.length,o=-1,a=[];++r<i;){var s=t[r],u=e?e(s,r,t):s;r&&n===u||(n=u,a[++o]=s)}return a}function x(t){for(var e=-1,n=t.length;++e<n&&m(t.charCodeAt(e)););return e}function w(t){for(var e=t.length;e--&&m(t.charCodeAt(e)););return e}function j(t){return Ht[t]}function A(t){function e(t){if(y(t)&&!Cs(t)&&!(t instanceof Z)){if(t instanceof m)return t;if(ea.call(t,"__chain__")&&ea.call(t,"__wrapped__"))return hr(t)}return new m(t)}function n(){}function m(t,e,n){this.__wrapped__=t,this.__actions__=n||[],this.__chain__=!!e}function Z(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=Sa,this.__views__=[]}function et(){var t=new Z(this.__wrapped__);return t.__actions__=te(this.__actions__),t.__dir__=this.__dir__,t.__filtered__=this.__filtered__,t.__iteratees__=te(this.__iteratees__),t.__takeCount__=this.__takeCount__,t.__views__=te(this.__views__),t}function rt(){if(this.__filtered__){var t=new Z(this);t.__dir__=-1,t.__filtered__=!0}else t=this.clone(),t.__dir__*=-1;return t}function Vt(){var t=this.__wrapped__.value(),e=this.__dir__,n=Cs(t),r=0>e,i=n?t.length:0,o=Hn(0,i,this.__views__),a=o.start,s=o.end,u=s-a,c=r?s:a-1,l=this.__iteratees__,f=l.length,p=0,h=ja(u,this.__takeCount__);if(!n||M>i||i==u&&h==u)return nn(r&&n?t.reverse():t,this.__actions__);var d=[];t:for(;u--&&h>p;){c+=e;for(var v=-1,g=t[c];++v<f;){var y=l[v],m=y.iteratee,b=y.type,_=m(g);if(b==B)g=_;else if(!_){if(b==z)continue t;break t}}d[p++]=g}return d}function $t(){this.__data__={}}function Ht(t){return this.has(t)&&delete this.__data__[t]}function Kt(t){return"__proto__"==t?O:this.__data__[t]}function Jt(t){return"__proto__"!=t&&ea.call(this.__data__,t)}function Gt(t,e){return"__proto__"!=t&&(this.__data__[t]=e),this}function Xt(t){var e=t?t.length:0;for(this.data={hash:ya(null),set:new fa};e--;)this.push(t[e])}function Zt(t,e){var n=t.data,r="string"==typeof e||qi(e)?n.set.has(e):n.hash[e];return r?0:-1}function Yt(t){var e=this.data;"string"==typeof t||qi(t)?e.set.add(t):e.hash[t]=!0}function Qt(t,e){for(var n=-1,r=t.length,i=-1,o=e.length,a=zo(r+o);++n<r;)a[n]=t[n];for(;++i<o;)a[n++]=e[i];return a}function te(t,e){var n=-1,r=t.length;for(e||(e=zo(r));++n<r;)e[n]=t[n];return e}function ee(t,e){for(var n=-1,r=t.length;++n<r&&e(t[n],n,t)!==!1;);return t}function ie(t,e){for(var n=t.length;n--&&e(t[n],n,t)!==!1;);return t}function oe(t,e){for(var n=-1,r=t.length;++n<r;)if(!e(t[n],n,t))return!1;return!0}function ae(t,e,n,r){for(var i=-1,o=t.length,a=r,s=a;++i<o;){var u=t[i],c=+e(u);n(c,a)&&(a=c,s=u)}return s}function se(t,e){for(var n=-1,r=t.length,i=-1,o=[];++n<r;){var a=t[n];e(a,n,t)&&(o[++i]=a)}return o}function ue(t,e){for(var n=-1,r=t.length,i=zo(r);++n<r;)i[n]=e(t[n],n,t);return i}function ce(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}function le(t,e,n,r){var i=-1,o=t.length;for(r&&o&&(n=t[++i]);++i<o;)n=e(n,t[i],i,t);return n}function fe(t,e,n,r){var i=t.length;for(r&&i&&(n=t[--i]);i--;)n=e(n,t[i],i,t);return n}function pe(t,e){for(var n=-1,r=t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}function he(t,e){for(var n=t.length,r=0;n--;)r+=+e(t[n])||0;return r}function de(t,e){return t===O?e:t}function ve(t,e,n,r){return t!==O&&ea.call(r,n)?t:e}function ge(t,e,n){for(var r=-1,i=Ms(e),o=i.length;++r<o;){var a=i[r],s=t[a],u=n(s,e[a],a,t,e);(u===u?u===s:s!==s)&&(s!==O||a in t)||(t[a]=u)}return t}function ye(t,e){return null==e?t:be(e,Ms(e),t)}function me(t,e){for(var n=-1,r=null==t,i=!r&&Zn(t),o=i?t.length:0,a=e.length,s=zo(a);++n<a;){var u=e[n];i?s[n]=Yn(u,o)?t[u]:O:s[n]=r?O:t[u]}return s}function be(t,e,n){n||(n={});for(var r=-1,i=e.length;++r<i;){var o=e[r];n[o]=t[o]}return n}function _e(t,e,n){var r=typeof t;return"function"==r?e===O?t:an(t,e,n):null==t?So:"object"==r?Fe(t):e===O?qo(t):Me(t,e)}function xe(t,e,n,r,i,o,a){var s;if(n&&(s=i?n(t,r,i):n(t)),s!==O)return s;if(!qi(t))return t;var u=Cs(t);if(u){if(s=Kn(t),!e)return te(t,s)}else{var c=ra.call(t),l=c==X;if(c!=Q&&c!=$&&(!l||i))return Wt[c]?Gn(t,c,e):i?t:{};if(s=Jn(l?{}:t),!e)return ye(s,t)}o||(o=[]),a||(a=[]);for(var f=o.length;f--;)if(o[f]==t)return a[f];return o.push(t),a.push(s),(u?ee:Le)(t,function(r,i){s[i]=xe(r,e,n,i,t,o,a)}),s}function we(t,e,n){if("function"!=typeof t)throw new Xo(W);return pa(function(){t.apply(O,n)},e)}function je(t,e){var n=t?t.length:0,r=[];if(!n)return r;var i=-1,a=Wn(),s=a==o,u=s&&e.length>=M?vn(e):null,c=e.length;u&&(a=Zt,s=!1,e=u);t:for(;++i<n;){var l=t[i];if(s&&l===l){for(var f=c;f--;)if(e[f]===l)continue t;r.push(l)}else a(e,l,0)<0&&r.push(l)}return r}function Ae(t,e){var n=!0;return Na(t,function(t,r,i){return n=!!e(t,r,i)}),n}function Oe(t,e,n,r){var i=r,o=i;return Na(t,function(t,a,s){var u=+e(t,a,s);(n(u,i)||u===r&&u===o)&&(i=u,o=t)}),o}function ke(t,e,n,r){var i=t.length;for(n=null==n?0:+n||0,0>n&&(n=-n>i?0:i+n),r=r===O||r>i?i:+r||0,0>r&&(r+=i),i=n>r?0:r>>>0,n>>>=0;i>n;)t[n++]=e;return t}function Ee(t,e){var n=[];return Na(t,function(t,r,i){e(t,r,i)&&n.push(t)}),n}function Se(t,e,n,r){var i;return n(t,function(t,n,o){return e(t,n,o)?(i=r?n:t,!1):void 0}),i}function Ce(t,e,n,r){r||(r=[]);for(var i=-1,o=t.length;++i<o;){var a=t[i];y(a)&&Zn(a)&&(n||Cs(a)||Oi(a))?e?Ce(a,e,n,r):ce(r,a):n||(r[r.length]=a)}return r}function Ie(t,e){return Pa(t,e,to)}function Le(t,e){return Pa(t,e,Ms)}function Re(t,e){return Fa(t,e,Ms)}function Te(t,e){for(var n=-1,r=e.length,i=-1,o=[];++n<r;){var a=e[n];Ti(t[a])&&(o[++i]=a)}return o}function qe(t,e,n){if(null!=t){n!==O&&n in fr(t)&&(e=[n]);for(var r=0,i=e.length;null!=t&&i>r;)t=t[e[r++]];return r&&r==i?t:O}}function De(t,e,n,r,i,o){return t===e?!0:null==t||null==e||!qi(t)&&!y(e)?t!==t&&e!==e:Ne(t,e,De,n,r,i,o)}function Ne(t,e,n,r,i,o,a){var s=Cs(t),u=Cs(e),c=H,l=H;s||(c=ra.call(t),c==$?c=Q:c!=Q&&(s=Wi(t))),u||(l=ra.call(e),l==$?l=Q:l!=Q&&(u=Wi(e)));var f=c==Q,p=l==Q,h=c==l;if(h&&!s&&!f)return Fn(t,e,c);if(!i){var d=f&&ea.call(t,"__wrapped__"),v=p&&ea.call(e,"__wrapped__");if(d||v)return n(d?t.value():t,v?e.value():e,r,i,o,a)}if(!h)return!1;o||(o=[]),a||(a=[]);for(var g=o.length;g--;)if(o[g]==t)return a[g]==e;o.push(t),a.push(e);var y=(s?Pn:Mn)(t,e,n,r,i,o,a);return o.pop(),a.pop(),y}function Ue(t,e,n){var r=e.length,i=r,o=!n;if(null==t)return!i;for(t=fr(t);r--;){var a=e[r];if(o&&a[2]?a[1]!==t[a[0]]:!(a[0]in t))return!1}for(;++r<i;){a=e[r];var s=a[0],u=t[s],c=a[1];if(o&&a[2]){if(u===O&&!(s in t))return!1}else{var l=n?n(u,c,s):O;if(!(l===O?De(c,u,n,!0):l))return!1}}return!0}function Pe(t,e){var n=-1,r=Zn(t)?zo(t.length):[];return Na(t,function(t,i,o){r[++n]=e(t,i,o)}),r}function Fe(t){var e=Vn(t);if(1==e.length&&e[0][2]){var n=e[0][0],r=e[0][1];return function(t){return null==t?!1:t[n]===r&&(r!==O||n in fr(t))}}return function(t){return Ue(t,e)}}function Me(t,e){var n=Cs(t),r=tr(t)&&rr(e),i=t+"";return t=pr(t),function(o){if(null==o)return!1;var a=i;if(o=fr(o),!(!n&&r||a in o)){if(o=1==t.length?o:qe(o,Je(t,0,-1)),null==o)return!1;a=kr(t),o=fr(o)}return o[a]===e?e!==O||a in o:De(e,o[a],O,!0)}}function ze(t,e,n,r,i){if(!qi(t))return t;var o=Zn(e)&&(Cs(e)||Wi(e)),a=o?O:Ms(e);return ee(a||e,function(s,u){if(a&&(u=s,s=e[u]),y(s))r||(r=[]),i||(i=[]),Be(t,e,u,ze,n,r,i);else{var c=t[u],l=n?n(c,s,u,t,e):O,f=l===O;f&&(l=s),l===O&&(!o||u in t)||!f&&(l===l?l===c:c!==c)||(t[u]=l)}}),t}function Be(t,e,n,r,i,o,a){for(var s=o.length,u=e[n];s--;)if(o[s]==u)return void(t[n]=a[s]);var c=t[n],l=i?i(c,u,n,t,e):O,f=l===O;f&&(l=u,Zn(u)&&(Cs(u)||Wi(u))?l=Cs(c)?c:Zn(c)?te(c):[]:Mi(u)||Oi(u)?l=Oi(c)?Ji(c):Mi(c)?c:{}:f=!1),o.push(u),a.push(l),f?t[n]=r(l,u,i,o,a):(l===l?l!==c:c===c)&&(t[n]=l)}function We(t){return function(e){return null==e?O:e[t]}}function Ve(t){var e=t+"";return t=pr(t),function(n){return qe(n,t,e)}}function $e(t,e){for(var n=t?e.length:0;n--;){var r=e[n];if(r!=i&&Yn(r)){var i=r;ha.call(t,r,1)}}return t}function He(t,e){return t+ma(ka()*(e-t+1))}function Ke(t,e,n,r,i){return i(t,function(t,i,o){n=r?(r=!1,t):e(n,t,i,o)}),n}function Je(t,e,n){var r=-1,i=t.length;e=null==e?0:+e||0,0>e&&(e=-e>i?0:i+e),n=n===O||n>i?i:+n||0,0>n&&(n+=i),i=e>n?0:n-e>>>0,e>>>=0;for(var o=zo(i);++r<i;)o[r]=t[r+e];return o}function Ge(t,e){var n;return Na(t,function(t,r,i){return n=e(t,r,i),!n}),!!n}function Xe(t,e){var n=t.length;for(t.sort(e);n--;)t[n]=t[n].value;return t}function Ze(t,e,n){var r=zn(),i=-1;e=ue(e,function(t){return r(t)});var o=Pe(t,function(t){var n=ue(e,function(e){return e(t)});return{criteria:n,index:++i,value:t}});return Xe(o,function(t,e){return f(t,e,n)})}function Ye(t,e){var n=0;return Na(t,function(t,r,i){n+=+e(t,r,i)||0}),n}function Qe(t,e){var n=-1,r=Wn(),i=t.length,a=r==o,s=a&&i>=M,u=s?vn():null,c=[];u?(r=Zt,a=!1):(s=!1,u=e?[]:c);t:for(;++n<i;){var l=t[n],f=e?e(l,n,t):l;if(a&&l===l){for(var p=u.length;p--;)if(u[p]===f)continue t;e&&u.push(f),c.push(l)}else r(u,f,0)<0&&((e||s)&&u.push(f),c.push(l))}return c}function tn(t,e){for(var n=-1,r=e.length,i=zo(r);++n<r;)i[n]=t[e[n]];return i}function en(t,e,n,r){for(var i=t.length,o=r?i:-1;(r?o--:++o<i)&&e(t[o],o,t););return n?Je(t,r?0:o,r?o+1:i):Je(t,r?o+1:0,r?i:o)}function nn(t,e){var n=t;n instanceof Z&&(n=n.value());for(var r=-1,i=e.length;++r<i;){var o=e[r];n=o.func.apply(o.thisArg,ce([n],o.args))}return n}function rn(t,e,n){var r=0,i=t?t.length:r;if("number"==typeof e&&e===e&&La>=i){for(;i>r;){var o=r+i>>>1,a=t[o];(n?e>=a:e>a)&&null!==a?r=o+1:i=o}return i}return on(t,e,So,n)}function on(t,e,n,r){e=n(e);for(var i=0,o=t?t.length:0,a=e!==e,s=null===e,u=e===O;o>i;){var c=ma((i+o)/2),l=n(t[c]),f=l!==O,p=l===l;if(a)var h=p||r;else h=s?p&&f&&(r||null!=l):u?p&&(r||f):null==l?!1:r?e>=l:e>l;h?i=c+1:o=c}return ja(o,Ia)}function an(t,e,n){if("function"!=typeof t)return So;if(e===O)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 3:return function(n,r,i){return t.call(e,n,r,i)};case 4:return function(n,r,i,o){return t.call(e,n,r,i,o)};case 5:return function(n,r,i,o,a){return t.call(e,n,r,i,o,a)}}return function(){return t.apply(e,arguments)}}function sn(t){var e=new aa(t.byteLength),n=new da(e);return n.set(new da(t)),e}function un(t,e,n){for(var r=n.length,i=-1,o=wa(t.length-r,0),a=-1,s=e.length,u=zo(s+o);++a<s;)u[a]=e[a];for(;++i<r;)u[n[i]]=t[i];for(;o--;)u[a++]=t[i++];return u}function cn(t,e,n){for(var r=-1,i=n.length,o=-1,a=wa(t.length-i,0),s=-1,u=e.length,c=zo(a+u);++o<a;)c[o]=t[o];for(var l=o;++s<u;)c[l+s]=e[s];for(;++r<i;)c[l+n[r]]=t[o++];return c}function ln(t,e){return function(n,r,i){var o=e?e():{};if(r=zn(r,i,3),Cs(n))for(var a=-1,s=n.length;++a<s;){var u=n[a];t(o,u,r(u,a,n),n)}else Na(n,function(e,n,i){t(o,e,r(e,n,i),i)});return o}}function fn(t){return yi(function(e,n){var r=-1,i=null==e?0:n.length,o=i>2?n[i-2]:O,a=i>2?n[2]:O,s=i>1?n[i-1]:O;for("function"==typeof o?(o=an(o,s,5),i-=2):(o="function"==typeof s?s:O,i-=o?1:0),a&&Qn(n[0],n[1],a)&&(o=3>i?O:o,i=1);++r<i;){var u=n[r];u&&t(e,u,o)}return e})}function pn(t,e){return function(n,r){var i=n?Ba(n):0;if(!nr(i))return t(n,r);for(var o=e?i:-1,a=fr(n);(e?o--:++o<i)&&r(a[o],o,a)!==!1;);return n}}function hn(t){return function(e,n,r){for(var i=fr(e),o=r(e),a=o.length,s=t?a:-1;t?s--:++s<a;){var u=o[s];if(n(i[u],u,i)===!1)break}return e}}function dn(t,e){function n(){var i=this&&this!==ne&&this instanceof n?r:t;return i.apply(e,arguments)}var r=yn(t);return n}function vn(t){return ya&&fa?new Xt(t):null}function gn(t){return function(e){for(var n=-1,r=Oo(lo(e)),i=r.length,o="";++n<i;)o=t(o,r[n],n);return o}}function yn(t){return function(){var e=arguments;switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3]);case 5:return new t(e[0],e[1],e[2],e[3],e[4]);case 6:return new t(e[0],e[1],e[2],e[3],e[4],e[5]);case 7:return new t(e[0],e[1],e[2],e[3],e[4],e[5],e[6])}var n=Da(t.prototype),r=t.apply(n,e);return qi(r)?r:n}}function mn(t){function e(n,r,i){i&&Qn(n,r,i)&&(r=O);var o=Un(n,t,O,O,O,O,O,r);return o.placeholder=e.placeholder,o}return e}function bn(t,e){return yi(function(n){var r=n[0];return null==r?r:(n.push(e),t.apply(O,n))})}function _n(t,e){return function(n,r,i){if(i&&Qn(n,r,i)&&(r=O),r=zn(r,i,3),1==r.length){n=Cs(n)?n:lr(n);var o=ae(n,r,t,e);if(!n.length||o!==e)return o}return Oe(n,r,t,e)}}function xn(t,e){return function(n,r,o){if(r=zn(r,o,3),Cs(n)){var a=i(n,r,e);return a>-1?n[a]:O}return Se(n,r,t)}}function wn(t){return function(e,n,r){return e&&e.length?(n=zn(n,r,3),i(e,n,t)):-1}}function jn(t){return function(e,n,r){return n=zn(n,r,3),Se(e,n,t,!0)}}function An(t){return function(){for(var e,n=arguments.length,r=t?n:-1,i=0,o=zo(n);t?r--:++r<n;){var a=o[i++]=arguments[r];if("function"!=typeof a)throw new Xo(W);!e&&m.prototype.thru&&"wrapper"==Bn(a)&&(e=new m([],!0))}for(r=e?-1:n;++r<n;){a=o[r];var s=Bn(a),u="wrapper"==s?za(a):O;e=u&&er(u[0])&&u[1]==(q|I|R|D)&&!u[4].length&&1==u[9]?e[Bn(u[0])].apply(e,u[3]):1==a.length&&er(a)?e[s]():e.thru(a)}return function(){var t=arguments,r=t[0];if(e&&1==t.length&&Cs(r)&&r.length>=M)return e.plant(r).value();for(var i=0,a=n?o[i].apply(this,t):r;++i<n;)a=o[i].call(this,a);return a}}}function On(t,e){return function(n,r,i){return"function"==typeof r&&i===O&&Cs(n)?t(n,r):e(n,an(r,i,3))}}function kn(t){return function(e,n,r){return("function"!=typeof n||r!==O)&&(n=an(n,r,3)),t(e,n,to)}}function En(t){return function(e,n,r){return("function"!=typeof n||r!==O)&&(n=an(n,r,3)),t(e,n)}}function Sn(t){return function(e,n,r){var i={};return n=zn(n,r,3),Le(e,function(e,r,o){var a=n(e,r,o);r=t?a:r,e=t?e:a,i[r]=e}),i}}function Cn(t){return function(e,n,r){return e=s(e),(t?e:"")+Tn(e,n,r)+(t?"":e)}}function In(t){var e=yi(function(n,r){
var i=b(r,e.placeholder);return Un(n,t,O,r,i)});return e}function Ln(t,e){return function(n,r,i,o){var a=arguments.length<3;return"function"==typeof r&&o===O&&Cs(n)?t(n,r,i,a):Ke(n,zn(r,o,4),i,a,e)}}function Rn(t,e,n,r,i,o,a,s,u,c){function l(){for(var m=arguments.length,_=m,x=zo(m);_--;)x[_]=arguments[_];if(r&&(x=un(x,r,i)),o&&(x=cn(x,o,a)),d||g){var w=l.placeholder,j=b(x,w);if(m-=j.length,c>m){var A=s?te(s):O,k=wa(c-m,0),C=d?j:O,I=d?O:j,L=d?x:O,q=d?O:x;e|=d?R:T,e&=~(d?T:R),v||(e&=~(E|S));var D=[t,e,n,L,C,q,I,A,u,k],N=Rn.apply(O,D);return er(t)&&Wa(N,D),N.placeholder=w,N}}var U=p?n:this,P=h?U[t]:t;return s&&(x=ur(x,s)),f&&u<x.length&&(x.length=u),this&&this!==ne&&this instanceof l&&(P=y||yn(t)),P.apply(U,x)}var f=e&q,p=e&E,h=e&S,d=e&I,v=e&C,g=e&L,y=h?O:yn(t);return l}function Tn(t,e,n){var r=t.length;if(e=+e,r>=e||!_a(e))return"";var i=e-r;return n=null==n?" ":n+"",yo(n,ga(i/n.length)).slice(0,i)}function qn(t,e,n,r){function i(){for(var e=-1,s=arguments.length,u=-1,c=r.length,l=zo(c+s);++u<c;)l[u]=r[u];for(;s--;)l[u++]=arguments[++e];var f=this&&this!==ne&&this instanceof i?a:t;return f.apply(o?n:this,l)}var o=e&E,a=yn(t);return i}function Dn(t){var e=$o[t];return function(t,n){return n=n===O?0:+n||0,n?(n=ca(10,n),e(t*n)/n):e(t)}}function Nn(t){return function(e,n,r,i){var o=zn(r);return null==r&&o===_e?rn(e,n,t):on(e,n,o(r,i,1),t)}}function Un(t,e,n,r,i,o,a,s){var u=e&S;if(!u&&"function"!=typeof t)throw new Xo(W);var c=r?r.length:0;if(c||(e&=~(R|T),r=i=O),c-=i?i.length:0,e&T){var l=r,f=i;r=i=O}var p=u?O:za(t),h=[t,e,n,r,i,l,f,o,a,s];if(p&&(ir(h,p),e=h[1],s=h[9]),h[9]=null==s?u?0:t.length:wa(s-c,0)||0,e==E)var d=dn(h[0],h[2]);else d=e!=R&&e!=(E|R)||h[4].length?Rn.apply(O,h):qn.apply(O,h);var v=p?Ma:Wa;return v(d,h)}function Pn(t,e,n,r,i,o,a){var s=-1,u=t.length,c=e.length;if(u!=c&&!(i&&c>u))return!1;for(;++s<u;){var l=t[s],f=e[s],p=r?r(i?f:l,i?l:f,s):O;if(p!==O){if(p)continue;return!1}if(i){if(!pe(e,function(t){return l===t||n(l,t,r,i,o,a)}))return!1}else if(l!==f&&!n(l,f,r,i,o,a))return!1}return!0}function Fn(t,e,n){switch(n){case K:case J:return+t==+e;case G:return t.name==e.name&&t.message==e.message;case Y:return t!=+t?e!=+e:t==+e;case tt:case nt:return t==e+""}return!1}function Mn(t,e,n,r,i,o,a){var s=Ms(t),u=s.length,c=Ms(e),l=c.length;if(u!=l&&!i)return!1;for(var f=u;f--;){var p=s[f];if(!(i?p in e:ea.call(e,p)))return!1}for(var h=i;++f<u;){p=s[f];var d=t[p],v=e[p],g=r?r(i?v:d,i?d:v,p):O;if(!(g===O?n(d,v,r,i,o,a):g))return!1;h||(h="constructor"==p)}if(!h){var y=t.constructor,m=e.constructor;if(y!=m&&"constructor"in t&&"constructor"in e&&!("function"==typeof y&&y instanceof y&&"function"==typeof m&&m instanceof m))return!1}return!0}function zn(t,n,r){var i=e.callback||ko;return i=i===ko?_e:i,r?i(t,n,r):i}function Bn(t){for(var e=t.name,n=qa[e],r=n?n.length:0;r--;){var i=n[r],o=i.func;if(null==o||o==t)return i.name}return e}function Wn(t,n,r){var i=e.indexOf||Ar;return i=i===Ar?o:i,t?i(t,n,r):i}function Vn(t){for(var e=eo(t),n=e.length;n--;)e[n][2]=rr(e[n][1]);return e}function $n(t,e){var n=null==t?O:t[e];return Ui(n)?n:O}function Hn(t,e,n){for(var r=-1,i=n.length;++r<i;){var o=n[r],a=o.size;switch(o.type){case"drop":t+=a;break;case"dropRight":e-=a;break;case"take":e=ja(e,t+a);break;case"takeRight":t=wa(t,e-a)}}return{start:t,end:e}}function Kn(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&ea.call(t,"index")&&(n.index=t.index,n.input=t.input),n}function Jn(t){var e=t.constructor;return"function"==typeof e&&e instanceof e||(e=Ko),new e}function Gn(t,e,n){var r=t.constructor;switch(e){case it:return sn(t);case K:case J:return new r(+t);case ot:case at:case st:case ut:case ct:case lt:case ft:case pt:case ht:var i=t.buffer;return new r(n?sn(i):i,t.byteOffset,t.length);case Y:case nt:return new r(t);case tt:var o=new r(t.source,Rt.exec(t));o.lastIndex=t.lastIndex}return o}function Xn(t,e,n){null==t||tr(e,t)||(e=pr(e),t=1==e.length?t:qe(t,Je(e,0,-1)),e=kr(e));var r=null==t?t:t[e];return null==r?O:r.apply(t,n)}function Zn(t){return null!=t&&nr(Ba(t))}function Yn(t,e){return t="number"==typeof t||Dt.test(t)?+t:-1,e=null==e?Ra:e,t>-1&&t%1==0&&e>t}function Qn(t,e,n){if(!qi(n))return!1;var r=typeof e;if("number"==r?Zn(n)&&Yn(e,n.length):"string"==r&&e in n){var i=n[e];return t===t?t===i:i!==i}return!1}function tr(t,e){var n=typeof t;if("string"==n&&Ot.test(t)||"number"==n)return!0;if(Cs(t))return!1;var r=!At.test(t);return r||null!=e&&t in fr(e)}function er(t){var n=Bn(t);if(!(n in Z.prototype))return!1;var r=e[n];if(t===r)return!0;var i=za(r);return!!i&&t===i[0]}function nr(t){return"number"==typeof t&&t>-1&&t%1==0&&Ra>=t}function rr(t){return t===t&&!qi(t)}function ir(t,e){var n=t[1],r=e[1],i=n|r,o=q>i,a=r==q&&n==I||r==q&&n==D&&t[7].length<=e[8]||r==(q|D)&&n==I;if(!o&&!a)return t;r&E&&(t[2]=e[2],i|=n&E?0:C);var s=e[3];if(s){var u=t[3];t[3]=u?un(u,s,e[4]):te(s),t[4]=u?b(t[3],V):te(e[4])}return s=e[5],s&&(u=t[5],t[5]=u?cn(u,s,e[6]):te(s),t[6]=u?b(t[5],V):te(e[6])),s=e[7],s&&(t[7]=te(s)),r&q&&(t[8]=null==t[8]?e[8]:ja(t[8],e[8])),null==t[9]&&(t[9]=e[9]),t[0]=e[0],t[1]=i,t}function or(t,e){return t===O?e:Is(t,e,or)}function ar(t,e){t=fr(t);for(var n=-1,r=e.length,i={};++n<r;){var o=e[n];o in t&&(i[o]=t[o])}return i}function sr(t,e){var n={};return Ie(t,function(t,r,i){e(t,r,i)&&(n[r]=t)}),n}function ur(t,e){for(var n=t.length,r=ja(e.length,n),i=te(t);r--;){var o=e[r];t[r]=Yn(o,n)?i[o]:O}return t}function cr(t){for(var e=to(t),n=e.length,r=n&&t.length,i=!!r&&nr(r)&&(Cs(t)||Oi(t)),o=-1,a=[];++o<n;){var s=e[o];(i&&Yn(s,r)||ea.call(t,s))&&a.push(s)}return a}function lr(t){return null==t?[]:Zn(t)?qi(t)?t:Ko(t):oo(t)}function fr(t){return qi(t)?t:Ko(t)}function pr(t){if(Cs(t))return t;var e=[];return s(t).replace(kt,function(t,n,r,i){e.push(r?i.replace(It,"$1"):n||t)}),e}function hr(t){return t instanceof Z?t.clone():new m(t.__wrapped__,t.__chain__,te(t.__actions__))}function dr(t,e,n){e=(n?Qn(t,e,n):null==e)?1:wa(ma(e)||1,1);for(var r=0,i=t?t.length:0,o=-1,a=zo(ga(i/e));i>r;)a[++o]=Je(t,r,r+=e);return a}function vr(t){for(var e=-1,n=t?t.length:0,r=-1,i=[];++e<n;){var o=t[e];o&&(i[++r]=o)}return i}function gr(t,e,n){var r=t?t.length:0;return r?((n?Qn(t,e,n):null==e)&&(e=1),Je(t,0>e?0:e)):[]}function yr(t,e,n){var r=t?t.length:0;return r?((n?Qn(t,e,n):null==e)&&(e=1),e=r-(+e||0),Je(t,0,0>e?0:e)):[]}function mr(t,e,n){return t&&t.length?en(t,zn(e,n,3),!0,!0):[]}function br(t,e,n){return t&&t.length?en(t,zn(e,n,3),!0):[]}function _r(t,e,n,r){var i=t?t.length:0;return i?(n&&"number"!=typeof n&&Qn(t,e,n)&&(n=0,r=i),ke(t,e,n,r)):[]}function xr(t){return t?t[0]:O}function wr(t,e,n){var r=t?t.length:0;return n&&Qn(t,e,n)&&(e=!1),r?Ce(t,e):[]}function jr(t){var e=t?t.length:0;return e?Ce(t,!0):[]}function Ar(t,e,n){var r=t?t.length:0;if(!r)return-1;if("number"==typeof n)n=0>n?wa(r+n,0):n;else if(n){var i=rn(t,e);return r>i&&(e===e?e===t[i]:t[i]!==t[i])?i:-1}return o(t,e,n||0)}function Or(t){return yr(t,1)}function kr(t){var e=t?t.length:0;return e?t[e-1]:O}function Er(t,e,n){var r=t?t.length:0;if(!r)return-1;var i=r;if("number"==typeof n)i=(0>n?wa(r+n,0):ja(n||0,r-1))+1;else if(n){i=rn(t,e,!0)-1;var o=t[i];return(e===e?e===o:o!==o)?i:-1}if(e!==e)return g(t,i,!0);for(;i--;)if(t[i]===e)return i;return-1}function Sr(){var t=arguments,e=t[0];if(!e||!e.length)return e;for(var n=0,r=Wn(),i=t.length;++n<i;)for(var o=0,a=t[n];(o=r(e,a,o))>-1;)ha.call(e,o,1);return e}function Cr(t,e,n){var r=[];if(!t||!t.length)return r;var i=-1,o=[],a=t.length;for(e=zn(e,n,3);++i<a;){var s=t[i];e(s,i,t)&&(r.push(s),o.push(i))}return $e(t,o),r}function Ir(t){return gr(t,1)}function Lr(t,e,n){var r=t?t.length:0;return r?(n&&"number"!=typeof n&&Qn(t,e,n)&&(e=0,n=r),Je(t,e,n)):[]}function Rr(t,e,n){var r=t?t.length:0;return r?((n?Qn(t,e,n):null==e)&&(e=1),Je(t,0,0>e?0:e)):[]}function Tr(t,e,n){var r=t?t.length:0;return r?((n?Qn(t,e,n):null==e)&&(e=1),e=r-(+e||0),Je(t,0>e?0:e)):[]}function qr(t,e,n){return t&&t.length?en(t,zn(e,n,3),!1,!0):[]}function Dr(t,e,n){return t&&t.length?en(t,zn(e,n,3)):[]}function Nr(t,e,n,r){var i=t?t.length:0;if(!i)return[];null!=e&&"boolean"!=typeof e&&(r=n,n=Qn(t,e,r)?O:e,e=!1);var a=zn();return(null!=n||a!==_e)&&(n=a(n,r,3)),e&&Wn()==o?_(t,n):Qe(t,n)}function Ur(t){if(!t||!t.length)return[];var e=-1,n=0;t=se(t,function(t){return Zn(t)?(n=wa(t.length,n),!0):void 0});for(var r=zo(n);++e<n;)r[e]=ue(t,We(e));return r}function Pr(t,e,n){var r=t?t.length:0;if(!r)return[];var i=Ur(t);return null==e?i:(e=an(e,n,4),ue(i,function(t){return le(t,e,O,!0)}))}function Fr(){for(var t=-1,e=arguments.length;++t<e;){var n=arguments[t];if(Zn(n))var r=r?ce(je(r,n),je(n,r)):n}return r?Qe(r):[]}function Mr(t,e){var n=-1,r=t?t.length:0,i={};for(!r||e||Cs(t[0])||(e=[]);++n<r;){var o=t[n];e?i[o]=e[n]:o&&(i[o[0]]=o[1])}return i}function zr(t){var n=e(t);return n.__chain__=!0,n}function Br(t,e,n){return e.call(n,t),t}function Wr(t,e,n){return e.call(n,t)}function Vr(){return zr(this)}function $r(){return new m(this.value(),this.__chain__)}function Hr(t){for(var e,r=this;r instanceof n;){var i=hr(r);e?o.__wrapped__=i:e=i;var o=i;r=r.__wrapped__}return o.__wrapped__=t,e}function Kr(){var t=this.__wrapped__,e=function(t){return n&&n.__dir__<0?t:t.reverse()};if(t instanceof Z){var n=t;return this.__actions__.length&&(n=new Z(this)),n=n.reverse(),n.__actions__.push({func:Wr,args:[e],thisArg:O}),new m(n,this.__chain__)}return this.thru(e)}function Jr(){return this.value()+""}function Gr(){return nn(this.__wrapped__,this.__actions__)}function Xr(t,e,n){var r=Cs(t)?oe:Ae;return n&&Qn(t,e,n)&&(e=O),("function"!=typeof e||n!==O)&&(e=zn(e,n,3)),r(t,e)}function Zr(t,e,n){var r=Cs(t)?se:Ee;return e=zn(e,n,3),r(t,e)}function Yr(t,e){return is(t,Fe(e))}function Qr(t,e,n,r){var i=t?Ba(t):0;return nr(i)||(t=oo(t),i=t.length),n="number"!=typeof n||r&&Qn(e,n,r)?0:0>n?wa(i+n,0):n||0,"string"==typeof t||!Cs(t)&&Bi(t)?i>=n&&t.indexOf(e,n)>-1:!!i&&Wn(t,e,n)>-1}function ti(t,e,n){var r=Cs(t)?ue:Pe;return e=zn(e,n,3),r(t,e)}function ei(t,e){return ti(t,qo(e))}function ni(t,e,n){var r=Cs(t)?se:Ee;return e=zn(e,n,3),r(t,function(t,n,r){return!e(t,n,r)})}function ri(t,e,n){if(n?Qn(t,e,n):null==e){t=lr(t);var r=t.length;return r>0?t[He(0,r-1)]:O}var i=-1,o=Ki(t),r=o.length,a=r-1;for(e=ja(0>e?0:+e||0,r);++i<e;){var s=He(i,a),u=o[s];o[s]=o[i],o[i]=u}return o.length=e,o}function ii(t){return ri(t,Sa)}function oi(t){var e=t?Ba(t):0;return nr(e)?e:Ms(t).length}function ai(t,e,n){var r=Cs(t)?pe:Ge;return n&&Qn(t,e,n)&&(e=O),("function"!=typeof e||n!==O)&&(e=zn(e,n,3)),r(t,e)}function si(t,e,n){if(null==t)return[];n&&Qn(t,e,n)&&(e=O);var r=-1;e=zn(e,n,3);var i=Pe(t,function(t,n,i){return{criteria:e(t,n,i),index:++r,value:t}});return Xe(i,l)}function ui(t,e,n,r){return null==t?[]:(r&&Qn(e,n,r)&&(n=O),Cs(e)||(e=null==e?[]:[e]),Cs(n)||(n=null==n?[]:[n]),Ze(t,e,n))}function ci(t,e){return Zr(t,Fe(e))}function li(t,e){if("function"!=typeof e){if("function"!=typeof t)throw new Xo(W);var n=t;t=e,e=n}return t=_a(t=+t)?t:0,function(){return--t<1?e.apply(this,arguments):void 0}}function fi(t,e,n){return n&&Qn(t,e,n)&&(e=O),e=t&&null==e?t.length:wa(+e||0,0),Un(t,q,O,O,O,O,e)}function pi(t,e){var n;if("function"!=typeof e){if("function"!=typeof t)throw new Xo(W);var r=t;t=e,e=r}return function(){return--t>0&&(n=e.apply(this,arguments)),1>=t&&(e=O),n}}function hi(t,e,n){function r(){h&&sa(h),c&&sa(c),v=0,c=h=d=O}function i(e,n){n&&sa(n),c=h=d=O,e&&(v=vs(),l=t.apply(p,u),h||c||(u=p=O))}function o(){var t=e-(vs()-f);0>=t||t>e?i(d,c):h=pa(o,t)}function a(){i(y,h)}function s(){if(u=arguments,f=vs(),p=this,d=y&&(h||!m),g===!1)var n=m&&!h;else{c||m||(v=f);var r=g-(f-v),i=0>=r||r>g;i?(c&&(c=sa(c)),v=f,l=t.apply(p,u)):c||(c=pa(a,r))}return i&&h?h=sa(h):h||e===g||(h=pa(o,e)),n&&(i=!0,l=t.apply(p,u)),!i||h||c||(u=p=O),l}var u,c,l,f,p,h,d,v=0,g=!1,y=!0;if("function"!=typeof t)throw new Xo(W);if(e=0>e?0:+e||0,n===!0){var m=!0;y=!1}else qi(n)&&(m=!!n.leading,g="maxWait"in n&&wa(+n.maxWait||0,e),y="trailing"in n?!!n.trailing:y);return s.cancel=r,s}function di(t,e){if("function"!=typeof t||e&&"function"!=typeof e)throw new Xo(W);var n=function(){var r=arguments,i=e?e.apply(this,r):r[0],o=n.cache;if(o.has(i))return o.get(i);var a=t.apply(this,r);return n.cache=o.set(i,a),a};return n.cache=new di.Cache,n}function vi(t){if("function"!=typeof t)throw new Xo(W);return function(){return!t.apply(this,arguments)}}function gi(t){return pi(2,t)}function yi(t,e){if("function"!=typeof t)throw new Xo(W);return e=wa(e===O?t.length-1:+e||0,0),function(){for(var n=arguments,r=-1,i=wa(n.length-e,0),o=zo(i);++r<i;)o[r]=n[e+r];switch(e){case 0:return t.call(this,o);case 1:return t.call(this,n[0],o);case 2:return t.call(this,n[0],n[1],o)}var a=zo(e+1);for(r=-1;++r<e;)a[r]=n[r];return a[e]=o,t.apply(this,a)}}function mi(t){if("function"!=typeof t)throw new Xo(W);return function(e){return t.apply(this,e)}}function bi(t,e,n){var r=!0,i=!0;if("function"!=typeof t)throw new Xo(W);return n===!1?r=!1:qi(n)&&(r="leading"in n?!!n.leading:r,i="trailing"in n?!!n.trailing:i),hi(t,e,{leading:r,maxWait:+e,trailing:i})}function _i(t,e){return e=null==e?So:e,Un(e,R,O,[t],[])}function xi(t,e,n,r){return e&&"boolean"!=typeof e&&Qn(t,e,n)?e=!1:"function"==typeof e&&(r=n,n=e,e=!1),"function"==typeof n?xe(t,e,an(n,r,1)):xe(t,e)}function wi(t,e,n){return"function"==typeof e?xe(t,!0,an(e,n,1)):xe(t,!0)}function ji(t,e){return t>e}function Ai(t,e){return t>=e}function Oi(t){return y(t)&&Zn(t)&&ea.call(t,"callee")&&!la.call(t,"callee")}function ki(t){return t===!0||t===!1||y(t)&&ra.call(t)==K}function Ei(t){return y(t)&&ra.call(t)==J}function Si(t){return!!t&&1===t.nodeType&&y(t)&&!Mi(t)}function Ci(t){return null==t?!0:Zn(t)&&(Cs(t)||Bi(t)||Oi(t)||y(t)&&Ti(t.splice))?!t.length:!Ms(t).length}function Ii(t,e,n,r){n="function"==typeof n?an(n,r,3):O;var i=n?n(t,e):O;return i===O?De(t,e,n):!!i}function Li(t){return y(t)&&"string"==typeof t.message&&ra.call(t)==G}function Ri(t){return"number"==typeof t&&_a(t)}function Ti(t){return qi(t)&&ra.call(t)==X}function qi(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function Di(t,e,n,r){return n="function"==typeof n?an(n,r,3):O,Ue(t,Vn(e),n)}function Ni(t){return Fi(t)&&t!=+t}function Ui(t){return null==t?!1:Ti(t)?oa.test(ta.call(t)):y(t)&&qt.test(t)}function Pi(t){return null===t}function Fi(t){return"number"==typeof t||y(t)&&ra.call(t)==Y}function Mi(t){var e;if(!y(t)||ra.call(t)!=Q||Oi(t)||!ea.call(t,"constructor")&&(e=t.constructor,"function"==typeof e&&!(e instanceof e)))return!1;var n;return Ie(t,function(t,e){n=e}),n===O||ea.call(t,n)}function zi(t){return qi(t)&&ra.call(t)==tt}function Bi(t){return"string"==typeof t||y(t)&&ra.call(t)==nt}function Wi(t){return y(t)&&nr(t.length)&&!!Bt[ra.call(t)]}function Vi(t){return t===O}function $i(t,e){return e>t}function Hi(t,e){return e>=t}function Ki(t){var e=t?Ba(t):0;return nr(e)?e?te(t):[]:oo(t)}function Ji(t){return be(t,to(t))}function Gi(t,e,n){var r=Da(t);return n&&Qn(t,e,n)&&(e=O),e?ye(r,e):r}function Xi(t){return Te(t,to(t))}function Zi(t,e,n){var r=null==t?O:qe(t,pr(e),e+"");return r===O?n:r}function Yi(t,e){if(null==t)return!1;var n=ea.call(t,e);if(!n&&!tr(e)){if(e=pr(e),t=1==e.length?t:qe(t,Je(e,0,-1)),null==t)return!1;e=kr(e),n=ea.call(t,e)}return n||nr(t.length)&&Yn(e,t.length)&&(Cs(t)||Oi(t))}function Qi(t,e,n){n&&Qn(t,e,n)&&(e=O);for(var r=-1,i=Ms(t),o=i.length,a={};++r<o;){var s=i[r],u=t[s];e?ea.call(a,u)?a[u].push(s):a[u]=[s]:a[u]=s}return a}function to(t){if(null==t)return[];qi(t)||(t=Ko(t));var e=t.length;e=e&&nr(e)&&(Cs(t)||Oi(t))&&e||0;for(var n=t.constructor,r=-1,i="function"==typeof n&&n.prototype===t,o=zo(e),a=e>0;++r<e;)o[r]=r+"";for(var s in t)a&&Yn(s,e)||"constructor"==s&&(i||!ea.call(t,s))||o.push(s);return o}function eo(t){t=fr(t);for(var e=-1,n=Ms(t),r=n.length,i=zo(r);++e<r;){var o=n[e];i[e]=[o,t[o]]}return i}function no(t,e,n){var r=null==t?O:t[e];return r===O&&(null==t||tr(e,t)||(e=pr(e),t=1==e.length?t:qe(t,Je(e,0,-1)),r=null==t?O:t[kr(e)]),r=r===O?n:r),Ti(r)?r.call(t):r}function ro(t,e,n){if(null==t)return t;var r=e+"";e=null!=t[r]||tr(e,t)?[r]:pr(e);for(var i=-1,o=e.length,a=o-1,s=t;null!=s&&++i<o;){var u=e[i];qi(s)&&(i==a?s[u]=n:null==s[u]&&(s[u]=Yn(e[i+1])?[]:{})),s=s[u]}return t}function io(t,e,n,r){var i=Cs(t)||Wi(t);if(e=zn(e,r,4),null==n)if(i||qi(t)){var o=t.constructor;n=i?Cs(t)?new o:[]:Da(Ti(o)?o.prototype:O)}else n={};return(i?ee:Le)(t,function(t,r,i){return e(n,t,r,i)}),n}function oo(t){return tn(t,Ms(t))}function ao(t){return tn(t,to(t))}function so(t,e,n){return e=+e||0,n===O?(n=e,e=0):n=+n||0,t>=ja(e,n)&&t<wa(e,n)}function uo(t,e,n){n&&Qn(t,e,n)&&(e=n=O);var r=null==t,i=null==e;if(null==n&&(i&&"boolean"==typeof t?(n=t,t=1):"boolean"==typeof e&&(n=e,i=!0)),r&&i&&(e=1,i=!1),t=+t||0,i?(e=t,t=0):e=+e||0,n||t%1||e%1){var o=ka();return ja(t+o*(e-t+ua("1e-"+((o+"").length-1))),e)}return He(t,e)}function co(t){return t=s(t),t&&t.charAt(0).toUpperCase()+t.slice(1)}function lo(t){return t=s(t),t&&t.replace(Nt,p).replace(Ct,"")}function fo(t,e,n){t=s(t),e+="";var r=t.length;return n=n===O?r:ja(0>n?0:+n||0,r),n-=e.length,n>=0&&t.indexOf(e,n)==n}function po(t){return t=s(t),t&&_t.test(t)?t.replace(mt,h):t}function ho(t){return t=s(t),t&&St.test(t)?t.replace(Et,d):t||"(?:)"}function vo(t,e,n){t=s(t),e=+e;var r=t.length;if(r>=e||!_a(e))return t;var i=(e-r)/2,o=ma(i),a=ga(i);return n=Tn("",a,n),n.slice(0,o)+t+n}function go(t,e,n){return(n?Qn(t,e,n):null==e)?e=0:e&&(e=+e),t=_o(t),Oa(t,e||(Tt.test(t)?16:10))}function yo(t,e){var n="";if(t=s(t),e=+e,1>e||!t||!_a(e))return n;do e%2&&(n+=t),e=ma(e/2),t+=t;while(e);return n}function mo(t,e,n){return t=s(t),n=null==n?0:ja(0>n?0:+n||0,t.length),t.lastIndexOf(e,n)==n}function bo(t,n,r){var i=e.templateSettings;r&&Qn(t,n,r)&&(n=r=O),t=s(t),n=ge(ye({},r||n),i,ve);var o,a,u=ge(ye({},n.imports),i.imports,ve),c=Ms(u),l=tn(u,c),f=0,p=n.interpolate||Ut,h="__p += '",d=Jo((n.escape||Ut).source+"|"+p.source+"|"+(p===jt?Lt:Ut).source+"|"+(n.evaluate||Ut).source+"|$","g"),g="//# sourceURL="+("sourceURL"in n?n.sourceURL:"lodash.templateSources["+ ++zt+"]")+"\n";t.replace(d,function(e,n,r,i,s,u){return r||(r=i),h+=t.slice(f,u).replace(Pt,v),n&&(o=!0,h+="' +\n__e("+n+") +\n'"),s&&(a=!0,h+="';\n"+s+";\n__p += '"),r&&(h+="' +\n((__t = ("+r+")) == null ? '' : __t) +\n'"),f=u+e.length,e}),h+="';\n";var y=n.variable;y||(h="with (obj) {\n"+h+"\n}\n"),h=(a?h.replace(dt,""):h).replace(vt,"$1").replace(gt,"$1;"),h="function("+(y||"obj")+") {\n"+(y?"":"obj || (obj = {});\n")+"var __t, __p = ''"+(o?", __e = _.escape":"")+(a?", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n":";\n")+h+"return __p\n}";var m=Zs(function(){return Vo(c,g+"return "+h).apply(O,l)});if(m.source=h,Li(m))throw m;return m}function _o(t,e,n){var r=t;return(t=s(t))?(n?Qn(r,e,n):null==e)?t.slice(x(t),w(t)+1):(e+="",t.slice(u(t,e),c(t,e)+1)):t}function xo(t,e,n){var r=t;return t=s(t),t?t.slice((n?Qn(r,e,n):null==e)?x(t):u(t,e+"")):t}function wo(t,e,n){var r=t;return t=s(t),t?(n?Qn(r,e,n):null==e)?t.slice(0,w(t)+1):t.slice(0,c(t,e+"")+1):t}function jo(t,e,n){n&&Qn(t,e,n)&&(e=O);var r=N,i=U;if(null!=e)if(qi(e)){var o="separator"in e?e.separator:o;r="length"in e?+e.length||0:r,i="omission"in e?s(e.omission):i}else r=+e||0;if(t=s(t),r>=t.length)return t;var a=r-i.length;if(1>a)return i;var u=t.slice(0,a);if(null==o)return u+i;if(zi(o)){if(t.slice(a).search(o)){var c,l,f=t.slice(0,a);for(o.global||(o=Jo(o.source,(Rt.exec(o)||"")+"g")),o.lastIndex=0;c=o.exec(f);)l=c.index;u=u.slice(0,null==l?a:l)}}else if(t.indexOf(o,a)!=a){var p=u.lastIndexOf(o);p>-1&&(u=u.slice(0,p))}return u+i}function Ao(t){return t=s(t),t&&bt.test(t)?t.replace(yt,j):t}function Oo(t,e,n){return n&&Qn(t,e,n)&&(e=O),t=s(t),t.match(e||Ft)||[]}function ko(t,e,n){return n&&Qn(t,e,n)&&(e=O),y(t)?Co(t):_e(t,e)}function Eo(t){return function(){return t}}function So(t){return t}function Co(t){return Fe(xe(t,!0))}function Io(t,e){return Me(t,xe(e,!0))}function Lo(t,e,n){if(null==n){var r=qi(e),i=r?Ms(e):O,o=i&&i.length?Te(e,i):O;(o?o.length:r)||(o=!1,n=e,e=t,t=this)}o||(o=Te(e,Ms(e)));var a=!0,s=-1,u=Ti(t),c=o.length;n===!1?a=!1:qi(n)&&"chain"in n&&(a=n.chain);for(;++s<c;){var l=o[s],f=e[l];t[l]=f,u&&(t.prototype[l]=function(e){return function(){var n=this.__chain__;if(a||n){var r=t(this.__wrapped__),i=r.__actions__=te(this.__actions__);return i.push({func:e,args:arguments,thisArg:t}),r.__chain__=n,r}return e.apply(t,ce([this.value()],arguments))}}(f))}return t}function Ro(){return ne._=ia,this}function To(){}function qo(t){return tr(t)?We(t):Ve(t)}function Do(t){return function(e){return qe(t,pr(e),e+"")}}function No(t,e,n){n&&Qn(t,e,n)&&(e=n=O),t=+t||0,n=null==n?1:+n||0,null==e?(e=t,t=0):e=+e||0;for(var r=-1,i=wa(ga((e-t)/(n||1)),0),o=zo(i);++r<i;)o[r]=t,t+=n;return o}function Uo(t,e,n){if(t=ma(t),1>t||!_a(t))return[];var r=-1,i=zo(ja(t,Ca));for(e=an(e,n,1);++r<t;)Ca>r?i[r]=e(r):e(r);return i}function Po(t){var e=++na;return s(t)+e}function Fo(t,e){return(+t||0)+(+e||0)}function Mo(t,e,n){return n&&Qn(t,e,n)&&(e=O),e=zn(e,n,3),1==e.length?he(Cs(t)?t:lr(t),e):Ye(t,e)}t=t?re.defaults(ne.Object(),t,re.pick(ne,Mt)):ne;var zo=t.Array,Bo=t.Date,Wo=t.Error,Vo=t.Function,$o=t.Math,Ho=t.Number,Ko=t.Object,Jo=t.RegExp,Go=t.String,Xo=t.TypeError,Zo=zo.prototype,Yo=Ko.prototype,Qo=Go.prototype,ta=Vo.prototype.toString,ea=Yo.hasOwnProperty,na=0,ra=Yo.toString,ia=ne._,oa=Jo("^"+ta.call(ea).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),aa=t.ArrayBuffer,sa=t.clearTimeout,ua=t.parseFloat,ca=$o.pow,la=Yo.propertyIsEnumerable,fa=$n(t,"Set"),pa=t.setTimeout,ha=Zo.splice,da=t.Uint8Array,va=$n(t,"WeakMap"),ga=$o.ceil,ya=$n(Ko,"create"),ma=$o.floor,ba=$n(zo,"isArray"),_a=t.isFinite,xa=$n(Ko,"keys"),wa=$o.max,ja=$o.min,Aa=$n(Bo,"now"),Oa=t.parseInt,ka=$o.random,Ea=Ho.NEGATIVE_INFINITY,Sa=Ho.POSITIVE_INFINITY,Ca=4294967295,Ia=Ca-1,La=Ca>>>1,Ra=9007199254740991,Ta=va&&new va,qa={};e.support={};e.templateSettings={escape:xt,evaluate:wt,interpolate:jt,variable:"",imports:{_:e}};var Da=function(){function t(){}return function(e){if(qi(e)){t.prototype=e;var n=new t;t.prototype=O}return n||{}}}(),Na=pn(Le),Ua=pn(Re,!0),Pa=hn(),Fa=hn(!0),Ma=Ta?function(t,e){return Ta.set(t,e),t}:So,za=Ta?function(t){return Ta.get(t)}:To,Ba=We("length"),Wa=function(){var t=0,e=0;return function(n,r){var i=vs(),o=F-(i-e);if(e=i,o>0){if(++t>=P)return n}else t=0;return Ma(n,r)}}(),Va=yi(function(t,e){return y(t)&&Zn(t)?je(t,Ce(e,!1,!0)):[]}),$a=wn(),Ha=wn(!0),Ka=yi(function(t){for(var e=t.length,n=e,r=zo(f),i=Wn(),a=i==o,s=[];n--;){var u=t[n]=Zn(u=t[n])?u:[];r[n]=a&&u.length>=120?vn(n&&u):null}var c=t[0],l=-1,f=c?c.length:0,p=r[0];t:for(;++l<f;)if(u=c[l],(p?Zt(p,u):i(s,u,0))<0){for(var n=e;--n;){var h=r[n];if((h?Zt(h,u):i(t[n],u,0))<0)continue t}p&&p.push(u),s.push(u)}return s}),Ja=yi(function(t,e){e=Ce(e);var n=me(t,e);return $e(t,e.sort(r)),n}),Ga=Nn(),Xa=Nn(!0),Za=yi(function(t){return Qe(Ce(t,!1,!0))}),Ya=yi(function(t,e){return Zn(t)?je(t,e):[]}),Qa=yi(Ur),ts=yi(function(t){var e=t.length,n=e>2?t[e-2]:O,r=e>1?t[e-1]:O;return e>2&&"function"==typeof n?e-=2:(n=e>1&&"function"==typeof r?(--e,r):O,r=O),t.length=e,Pr(t,n,r)}),es=yi(function(t){return t=Ce(t),this.thru(function(e){return Qt(Cs(e)?e:[fr(e)],t)})}),ns=yi(function(t,e){return me(t,Ce(e))}),rs=ln(function(t,e,n){ea.call(t,n)?++t[n]:t[n]=1}),is=xn(Na),os=xn(Ua,!0),as=On(ee,Na),ss=On(ie,Ua),us=ln(function(t,e,n){ea.call(t,n)?t[n].push(e):t[n]=[e]}),cs=ln(function(t,e,n){t[n]=e}),ls=yi(function(t,e,n){var r=-1,i="function"==typeof e,o=tr(e),a=Zn(t)?zo(t.length):[];return Na(t,function(t){var s=i?e:o&&null!=t?t[e]:O;a[++r]=s?s.apply(t,n):Xn(t,e,n)}),a}),fs=ln(function(t,e,n){t[n?0:1].push(e)},function(){return[[],[]]}),ps=Ln(le,Na),hs=Ln(fe,Ua),ds=yi(function(t,e){if(null==t)return[];var n=e[2];return n&&Qn(e[0],e[1],n)&&(e.length=1),Ze(t,Ce(e),[])}),vs=Aa||function(){return(new Bo).getTime()},gs=yi(function(t,e,n){var r=E;if(n.length){var i=b(n,gs.placeholder);r|=R}return Un(t,r,e,n,i)}),ys=yi(function(t,e){e=e.length?Ce(e):Xi(t);for(var n=-1,r=e.length;++n<r;){var i=e[n];t[i]=Un(t[i],E,t)}return t}),ms=yi(function(t,e,n){var r=E|S;if(n.length){var i=b(n,ms.placeholder);r|=R}return Un(e,r,t,n,i)}),bs=mn(I),_s=mn(L),xs=yi(function(t,e){return we(t,1,e)}),ws=yi(function(t,e,n){return we(t,e,n)}),js=An(),As=An(!0),Os=yi(function(t,e){if(e=Ce(e),"function"!=typeof t||!oe(e,a))throw new Xo(W);var n=e.length;return yi(function(r){for(var i=ja(r.length,n);i--;)r[i]=e[i](r[i]);return t.apply(this,r)})}),ks=In(R),Es=In(T),Ss=yi(function(t,e){return Un(t,D,O,O,O,Ce(e))}),Cs=ba||function(t){return y(t)&&nr(t.length)&&ra.call(t)==H},Is=fn(ze),Ls=fn(function(t,e,n){return n?ge(t,e,n):ye(t,e)}),Rs=bn(Ls,de),Ts=bn(Is,or),qs=jn(Le),Ds=jn(Re),Ns=kn(Pa),Us=kn(Fa),Ps=En(Le),Fs=En(Re),Ms=xa?function(t){var e=null==t?O:t.constructor;return"function"==typeof e&&e.prototype===t||"function"!=typeof t&&Zn(t)?cr(t):qi(t)?xa(t):[]}:cr,zs=Sn(!0),Bs=Sn(),Ws=yi(function(t,e){if(null==t)return{};if("function"!=typeof e[0]){var e=ue(Ce(e),Go);return ar(t,je(to(t),e))}var n=an(e[0],e[1],3);return sr(t,function(t,e,r){return!n(t,e,r)})}),Vs=yi(function(t,e){return null==t?{}:"function"==typeof e[0]?sr(t,an(e[0],e[1],3)):ar(t,Ce(e))}),$s=gn(function(t,e,n){return e=e.toLowerCase(),t+(n?e.charAt(0).toUpperCase()+e.slice(1):e)}),Hs=gn(function(t,e,n){return t+(n?"-":"")+e.toLowerCase()}),Ks=Cn(),Js=Cn(!0),Gs=gn(function(t,e,n){return t+(n?"_":"")+e.toLowerCase()}),Xs=gn(function(t,e,n){return t+(n?" ":"")+(e.charAt(0).toUpperCase()+e.slice(1))}),Zs=yi(function(t,e){try{return t.apply(O,e)}catch(n){return Li(n)?n:new Wo(n)}}),Ys=yi(function(t,e){return function(n){return Xn(n,t,e)}}),Qs=yi(function(t,e){return function(n){return Xn(t,n,e)}}),tu=Dn("ceil"),eu=Dn("floor"),nu=_n(ji,Ea),ru=_n($i,Sa),iu=Dn("round");return e.prototype=n.prototype,m.prototype=Da(n.prototype),m.prototype.constructor=m,Z.prototype=Da(n.prototype),Z.prototype.constructor=Z,$t.prototype["delete"]=Ht,$t.prototype.get=Kt,$t.prototype.has=Jt,$t.prototype.set=Gt,Xt.prototype.push=Yt,di.Cache=$t,e.after=li,e.ary=fi,e.assign=Ls,e.at=ns,e.before=pi,e.bind=gs,e.bindAll=ys,e.bindKey=ms,e.callback=ko,e.chain=zr,e.chunk=dr,e.compact=vr,e.constant=Eo,e.countBy=rs,e.create=Gi,e.curry=bs,e.curryRight=_s,e.debounce=hi,e.defaults=Rs,e.defaultsDeep=Ts,e.defer=xs,e.delay=ws,e.difference=Va,e.drop=gr,e.dropRight=yr,e.dropRightWhile=mr,e.dropWhile=br,e.fill=_r,e.filter=Zr,e.flatten=wr,e.flattenDeep=jr,e.flow=js,e.flowRight=As,e.forEach=as,e.forEachRight=ss,e.forIn=Ns,e.forInRight=Us,e.forOwn=Ps,e.forOwnRight=Fs,e.functions=Xi,e.groupBy=us,e.indexBy=cs,e.initial=Or,e.intersection=Ka,e.invert=Qi,e.invoke=ls,e.keys=Ms,e.keysIn=to,e.map=ti,e.mapKeys=zs,e.mapValues=Bs,e.matches=Co,e.matchesProperty=Io,e.memoize=di,e.merge=Is,e.method=Ys,e.methodOf=Qs,e.mixin=Lo,e.modArgs=Os,e.negate=vi,e.omit=Ws,e.once=gi,e.pairs=eo,e.partial=ks,e.partialRight=Es,e.partition=fs,e.pick=Vs,e.pluck=ei,e.property=qo,e.propertyOf=Do,e.pull=Sr,e.pullAt=Ja,e.range=No,e.rearg=Ss,e.reject=ni,e.remove=Cr,e.rest=Ir,e.restParam=yi,e.set=ro,e.shuffle=ii,e.slice=Lr,e.sortBy=si,e.sortByAll=ds,e.sortByOrder=ui,e.spread=mi,e.take=Rr,e.takeRight=Tr,e.takeRightWhile=qr,e.takeWhile=Dr,e.tap=Br,e.throttle=bi,e.thru=Wr,e.times=Uo,e.toArray=Ki,e.toPlainObject=Ji,e.transform=io,e.union=Za,e.uniq=Nr,e.unzip=Ur,e.unzipWith=Pr,e.values=oo,e.valuesIn=ao,e.where=ci,e.without=Ya,e.wrap=_i,e.xor=Fr,e.zip=Qa,e.zipObject=Mr,e.zipWith=ts,e.backflow=As,e.collect=ti,e.compose=As,e.each=as,e.eachRight=ss,e.extend=Ls,e.iteratee=ko,e.methods=Xi,e.object=Mr,e.select=Zr,e.tail=Ir,e.unique=Nr,Lo(e,e),e.add=Fo,e.attempt=Zs,e.camelCase=$s,e.capitalize=co,e.ceil=tu,e.clone=xi,e.cloneDeep=wi,e.deburr=lo,e.endsWith=fo,e.escape=po,e.escapeRegExp=ho,e.every=Xr,e.find=is,e.findIndex=$a,e.findKey=qs,e.findLast=os,e.findLastIndex=Ha,e.findLastKey=Ds,e.findWhere=Yr,e.first=xr,e.floor=eu,e.get=Zi,e.gt=ji,e.gte=Ai,e.has=Yi,e.identity=So,e.includes=Qr,e.indexOf=Ar,e.inRange=so,e.isArguments=Oi,e.isArray=Cs,e.isBoolean=ki,e.isDate=Ei,e.isElement=Si,e.isEmpty=Ci,e.isEqual=Ii,e.isError=Li,e.isFinite=Ri,e.isFunction=Ti,e.isMatch=Di,e.isNaN=Ni,e.isNative=Ui,e.isNull=Pi,e.isNumber=Fi,e.isObject=qi,e.isPlainObject=Mi,e.isRegExp=zi,e.isString=Bi,e.isTypedArray=Wi,e.isUndefined=Vi,e.kebabCase=Hs,e.last=kr,e.lastIndexOf=Er,e.lt=$i,e.lte=Hi,e.max=nu,e.min=ru,e.noConflict=Ro,e.noop=To,e.now=vs,e.pad=vo,e.padLeft=Ks,e.padRight=Js,e.parseInt=go,e.random=uo,e.reduce=ps,e.reduceRight=hs,e.repeat=yo,e.result=no,e.round=iu,e.runInContext=A,e.size=oi,e.snakeCase=Gs,e.some=ai,e.sortedIndex=Ga,e.sortedLastIndex=Xa,e.startCase=Xs,e.startsWith=mo,e.sum=Mo,e.template=bo,e.trim=_o,e.trimLeft=xo,e.trimRight=wo,e.trunc=jo,e.unescape=Ao,e.uniqueId=Po,e.words=Oo,e.all=Xr,e.any=ai,e.contains=Qr,e.eq=Ii,e.detect=is,e.foldl=ps,e.foldr=hs,e.head=xr,e.include=Qr,e.inject=ps,Lo(e,function(){var t={};return Le(e,function(n,r){e.prototype[r]||(t[r]=n)}),t}(),!1),e.sample=ri,e.prototype.sample=function(t){return this.__chain__||null!=t?this.thru(function(e){return ri(e,t)}):ri(this.value())},e.VERSION=k,ee(["bind","bindKey","curry","curryRight","partial","partialRight"],function(t){e[t].placeholder=e}),ee(["drop","take"],function(t,e){Z.prototype[t]=function(n){var r=this.__filtered__;if(r&&!e)return new Z(this);n=null==n?1:wa(ma(n)||0,0);var i=this.clone();return r?i.__takeCount__=ja(i.__takeCount__,n):i.__views__.push({size:n,type:t+(i.__dir__<0?"Right":"")}),i},Z.prototype[t+"Right"]=function(e){return this.reverse()[t](e).reverse()}}),ee(["filter","map","takeWhile"],function(t,e){var n=e+1,r=n!=B;Z.prototype[t]=function(t,e){var i=this.clone();return i.__iteratees__.push({iteratee:zn(t,e,1),type:n}),i.__filtered__=i.__filtered__||r,i}}),ee(["first","last"],function(t,e){var n="take"+(e?"Right":"");Z.prototype[t]=function(){return this[n](1).value()[0]}}),ee(["initial","rest"],function(t,e){var n="drop"+(e?"":"Right");Z.prototype[t]=function(){return this.__filtered__?new Z(this):this[n](1)}}),ee(["pluck","where"],function(t,e){var n=e?"filter":"map",r=e?Fe:qo;Z.prototype[t]=function(t){return this[n](r(t))}}),Z.prototype.compact=function(){return this.filter(So)},Z.prototype.reject=function(t,e){return t=zn(t,e,1),this.filter(function(e){return!t(e)})},Z.prototype.slice=function(t,e){t=null==t?0:+t||0;var n=this;return n.__filtered__&&(t>0||0>e)?new Z(n):(0>t?n=n.takeRight(-t):t&&(n=n.drop(t)),e!==O&&(e=+e||0,n=0>e?n.dropRight(-e):n.take(e-t)),n)},Z.prototype.takeRightWhile=function(t,e){return this.reverse().takeWhile(t,e).reverse()},Z.prototype.toArray=function(){return this.take(Sa)},Le(Z.prototype,function(t,n){var r=/^(?:filter|map|reject)|While$/.test(n),i=/^(?:first|last)$/.test(n),o=e[i?"take"+("last"==n?"Right":""):n];o&&(e.prototype[n]=function(){var e=i?[1]:arguments,n=this.__chain__,a=this.__wrapped__,s=!!this.__actions__.length,u=a instanceof Z,c=e[0],l=u||Cs(a);l&&r&&"function"==typeof c&&1!=c.length&&(u=l=!1);var f=function(t){return i&&n?o(t,1)[0]:o.apply(O,ce([t],e))},p={func:Wr,args:[f],thisArg:O},h=u&&!s;if(i&&!n)return h?(a=a.clone(),a.__actions__.push(p),t.call(a)):o.call(O,this.value())[0];if(!i&&l){a=h?a:new Z(this);var d=t.apply(a,e);return d.__actions__.push(p),new m(d,n)}return this.thru(f)})}),ee(["join","pop","push","replace","shift","sort","splice","split","unshift"],function(t){var n=(/^(?:replace|split)$/.test(t)?Qo:Zo)[t],r=/^(?:push|sort|unshift)$/.test(t)?"tap":"thru",i=/^(?:join|pop|replace|shift)$/.test(t);e.prototype[t]=function(){var t=arguments;return i&&!this.__chain__?n.apply(this.value(),t):this[r](function(e){return n.apply(e,t)})}}),Le(Z.prototype,function(t,n){var r=e[n];if(r){var i=r.name,o=qa[i]||(qa[i]=[]);o.push({name:n,func:r})}}),qa[Rn(O,S).name]=[{name:"wrapper",func:O}],Z.prototype.clone=et,Z.prototype.reverse=rt,Z.prototype.value=Vt,e.prototype.chain=Vr,e.prototype.commit=$r,e.prototype.concat=es,e.prototype.plant=Hr,e.prototype.reverse=Kr,e.prototype.toString=Jr,
e.prototype.run=e.prototype.toJSON=e.prototype.valueOf=e.prototype.value=Gr,e.prototype.collect=e.prototype.map,e.prototype.head=e.prototype.first,e.prototype.select=e.prototype.filter,e.prototype.tail=e.prototype.rest,e}var O,k="3.10.0",E=1,S=2,C=4,I=8,L=16,R=32,T=64,q=128,D=256,N=30,U="...",P=150,F=16,M=200,z=1,B=2,W="Expected a function",V="__lodash_placeholder__",$="[object Arguments]",H="[object Array]",K="[object Boolean]",J="[object Date]",G="[object Error]",X="[object Function]",Z="[object Map]",Y="[object Number]",Q="[object Object]",tt="[object RegExp]",et="[object Set]",nt="[object String]",rt="[object WeakMap]",it="[object ArrayBuffer]",ot="[object Float32Array]",at="[object Float64Array]",st="[object Int8Array]",ut="[object Int16Array]",ct="[object Int32Array]",lt="[object Uint8Array]",ft="[object Uint8ClampedArray]",pt="[object Uint16Array]",ht="[object Uint32Array]",dt=/\b__p \+= '';/g,vt=/\b(__p \+=) '' \+/g,gt=/(__e\(.*?\)|\b__t\)) \+\n'';/g,yt=/&(?:amp|lt|gt|quot|#39|#96);/g,mt=/[&<>"'`]/g,bt=RegExp(yt.source),_t=RegExp(mt.source),xt=/{{-([\s\S]+?)}}/g,wt=/{{([\s\S]+?)}}/g,jt=/{{=([\s\S]+?)}}/g,At=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,Ot=/^\w*$/,kt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,Et=/^[:!,]|[\\^$.*+?()[\]{}|\/]|(^[0-9a-fA-Fnrtuvx])|([\n\r\u2028\u2029])/g,St=RegExp(Et.source),Ct=/[\u0300-\u036f\ufe20-\ufe23]/g,It=/\\(\\)?/g,Lt=/\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g,Rt=/\w*$/,Tt=/^0[xX]/,qt=/^\[object .+?Constructor\]$/,Dt=/^\d+$/,Nt=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g,Ut=/($^)/,Pt=/['\n\r\u2028\u2029\\]/g,Ft=function(){var t="[A-Z\\xc0-\\xd6\\xd8-\\xde]",e="[a-z\\xdf-\\xf6\\xf8-\\xff]+";return RegExp(t+"+(?="+t+e+")|"+t+"?"+e+"|"+t+"+|[0-9]+","g")}(),Mt=["Array","ArrayBuffer","Date","Error","Float32Array","Float64Array","Function","Int8Array","Int16Array","Int32Array","Math","Number","Object","RegExp","Set","String","_","clearTimeout","isFinite","parseFloat","parseInt","setTimeout","TypeError","Uint8Array","Uint8ClampedArray","Uint16Array","Uint32Array","WeakMap"],zt=-1,Bt={};Bt[ot]=Bt[at]=Bt[st]=Bt[ut]=Bt[ct]=Bt[lt]=Bt[ft]=Bt[pt]=Bt[ht]=!0,Bt[$]=Bt[H]=Bt[it]=Bt[K]=Bt[J]=Bt[G]=Bt[X]=Bt[Z]=Bt[Y]=Bt[Q]=Bt[tt]=Bt[et]=Bt[nt]=Bt[rt]=!1;var Wt={};Wt[$]=Wt[H]=Wt[it]=Wt[K]=Wt[J]=Wt[ot]=Wt[at]=Wt[st]=Wt[ut]=Wt[ct]=Wt[Y]=Wt[Q]=Wt[tt]=Wt[nt]=Wt[lt]=Wt[ft]=Wt[pt]=Wt[ht]=!0,Wt[G]=Wt[X]=Wt[Z]=Wt[et]=Wt[rt]=!1;var Vt={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss"},$t={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","`":"&#96;"},Ht={"&amp;":"&","&lt;":"<","&gt;":">","&quot;":'"',"&#39;":"'","&#96;":"`"},Kt={"function":!0,object:!0},Jt={0:"x30",1:"x31",2:"x32",3:"x33",4:"x34",5:"x35",6:"x36",7:"x37",8:"x38",9:"x39",A:"x41",B:"x42",C:"x43",D:"x44",E:"x45",F:"x46",a:"x61",b:"x62",c:"x63",d:"x64",e:"x65",f:"x66",n:"x6e",r:"x72",t:"x74",u:"x75",v:"x76",x:"x78"},Gt={"\\":"\\","'":"'","\n":"n","\r":"r","\u2028":"u2028","\u2029":"u2029"},Xt=Kt[typeof n]&&n&&!n.nodeType&&n,Zt=Kt[typeof e]&&e&&!e.nodeType&&e,Yt=Xt&&Zt&&"object"==typeof t&&t&&t.Object&&t,Qt=Kt[typeof self]&&self&&self.Object&&self,te=Kt[typeof window]&&window&&window.Object&&window,ee=Zt&&Zt.exports===Xt&&Xt,ne=Yt||te!==(this&&this.window)&&te||Qt||this,re=A();"function"==typeof define&&"object"==typeof define.amd&&define.amd?(ne._=re,define(function(){return re})):Xt&&Zt?ee?(Zt.exports=re)._=re:Xt._=re:ne._=re}).call(this)}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],55:[function(t,e,n){function r(t){this.__wrapped__=t,this.__actions__=[],this.__dir__=1,this.__filtered__=!1,this.__iteratees__=[],this.__takeCount__=a,this.__views__=[]}var i=t("./baseCreate"),o=t("./baseLodash"),a=Number.POSITIVE_INFINITY;r.prototype=i(o.prototype),r.prototype.constructor=r,e.exports=r},{"./baseCreate":67,"./baseLodash":76}],56:[function(t,e,n){function r(t,e,n){this.__wrapped__=t,this.__actions__=n||[],this.__chain__=!!e}var i=t("./baseCreate"),o=t("./baseLodash");r.prototype=i(o.prototype),r.prototype.constructor=r,e.exports=r},{"./baseCreate":67,"./baseLodash":76}],57:[function(t,e,n){function r(t,e){var n=-1,r=t.length;for(e||(e=Array(r));++n<r;)e[n]=t[n];return e}e.exports=r},{}],58:[function(t,e,n){function r(t,e){for(var n=-1,r=t.length;++n<r&&e(t[n],n,t)!==!1;);return t}e.exports=r},{}],59:[function(t,e,n){function r(t,e){for(var n=-1,r=e.length,i=t.length;++n<r;)t[i+n]=e[n];return t}e.exports=r},{}],60:[function(t,e,n){function r(t,e){for(var n=-1,r=t.length;++n<r;)if(e(t[n],n,t))return!0;return!1}e.exports=r},{}],61:[function(t,e,n){function r(t,e){return void 0===t?e:t}e.exports=r},{}],62:[function(t,e,n){function r(t,e,n){for(var r=-1,o=i(e),a=o.length;++r<a;){var s=o[r],u=t[s],c=n(u,e[s],s,t,e);(c===c?c===u:u!==u)&&(void 0!==u||s in t)||(t[s]=c)}return t}var i=t("../object/keys");e.exports=r},{"../object/keys":142}],63:[function(t,e,n){function r(t,e){return null==e?t:i(e,o(e),t)}var i=t("./baseCopy"),o=t("../object/keys");e.exports=r},{"../object/keys":142,"./baseCopy":66}],64:[function(t,e,n){function r(t,e,n){var r=typeof t;return"function"==r?void 0===e?t:a(t,e,n):null==t?s:"object"==r?i(t):void 0===e?u(t):o(t,e)}var i=t("./baseMatches"),o=t("./baseMatchesProperty"),a=t("./bindCallback"),s=t("../utility/identity"),u=t("../utility/property");e.exports=r},{"../utility/identity":153,"../utility/property":157,"./baseMatches":77,"./baseMatchesProperty":78,"./bindCallback":85}],65:[function(t,e,n){function r(t,e,n,d,v,g,y){var b;if(n&&(b=v?n(t,d,v):n(t)),void 0!==b)return b;if(!p(t))return t;var _=f(t);if(_){if(b=u(t),!e)return i(t,b)}else{var w=P.call(t),j=w==m;if(w!=x&&w!=h&&(!j||v))return N[w]?c(t,w,e):v?t:{};if(b=l(j?{}:t),!e)return a(b,t)}g||(g=[]),y||(y=[]);for(var A=g.length;A--;)if(g[A]==t)return y[A];return g.push(t),y.push(b),(_?o:s)(t,function(i,o){b[o]=r(i,e,n,o,t,g,y)}),b}var i=t("./arrayCopy"),o=t("./arrayEach"),a=t("./baseAssign"),s=t("./baseForOwn"),u=t("./initCloneArray"),c=t("./initCloneByTag"),l=t("./initCloneObject"),f=t("../lang/isArray"),p=t("../lang/isObject"),h="[object Arguments]",d="[object Array]",v="[object Boolean]",g="[object Date]",y="[object Error]",m="[object Function]",b="[object Map]",_="[object Number]",x="[object Object]",w="[object RegExp]",j="[object Set]",A="[object String]",O="[object WeakMap]",k="[object ArrayBuffer]",E="[object Float32Array]",S="[object Float64Array]",C="[object Int8Array]",I="[object Int16Array]",L="[object Int32Array]",R="[object Uint8Array]",T="[object Uint8ClampedArray]",q="[object Uint16Array]",D="[object Uint32Array]",N={};N[h]=N[d]=N[k]=N[v]=N[g]=N[E]=N[S]=N[C]=N[I]=N[L]=N[_]=N[x]=N[w]=N[A]=N[R]=N[T]=N[q]=N[D]=!0,N[y]=N[m]=N[b]=N[j]=N[O]=!1;var U=Object.prototype,P=U.toString;e.exports=r},{"../lang/isArray":133,"../lang/isObject":136,"./arrayCopy":57,"./arrayEach":58,"./baseAssign":63,"./baseForOwn":71,"./initCloneArray":108,"./initCloneByTag":109,"./initCloneObject":110}],66:[function(t,e,n){function r(t,e,n){n||(n={});for(var r=-1,i=e.length;++r<i;){var o=e[r];n[o]=t[o]}return n}e.exports=r},{}],67:[function(t,e,n){var r=t("../lang/isObject"),i=function(){function t(){}return function(e){if(r(e)){t.prototype=e;var n=new t;t.prototype=void 0}return n||{}}}();e.exports=i},{"../lang/isObject":136}],68:[function(t,e,n){function r(t,e,n,c){c||(c=[]);for(var l=-1,f=t.length;++l<f;){var p=t[l];u(p)&&s(p)&&(n||a(p)||o(p))?e?r(p,e,n,c):i(c,p):n||(c[c.length]=p)}return c}var i=t("./arrayPush"),o=t("../lang/isArguments"),a=t("../lang/isArray"),s=t("./isArrayLike"),u=t("./isObjectLike");e.exports=r},{"../lang/isArguments":132,"../lang/isArray":133,"./arrayPush":59,"./isArrayLike":111,"./isObjectLike":117}],69:[function(t,e,n){var r=t("./createBaseFor"),i=r();e.exports=i},{"./createBaseFor":90}],70:[function(t,e,n){function r(t,e){return i(t,e,o)}var i=t("./baseFor"),o=t("../object/keysIn");e.exports=r},{"../object/keysIn":143,"./baseFor":69}],71:[function(t,e,n){function r(t,e){return i(t,e,o)}var i=t("./baseFor"),o=t("../object/keys");e.exports=r},{"../object/keys":142,"./baseFor":69}],72:[function(t,e,n){function r(t,e,n){if(null!=t){void 0!==n&&n in i(t)&&(e=[n]);for(var r=0,o=e.length;null!=t&&o>r;)t=t[e[r++]];return r&&r==o?t:void 0}}var i=t("./toObject");e.exports=r},{"./toObject":128}],73:[function(t,e,n){function r(t,e,n,s,u,c){return t===e?!0:null==t||null==e||!o(t)&&!a(e)?t!==t&&e!==e:i(t,e,r,n,s,u,c)}var i=t("./baseIsEqualDeep"),o=t("../lang/isObject"),a=t("./isObjectLike");e.exports=r},{"../lang/isObject":136,"./baseIsEqualDeep":74,"./isObjectLike":117}],74:[function(t,e,n){function r(t,e,n,r,p,v,g){var y=s(t),m=s(e),b=l,_=l;y||(b=d.call(t),b==c?b=f:b!=f&&(y=u(t))),m||(_=d.call(e),_==c?_=f:_!=f&&(m=u(e)));var x=b==f,w=_==f,j=b==_;if(j&&!y&&!x)return o(t,e,b);if(!p){var A=x&&h.call(t,"__wrapped__"),O=w&&h.call(e,"__wrapped__");if(A||O)return n(A?t.value():t,O?e.value():e,r,p,v,g)}if(!j)return!1;v||(v=[]),g||(g=[]);for(var k=v.length;k--;)if(v[k]==t)return g[k]==e;v.push(t),g.push(e);var E=(y?i:a)(t,e,n,r,p,v,g);return v.pop(),g.pop(),E}var i=t("./equalArrays"),o=t("./equalByTag"),a=t("./equalObjects"),s=t("../lang/isArray"),u=t("../lang/isTypedArray"),c="[object Arguments]",l="[object Array]",f="[object Object]",p=Object.prototype,h=p.hasOwnProperty,d=p.toString;e.exports=r},{"../lang/isArray":133,"../lang/isTypedArray":138,"./equalArrays":100,"./equalByTag":101,"./equalObjects":102}],75:[function(t,e,n){function r(t,e,n){var r=e.length,a=r,s=!n;if(null==t)return!a;for(t=o(t);r--;){var u=e[r];if(s&&u[2]?u[1]!==t[u[0]]:!(u[0]in t))return!1}for(;++r<a;){u=e[r];var c=u[0],l=t[c],f=u[1];if(s&&u[2]){if(void 0===l&&!(c in t))return!1}else{var p=n?n(l,f,c):void 0;if(!(void 0===p?i(f,l,n,!0):p))return!1}}return!0}var i=t("./baseIsEqual"),o=t("./toObject");e.exports=r},{"./baseIsEqual":73,"./toObject":128}],76:[function(t,e,n){function r(){}e.exports=r},{}],77:[function(t,e,n){function r(t){var e=o(t);if(1==e.length&&e[0][2]){var n=e[0][0],r=e[0][1];return function(t){return null==t?!1:t[n]===r&&(void 0!==r||n in a(t))}}return function(t){return i(t,e)}}var i=t("./baseIsMatch"),o=t("./getMatchData"),a=t("./toObject");e.exports=r},{"./baseIsMatch":75,"./getMatchData":106,"./toObject":128}],78:[function(t,e,n){function r(t,e){var n=s(t),r=u(t)&&c(e),h=t+"";return t=p(t),function(s){if(null==s)return!1;var u=h;if(s=f(s),!(!n&&r||u in s)){if(s=1==t.length?s:i(s,a(t,0,-1)),null==s)return!1;u=l(t),s=f(s)}return s[u]===e?void 0!==e||u in s:o(e,s[u],void 0,!0)}}var i=t("./baseGet"),o=t("./baseIsEqual"),a=t("./baseSlice"),s=t("../lang/isArray"),u=t("./isKey"),c=t("./isStrictComparable"),l=t("../array/last"),f=t("./toObject"),p=t("./toPath");e.exports=r},{"../array/last":47,"../lang/isArray":133,"./baseGet":72,"./baseIsEqual":73,"./baseSlice":82,"./isKey":114,"./isStrictComparable":118,"./toObject":128,"./toPath":129}],79:[function(t,e,n){function r(t){return function(e){return null==e?void 0:e[t]}}e.exports=r},{}],80:[function(t,e,n){function r(t){var e=t+"";return t=o(t),function(n){return i(n,t,e)}}var i=t("./baseGet"),o=t("./toPath");e.exports=r},{"./baseGet":72,"./toPath":129}],81:[function(t,e,n){var r=t("../utility/identity"),i=t("./metaMap"),o=i?function(t,e){return i.set(t,e),t}:r;e.exports=o},{"../utility/identity":153,"./metaMap":120}],82:[function(t,e,n){function r(t,e,n){var r=-1,i=t.length;e=null==e?0:+e||0,0>e&&(e=-e>i?0:i+e),n=void 0===n||n>i?i:+n||0,0>n&&(n+=i),i=e>n?0:n-e>>>0,e>>>=0;for(var o=Array(i);++r<i;)o[r]=t[r+e];return o}e.exports=r},{}],83:[function(t,e,n){function r(t){return null==t?"":t+""}e.exports=r},{}],84:[function(t,e,n){function r(t,e){for(var n=-1,r=e.length,i=Array(r);++n<r;)i[n]=t[e[n]];return i}e.exports=r},{}],85:[function(t,e,n){function r(t,e,n){if("function"!=typeof t)return i;if(void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 3:return function(n,r,i){return t.call(e,n,r,i)};case 4:return function(n,r,i,o){return t.call(e,n,r,i,o)};case 5:return function(n,r,i,o,a){return t.call(e,n,r,i,o,a)}}return function(){return t.apply(e,arguments)}}var i=t("../utility/identity");e.exports=r},{"../utility/identity":153}],86:[function(t,e,n){(function(t){function n(t){var e=new r(t.byteLength),n=new i(e);return n.set(new i(t)),e}var r=t.ArrayBuffer,i=t.Uint8Array;e.exports=n}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}],87:[function(t,e,n){function r(t,e,n){for(var r=n.length,o=-1,a=i(t.length-r,0),s=-1,u=e.length,c=Array(u+a);++s<u;)c[s]=e[s];for(;++o<r;)c[n[o]]=t[o];for(;a--;)c[s++]=t[o++];return c}var i=Math.max;e.exports=r},{}],88:[function(t,e,n){function r(t,e,n){for(var r=-1,o=n.length,a=-1,s=i(t.length-o,0),u=-1,c=e.length,l=Array(s+c);++a<s;)l[a]=t[a];for(var f=a;++u<c;)l[f+u]=e[u];for(;++r<o;)l[f+n[r]]=t[a++];return l}var i=Math.max;e.exports=r},{}],89:[function(t,e,n){function r(t){return a(function(e,n){var r=-1,a=null==e?0:n.length,s=a>2?n[a-2]:void 0,u=a>2?n[2]:void 0,c=a>1?n[a-1]:void 0;for("function"==typeof s?(s=i(s,c,5),a-=2):(s="function"==typeof c?c:void 0,a-=s?1:0),u&&o(n[0],n[1],u)&&(s=3>a?void 0:s,a=1);++r<a;){var l=n[r];l&&t(e,l,s)}return e})}var i=t("./bindCallback"),o=t("./isIterateeCall"),a=t("../function/restParam");e.exports=r},{"../function/restParam":53,"./bindCallback":85,"./isIterateeCall":113}],90:[function(t,e,n){function r(t){return function(e,n,r){for(var o=i(e),a=r(e),s=a.length,u=t?s:-1;t?u--:++u<s;){var c=a[u];if(n(o[c],c,o)===!1)break}return e}}var i=t("./toObject");e.exports=r},{"./toObject":128}],91:[function(t,e,n){(function(n){function r(t,e){function r(){var i=this&&this!==n&&this instanceof r?o:t;return i.apply(e,arguments)}var o=i(t);return r}var i=t("./createCtorWrapper");e.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./createCtorWrapper":93}],92:[function(t,e,n){function r(t){return function(e){for(var n=-1,r=o(i(e)),a=r.length,s="";++n<a;)s=t(s,r[n],n);return s}}var i=t("../string/deburr"),o=t("../string/words");e.exports=r},{"../string/deburr":149,"../string/words":150}],93:[function(t,e,n){function r(t){return function(){var e=arguments;switch(e.length){case 0:return new t;case 1:return new t(e[0]);case 2:return new t(e[0],e[1]);case 3:return new t(e[0],e[1],e[2]);case 4:return new t(e[0],e[1],e[2],e[3]);case 5:return new t(e[0],e[1],e[2],e[3],e[4]);case 6:return new t(e[0],e[1],e[2],e[3],e[4],e[5]);case 7:return new t(e[0],e[1],e[2],e[3],e[4],e[5],e[6])}var n=i(t.prototype),r=t.apply(n,e);return o(r)?r:n}}var i=t("./baseCreate"),o=t("../lang/isObject");e.exports=r},{"../lang/isObject":136,"./baseCreate":67}],94:[function(t,e,n){function r(t,e){return i(function(n){var r=n[0];return null==r?r:(n.push(e),t.apply(void 0,n))})}var i=t("../function/restParam");e.exports=r},{"../function/restParam":53}],95:[function(t,e,n){(function(n){function r(t,e,x,w,j,A,O,k,E,S){function C(){for(var d=arguments.length,v=d,g=Array(d);v--;)g[v]=arguments[v];if(w&&(g=o(g,w,j)),A&&(g=a(g,A,O)),T||D){var b=C.placeholder,U=l(g,b);if(d-=U.length,S>d){var P=k?i(k):void 0,F=_(S-d,0),M=T?U:void 0,z=T?void 0:U,B=T?g:void 0,W=T?void 0:g;e|=T?y:m,e&=~(T?m:y),q||(e&=~(p|h));var V=[t,e,x,B,M,W,z,P,E,F],$=r.apply(void 0,V);return u(t)&&f($,V),$.placeholder=b,$}}var H=L?x:this,K=R?H[t]:t;return k&&(g=c(g,k)),I&&E<g.length&&(g.length=E),this&&this!==n&&this instanceof C&&(K=N||s(t)),K.apply(H,g)}var I=e&b,L=e&p,R=e&h,T=e&v,q=e&d,D=e&g,N=R?void 0:s(t);return C}var i=t("./arrayCopy"),o=t("./composeArgs"),a=t("./composeArgsRight"),s=t("./createCtorWrapper"),u=t("./isLaziable"),c=t("./reorder"),l=t("./replaceHolders"),f=t("./setData"),p=1,h=2,d=4,v=8,g=16,y=32,m=64,b=128,_=Math.max;e.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./arrayCopy":57,"./composeArgs":87,"./composeArgsRight":88,"./createCtorWrapper":93,"./isLaziable":115,"./reorder":124,"./replaceHolders":125,"./setData":126}],96:[function(t,e,n){function r(t){return function(e,n,r){var a={};return n=i(n,r,3),o(e,function(e,r,i){var o=n(e,r,i);r=t?o:r,e=t?e:o,a[r]=e}),a}}var i=t("./baseCallback"),o=t("./baseForOwn");e.exports=r},{"./baseCallback":64,"./baseForOwn":71}],97:[function(t,e,n){(function(n){function r(t,e,r,a){function s(){for(var e=-1,i=arguments.length,o=-1,l=a.length,f=Array(l+i);++o<l;)f[o]=a[o];for(;i--;)f[o++]=arguments[++e];var p=this&&this!==n&&this instanceof s?c:t;return p.apply(u?r:this,f)}var u=e&o,c=i(t);return s}var i=t("./createCtorWrapper"),o=1;e.exports=r}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./createCtorWrapper":93}],98:[function(t,e,n){function r(t,e,n,r,y,m,b,_){var x=e&p;if(!x&&"function"!=typeof t)throw new TypeError(v);var w=r?r.length:0;if(w||(e&=~(h|d),r=y=void 0),w-=y?y.length:0,e&d){var j=r,A=y;r=y=void 0}var O=x?void 0:u(t),k=[t,e,n,r,y,j,A,m,b,_];if(O&&(c(k,O),e=k[1],_=k[9]),k[9]=null==_?x?0:t.length:g(_-w,0)||0,e==f)var E=o(k[0],k[2]);else E=e!=h&&e!=(f|h)||k[4].length?a.apply(void 0,k):s.apply(void 0,k);var S=O?i:l;return S(E,k)}var i=t("./baseSetData"),o=t("./createBindWrapper"),a=t("./createHybridWrapper"),s=t("./createPartialWrapper"),u=t("./getData"),c=t("./mergeData"),l=t("./setData"),f=1,p=2,h=32,d=64,v="Expected a function",g=Math.max;e.exports=r},{"./baseSetData":81,"./createBindWrapper":91,"./createHybridWrapper":95,"./createPartialWrapper":97,"./getData":103,"./mergeData":119,"./setData":126}],99:[function(t,e,n){function r(t){return i[t]}var i={"À":"A","Á":"A","Â":"A","Ã":"A","Ä":"A","Å":"A","à":"a","á":"a","â":"a","ã":"a","ä":"a","å":"a","Ç":"C","ç":"c","Ð":"D","ð":"d","È":"E","É":"E","Ê":"E","Ë":"E","è":"e","é":"e","ê":"e","ë":"e","Ì":"I","Í":"I","Î":"I","Ï":"I","ì":"i","í":"i","î":"i","ï":"i","Ñ":"N","ñ":"n","Ò":"O","Ó":"O","Ô":"O","Õ":"O","Ö":"O","Ø":"O","ò":"o","ó":"o","ô":"o","õ":"o","ö":"o","ø":"o","Ù":"U","Ú":"U","Û":"U","Ü":"U","ù":"u","ú":"u","û":"u","ü":"u","Ý":"Y","ý":"y","ÿ":"y","Æ":"Ae","æ":"ae","Þ":"Th","þ":"th","ß":"ss"};e.exports=r},{}],100:[function(t,e,n){function r(t,e,n,r,o,a,s){var u=-1,c=t.length,l=e.length;if(c!=l&&!(o&&l>c))return!1;for(;++u<c;){var f=t[u],p=e[u],h=r?r(o?p:f,o?f:p,u):void 0;if(void 0!==h){if(h)continue;return!1}if(o){if(!i(e,function(t){return f===t||n(f,t,r,o,a,s)}))return!1}else if(f!==p&&!n(f,p,r,o,a,s))return!1}return!0}var i=t("./arraySome");e.exports=r},{"./arraySome":60}],101:[function(t,e,n){function r(t,e,n){switch(n){case i:case o:return+t==+e;case a:return t.name==e.name&&t.message==e.message;case s:return t!=+t?e!=+e:t==+e;case u:case c:return t==e+""}return!1}var i="[object Boolean]",o="[object Date]",a="[object Error]",s="[object Number]",u="[object RegExp]",c="[object String]";e.exports=r},{}],102:[function(t,e,n){function r(t,e,n,r,o,s,u){var c=i(t),l=c.length,f=i(e),p=f.length;if(l!=p&&!o)return!1;for(var h=l;h--;){var d=c[h];if(!(o?d in e:a.call(e,d)))return!1}for(var v=o;++h<l;){d=c[h];var g=t[d],y=e[d],m=r?r(o?y:g,o?g:y,d):void 0;if(!(void 0===m?n(g,y,r,o,s,u):m))return!1;v||(v="constructor"==d)}if(!v){var b=t.constructor,_=e.constructor;if(b!=_&&"constructor"in t&&"constructor"in e&&!("function"==typeof b&&b instanceof b&&"function"==typeof _&&_ instanceof _))return!1}return!0}var i=t("../object/keys"),o=Object.prototype,a=o.hasOwnProperty;e.exports=r},{"../object/keys":142}],103:[function(t,e,n){var r=t("./metaMap"),i=t("../utility/noop"),o=r?function(t){return r.get(t)}:i;e.exports=o},{"../utility/noop":156,"./metaMap":120}],104:[function(t,e,n){function r(t){for(var e=t.name,n=i[e],r=n?n.length:0;r--;){var o=n[r],a=o.func;if(null==a||a==t)return o.name}return e}var i=t("./realNames");e.exports=r},{"./realNames":123}],105:[function(t,e,n){var r=t("./baseProperty"),i=r("length");e.exports=i},{"./baseProperty":79}],106:[function(t,e,n){function r(t){for(var e=o(t),n=e.length;n--;)e[n][2]=i(e[n][1]);return e}var i=t("./isStrictComparable"),o=t("../object/pairs");e.exports=r},{"../object/pairs":145,"./isStrictComparable":118}],107:[function(t,e,n){function r(t,e){var n=null==t?void 0:t[e];return i(n)?n:void 0}var i=t("../lang/isNative");e.exports=r},{"../lang/isNative":135}],108:[function(t,e,n){function r(t){var e=t.length,n=new t.constructor(e);return e&&"string"==typeof t[0]&&o.call(t,"index")&&(n.index=t.index,n.input=t.input),n}var i=Object.prototype,o=i.hasOwnProperty;e.exports=r},{}],109:[function(t,e,n){function r(t,e,n){var r=t.constructor;switch(e){case l:return i(t);case o:case a:return new r(+t);case f:case p:case h:case d:case v:case g:case y:case m:case b:var x=t.buffer;return new r(n?i(x):x,t.byteOffset,t.length);case s:case c:return new r(t);case u:var w=new r(t.source,_.exec(t));w.lastIndex=t.lastIndex}return w}var i=t("./bufferClone"),o="[object Boolean]",a="[object Date]",s="[object Number]",u="[object RegExp]",c="[object String]",l="[object ArrayBuffer]",f="[object Float32Array]",p="[object Float64Array]",h="[object Int8Array]",d="[object Int16Array]",v="[object Int32Array]",g="[object Uint8Array]",y="[object Uint8ClampedArray]",m="[object Uint16Array]",b="[object Uint32Array]",_=/\w*$/;e.exports=r},{"./bufferClone":86}],110:[function(t,e,n){function r(t){var e=t.constructor;return"function"==typeof e&&e instanceof e||(e=Object),new e}e.exports=r},{}],111:[function(t,e,n){function r(t){return null!=t&&o(i(t))}var i=t("./getLength"),o=t("./isLength");e.exports=r},{"./getLength":105,"./isLength":116}],112:[function(t,e,n){function r(t,e){return t="number"==typeof t||i.test(t)?+t:-1,e=null==e?o:e,t>-1&&t%1==0&&e>t}var i=/^\d+$/,o=9007199254740991;e.exports=r},{}],113:[function(t,e,n){function r(t,e,n){if(!a(n))return!1;var r=typeof e;if("number"==r?i(n)&&o(e,n.length):"string"==r&&e in n){var s=n[e];return t===t?t===s:s!==s}return!1}var i=t("./isArrayLike"),o=t("./isIndex"),a=t("../lang/isObject");e.exports=r},{"../lang/isObject":136,"./isArrayLike":111,"./isIndex":112}],114:[function(t,e,n){function r(t,e){var n=typeof t;if("string"==n&&s.test(t)||"number"==n)return!0;if(i(t))return!1;var r=!a.test(t);return r||null!=e&&t in o(e)}var i=t("../lang/isArray"),o=t("./toObject"),a=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\n\\]|\\.)*?\1)\]/,s=/^\w*$/;e.exports=r},{"../lang/isArray":133,"./toObject":128}],115:[function(t,e,n){function r(t){var e=a(t);if(!(e in i.prototype))return!1;var n=s[e];if(t===n)return!0;var r=o(n);return!!r&&t===r[0]}var i=t("./LazyWrapper"),o=t("./getData"),a=t("./getFuncName"),s=t("../chain/lodash");e.exports=r},{"../chain/lodash":50,"./LazyWrapper":55,"./getData":103,"./getFuncName":104}],116:[function(t,e,n){function r(t){return"number"==typeof t&&t>-1&&t%1==0&&i>=t}var i=9007199254740991;e.exports=r},{}],117:[function(t,e,n){function r(t){return!!t&&"object"==typeof t}e.exports=r},{}],118:[function(t,e,n){function r(t){return t===t&&!i(t)}var i=t("../lang/isObject");e.exports=r},{"../lang/isObject":136}],119:[function(t,e,n){function r(t,e){var n=t[1],r=e[1],v=n|r,g=f>v,y=r==f&&n==l||r==f&&n==p&&t[7].length<=e[8]||r==(f|p)&&n==l;if(!g&&!y)return t;r&u&&(t[2]=e[2],v|=n&u?0:c);var m=e[3];if(m){var b=t[3];t[3]=b?o(b,m,e[4]):i(m),t[4]=b?s(t[3],h):i(e[4])}return m=e[5],m&&(b=t[5],t[5]=b?a(b,m,e[6]):i(m),t[6]=b?s(t[5],h):i(e[6])),m=e[7],m&&(t[7]=i(m)),r&f&&(t[8]=null==t[8]?e[8]:d(t[8],e[8])),null==t[9]&&(t[9]=e[9]),t[0]=e[0],t[1]=v,t}var i=t("./arrayCopy"),o=t("./composeArgs"),a=t("./composeArgsRight"),s=t("./replaceHolders"),u=1,c=4,l=8,f=128,p=256,h="__lodash_placeholder__",d=Math.min;e.exports=r},{"./arrayCopy":57,"./composeArgs":87,"./composeArgsRight":88,"./replaceHolders":125}],120:[function(t,e,n){(function(n){var r=t("./getNative"),i=r(n,"WeakMap"),o=i&&new i;e.exports=o}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{"./getNative":107}],121:[function(t,e,n){function r(t,e){t=i(t);for(var n=-1,r=e.length,o={};++n<r;){var a=e[n];a in t&&(o[a]=t[a])}return o}var i=t("./toObject");e.exports=r},{"./toObject":128}],122:[function(t,e,n){function r(t,e){var n={};return i(t,function(t,r,i){e(t,r,i)&&(n[r]=t)}),n}var i=t("./baseForIn");e.exports=r},{"./baseForIn":70}],123:[function(t,e,n){var r={};e.exports=r},{}],124:[function(t,e,n){function r(t,e){for(var n=t.length,r=a(e.length,n),s=i(t);r--;){var u=e[r];t[r]=o(u,n)?s[u]:void 0}return t}var i=t("./arrayCopy"),o=t("./isIndex"),a=Math.min;e.exports=r},{"./arrayCopy":57,"./isIndex":112}],125:[function(t,e,n){function r(t,e){for(var n=-1,r=t.length,o=-1,a=[];++n<r;)t[n]===e&&(t[n]=i,a[++o]=n);return a}var i="__lodash_placeholder__";e.exports=r},{}],126:[function(t,e,n){var r=t("./baseSetData"),i=t("../date/now"),o=150,a=16,s=function(){var t=0,e=0;return function(n,s){var u=i(),c=a-(u-e);if(e=u,c>0){if(++t>=o)return n}else t=0;return r(n,s)}}();e.exports=s},{"../date/now":51,"./baseSetData":81}],127:[function(t,e,n){function r(t){for(var e=u(t),n=e.length,r=n&&t.length,c=!!r&&s(r)&&(o(t)||i(t)),f=-1,p=[];++f<n;){var h=e[f];(c&&a(h,r)||l.call(t,h))&&p.push(h)}return p}var i=t("../lang/isArguments"),o=t("../lang/isArray"),a=t("./isIndex"),s=t("./isLength"),u=t("../object/keysIn"),c=Object.prototype,l=c.hasOwnProperty;e.exports=r},{"../lang/isArguments":132,"../lang/isArray":133,"../object/keysIn":143,"./isIndex":112,"./isLength":116}],128:[function(t,e,n){function r(t){return i(t)?t:Object(t)}var i=t("../lang/isObject");e.exports=r},{"../lang/isObject":136}],129:[function(t,e,n){function r(t){if(o(t))return t;var e=[];return i(t).replace(a,function(t,n,r,i){e.push(r?i.replace(s,"$1"):n||t)}),e}var i=t("./baseToString"),o=t("../lang/isArray"),a=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\n\\]|\\.)*?)\2)\]/g,s=/\\(\\)?/g;e.exports=r},{"../lang/isArray":133,"./baseToString":83}],130:[function(t,e,n){function r(t){return t instanceof i?t.clone():new o(t.__wrapped__,t.__chain__,a(t.__actions__))}var i=t("./LazyWrapper"),o=t("./LodashWrapper"),a=t("./arrayCopy");e.exports=r},{"./LazyWrapper":55,"./LodashWrapper":56,"./arrayCopy":57}],131:[function(t,e,n){function r(t,e,n,r){return e&&"boolean"!=typeof e&&a(t,e,n)?e=!1:"function"==typeof e&&(r=n,n=e,e=!1),"function"==typeof n?i(t,e,o(n,r,1)):i(t,e)}var i=t("../internal/baseClone"),o=t("../internal/bindCallback"),a=t("../internal/isIterateeCall");e.exports=r},{"../internal/baseClone":65,"../internal/bindCallback":85,"../internal/isIterateeCall":113}],132:[function(t,e,n){function r(t){return o(t)&&i(t)&&s.call(t,"callee")&&!u.call(t,"callee")}var i=t("../internal/isArrayLike"),o=t("../internal/isObjectLike"),a=Object.prototype,s=a.hasOwnProperty,u=a.propertyIsEnumerable;e.exports=r},{"../internal/isArrayLike":111,"../internal/isObjectLike":117}],133:[function(t,e,n){var r=t("../internal/getNative"),i=t("../internal/isLength"),o=t("../internal/isObjectLike"),a="[object Array]",s=Object.prototype,u=s.toString,c=r(Array,"isArray"),l=c||function(t){return o(t)&&i(t.length)&&u.call(t)==a};e.exports=l},{"../internal/getNative":107,"../internal/isLength":116,"../internal/isObjectLike":117}],134:[function(t,e,n){function r(t){return i(t)&&s.call(t)==o}var i=t("./isObject"),o="[object Function]",a=Object.prototype,s=a.toString;e.exports=r},{"./isObject":136}],135:[function(t,e,n){function r(t){return null==t?!1:i(t)?l.test(u.call(t)):o(t)&&a.test(t)}var i=t("./isFunction"),o=t("../internal/isObjectLike"),a=/^\[object .+?Constructor\]$/,s=Object.prototype,u=Function.prototype.toString,c=s.hasOwnProperty,l=RegExp("^"+u.call(c).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");e.exports=r},{"../internal/isObjectLike":117,"./isFunction":134}],136:[function(t,e,n){function r(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}e.exports=r},{}],137:[function(t,e,n){function r(t){return"string"==typeof t||i(t)&&s.call(t)==o}var i=t("../internal/isObjectLike"),o="[object String]",a=Object.prototype,s=a.toString;e.exports=r},{"../internal/isObjectLike":117}],138:[function(t,e,n){function r(t){return o(t)&&i(t.length)&&!!C[L.call(t)]}var i=t("../internal/isLength"),o=t("../internal/isObjectLike"),a="[object Arguments]",s="[object Array]",u="[object Boolean]",c="[object Date]",l="[object Error]",f="[object Function]",p="[object Map]",h="[object Number]",d="[object Object]",v="[object RegExp]",g="[object Set]",y="[object String]",m="[object WeakMap]",b="[object ArrayBuffer]",_="[object Float32Array]",x="[object Float64Array]",w="[object Int8Array]",j="[object Int16Array]",A="[object Int32Array]",O="[object Uint8Array]",k="[object Uint8ClampedArray]",E="[object Uint16Array]",S="[object Uint32Array]",C={};C[_]=C[x]=C[w]=C[j]=C[A]=C[O]=C[k]=C[E]=C[S]=!0,C[a]=C[s]=C[b]=C[u]=C[c]=C[l]=C[f]=C[p]=C[h]=C[d]=C[v]=C[g]=C[y]=C[m]=!1;var I=Object.prototype,L=I.toString;e.exports=r},{"../internal/isLength":116,"../internal/isObjectLike":117}],139:[function(t,e,n){var r=t("../internal/assignWith"),i=t("../internal/baseAssign"),o=t("../internal/createAssigner"),a=o(function(t,e,n){return n?r(t,e,n):i(t,e)});e.exports=a},{"../internal/assignWith":62,"../internal/baseAssign":63,"../internal/createAssigner":89}],140:[function(t,e,n){var r=t("./assign"),i=t("../internal/assignDefaults"),o=t("../internal/createDefaults"),a=o(r,i);e.exports=a},{"../internal/assignDefaults":61,"../internal/createDefaults":94,"./assign":139}],141:[function(t,e,n){e.exports=t("./assign")},{"./assign":139}],142:[function(t,e,n){var r=t("../internal/getNative"),i=t("../internal/isArrayLike"),o=t("../lang/isObject"),a=t("../internal/shimKeys"),s=r(Object,"keys"),u=s?function(t){var e=null==t?void 0:t.constructor;return"function"==typeof e&&e.prototype===t||"function"!=typeof t&&i(t)?a(t):o(t)?s(t):[]}:a;e.exports=u},{"../internal/getNative":107,"../internal/isArrayLike":111,"../internal/shimKeys":127,"../lang/isObject":136}],143:[function(t,e,n){function r(t){if(null==t)return[];u(t)||(t=Object(t));var e=t.length;e=e&&s(e)&&(o(t)||i(t))&&e||0;for(var n=t.constructor,r=-1,c="function"==typeof n&&n.prototype===t,f=Array(e),p=e>0;++r<e;)f[r]=r+"";for(var h in t)p&&a(h,e)||"constructor"==h&&(c||!l.call(t,h))||f.push(h);return f}var i=t("../lang/isArguments"),o=t("../lang/isArray"),a=t("../internal/isIndex"),s=t("../internal/isLength"),u=t("../lang/isObject"),c=Object.prototype,l=c.hasOwnProperty;e.exports=r},{"../internal/isIndex":112,"../internal/isLength":116,"../lang/isArguments":132,"../lang/isArray":133,"../lang/isObject":136}],144:[function(t,e,n){var r=t("../internal/createObjectMapper"),i=r();e.exports=i},{"../internal/createObjectMapper":96}],145:[function(t,e,n){function r(t){t=o(t);for(var e=-1,n=i(t),r=n.length,a=Array(r);++e<r;){var s=n[e];a[e]=[s,t[s]]}return a}var i=t("./keys"),o=t("../internal/toObject");e.exports=r},{"../internal/toObject":128,"./keys":142}],146:[function(t,e,n){var r=t("../internal/baseFlatten"),i=t("../internal/bindCallback"),o=t("../internal/pickByArray"),a=t("../internal/pickByCallback"),s=t("../function/restParam"),u=s(function(t,e){return null==t?{}:"function"==typeof e[0]?a(t,i(e[0],e[1],3)):o(t,r(e))});e.exports=u},{"../function/restParam":53,"../internal/baseFlatten":68,"../internal/bindCallback":85,"../internal/pickByArray":121,"../internal/pickByCallback":122}],147:[function(t,e,n){function r(t){return i(t,o(t))}var i=t("../internal/baseValues"),o=t("./keys");e.exports=r},{"../internal/baseValues":84,"./keys":142}],148:[function(t,e,n){var r=t("../internal/createCompounder"),i=r(function(t,e,n){return e=e.toLowerCase(),
t+(n?e.charAt(0).toUpperCase()+e.slice(1):e)});e.exports=i},{"../internal/createCompounder":92}],149:[function(t,e,n){function r(t){return t=i(t),t&&t.replace(s,o).replace(a,"")}var i=t("../internal/baseToString"),o=t("../internal/deburrLetter"),a=/[\u0300-\u036f\ufe20-\ufe23]/g,s=/[\xc0-\xd6\xd8-\xde\xdf-\xf6\xf8-\xff]/g;e.exports=r},{"../internal/baseToString":83,"../internal/deburrLetter":99}],150:[function(t,e,n){function r(t,e,n){return n&&o(t,e,n)&&(e=void 0),t=i(t),t.match(e||a)||[]}var i=t("../internal/baseToString"),o=t("../internal/isIterateeCall"),a=function(){var t="[A-Z\\xc0-\\xd6\\xd8-\\xde]",e="[a-z\\xdf-\\xf6\\xf8-\\xff]+";return RegExp(t+"+(?="+t+e+")|"+t+"?"+e+"|"+t+"+|[0-9]+","g")}();e.exports=r},{"../internal/baseToString":83,"../internal/isIterateeCall":113}],151:[function(t,e,n){function r(t,e,n){return n&&o(t,e,n)&&(e=void 0),a(t)?s(t):i(t,e)}var i=t("../internal/baseCallback"),o=t("../internal/isIterateeCall"),a=t("../internal/isObjectLike"),s=t("./matches");e.exports=r},{"../internal/baseCallback":64,"../internal/isIterateeCall":113,"../internal/isObjectLike":117,"./matches":155}],152:[function(t,e,n){function r(t){return function(){return t}}e.exports=r},{}],153:[function(t,e,n){function r(t){return t}e.exports=r},{}],154:[function(t,e,n){e.exports=t("./callback")},{"./callback":151}],155:[function(t,e,n){function r(t){return o(i(t,!0))}var i=t("../internal/baseClone"),o=t("../internal/baseMatches");e.exports=r},{"../internal/baseClone":65,"../internal/baseMatches":77}],156:[function(t,e,n){function r(){}e.exports=r},{}],157:[function(t,e,n){function r(t){return a(t)?i(t):o(t)}var i=t("../internal/baseProperty"),o=t("../internal/basePropertyDeep"),a=t("../internal/isKey");e.exports=r},{"../internal/baseProperty":79,"../internal/basePropertyDeep":80,"../internal/isKey":114}],158:[function(t,e,n){function r(t){var e=!1;return function(){return e?void 0:(e=!0,t.apply(this,arguments))}}e.exports=r,r.proto=r(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return r(this)},configurable:!0})})},{}],159:[function(t,e,n){var r=t("trim"),i=t("for-each"),o=function(t){return"[object Array]"===Object.prototype.toString.call(t)};e.exports=function(t){if(!t)return{};var e={};return i(r(t).split("\n"),function(t){var n=t.indexOf(":"),i=r(t.slice(0,n)).toLowerCase(),a=r(t.slice(n+1));"undefined"==typeof e[i]?e[i]=a:o(e[i])?e[i].push(a):e[i]=[e[i],a]}),e}},{"for-each":43,trim:167}],160:[function(t,e,n){e.exports=t("./lib/")},{"./lib/":161}],161:[function(t,e,n){var r=t("./stringify"),i=t("./parse");e.exports={stringify:r,parse:i}},{"./parse":162,"./stringify":163}],162:[function(t,e,n){var r=t("./utils"),i={delimiter:"&",depth:5,arrayLimit:20,parameterLimit:1e3,strictNullHandling:!1};i.parseValues=function(t,e){for(var n={},i=t.split(e.delimiter,e.parameterLimit===1/0?void 0:e.parameterLimit),o=0,a=i.length;a>o;++o){var s=i[o],u=-1===s.indexOf("]=")?s.indexOf("="):s.indexOf("]=")+1;if(-1===u)n[r.decode(s)]="",e.strictNullHandling&&(n[r.decode(s)]=null);else{var c=r.decode(s.slice(0,u)),l=r.decode(s.slice(u+1));Object.prototype.hasOwnProperty.call(n,c)?n[c]=[].concat(n[c]).concat(l):n[c]=l}}return n},i.parseObject=function(t,e,n){if(!t.length)return e;var r,o=t.shift();if("[]"===o)r=[],r=r.concat(i.parseObject(t,e,n));else{r=Object.create(null);var a="["===o[0]&&"]"===o[o.length-1]?o.slice(1,o.length-1):o,s=parseInt(a,10),u=""+s;!isNaN(s)&&o!==a&&u===a&&s>=0&&n.parseArrays&&s<=n.arrayLimit?(r=[],r[s]=i.parseObject(t,e,n)):r[a]=i.parseObject(t,e,n)}return r},i.parseKeys=function(t,e,n){if(t){n.allowDots&&(t=t.replace(/\.([^\.\[]+)/g,"[$1]"));var r=/^([^\[\]]*)/,o=/(\[[^\[\]]*\])/g,a=r.exec(t),s=[];a[1]&&s.push(a[1]);for(var u=0;null!==(a=o.exec(t))&&u<n.depth;)++u,s.push(a[1]);return a&&s.push("["+t.slice(a.index)+"]"),i.parseObject(s,e,n)}},e.exports=function(t,e){if(""===t||null===t||"undefined"==typeof t)return Object.create(null);e=e||{},e.delimiter="string"==typeof e.delimiter||r.isRegExp(e.delimiter)?e.delimiter:i.delimiter,e.depth="number"==typeof e.depth?e.depth:i.depth,e.arrayLimit="number"==typeof e.arrayLimit?e.arrayLimit:i.arrayLimit,e.parseArrays=e.parseArrays!==!1,e.allowDots=e.allowDots!==!1,e.parameterLimit="number"==typeof e.parameterLimit?e.parameterLimit:i.parameterLimit,e.strictNullHandling="boolean"==typeof e.strictNullHandling?e.strictNullHandling:i.strictNullHandling;for(var n="string"==typeof t?i.parseValues(t,e):t,o=Object.create(null),a=Object.keys(n),s=0,u=a.length;u>s;++s){var c=a[s],l=i.parseKeys(c,n[c],e);o=r.merge(o,l)}return r.compact(o)}},{"./utils":164}],163:[function(t,e,n){var r=t("./utils"),i={delimiter:"&",arrayPrefixGenerators:{brackets:function(t,e){return t+"[]"},indices:function(t,e){return t+"["+e+"]"},repeat:function(t,e){return t}},strictNullHandling:!1};i.stringify=function(t,e,n,o,a){if("function"==typeof a)t=a(e,t);else if(r.isBuffer(t))t=t.toString();else if(t instanceof Date)t=t.toISOString();else if(null===t){if(o)return r.encode(e);t=""}if("string"==typeof t||"number"==typeof t||"boolean"==typeof t)return[r.encode(e)+"="+r.encode(t)];var s=[];if("undefined"==typeof t)return s;for(var u=Array.isArray(a)?a:Object.keys(t),c=0,l=u.length;l>c;++c){var f=u[c];s=s.concat(Array.isArray(t)?i.stringify(t[f],n(e,f),n,o,a):i.stringify(t[f],e+"["+f+"]",n,o,a))}return s},e.exports=function(t,e){e=e||{};var n,r,o="undefined"==typeof e.delimiter?i.delimiter:e.delimiter,a="boolean"==typeof e.strictNullHandling?e.strictNullHandling:i.strictNullHandling;"function"==typeof e.filter?(r=e.filter,t=r("",t)):Array.isArray(e.filter)&&(n=r=e.filter);var s=[];if("object"!=typeof t||null===t)return"";var u;u=e.arrayFormat in i.arrayPrefixGenerators?e.arrayFormat:"indices"in e?e.indices?"indices":"repeat":"indices";var c=i.arrayPrefixGenerators[u];n||(n=Object.keys(t));for(var l=0,f=n.length;f>l;++l){var p=n[l];s=s.concat(i.stringify(t[p],p,c,a,r))}return s.join(o)}},{"./utils":164}],164:[function(t,e,n){var r={};r.hexTable=new Array(256);for(var i=0;256>i;++i)r.hexTable[i]="%"+((16>i?"0":"")+i.toString(16)).toUpperCase();n.arrayToObject=function(t){for(var e=Object.create(null),n=0,r=t.length;r>n;++n)"undefined"!=typeof t[n]&&(e[n]=t[n]);return e},n.merge=function(t,e){if(!e)return t;if("object"!=typeof e)return Array.isArray(t)?t.push(e):"object"==typeof t?t[e]=!0:t=[t,e],t;if("object"!=typeof t)return t=[t].concat(e);Array.isArray(t)&&!Array.isArray(e)&&(t=n.arrayToObject(t));for(var r=Object.keys(e),i=0,o=r.length;o>i;++i){var a=r[i],s=e[a];t[a]?t[a]=n.merge(t[a],s):t[a]=s}return t},n.decode=function(t){try{return decodeURIComponent(t.replace(/\+/g," "))}catch(e){return t}},n.encode=function(t){if(0===t.length)return t;"string"!=typeof t&&(t=""+t);for(var e="",n=0,i=t.length;i>n;++n){var o=t.charCodeAt(n);45===o||46===o||95===o||126===o||o>=48&&57>=o||o>=65&&90>=o||o>=97&&122>=o?e+=t[n]:128>o?e+=r.hexTable[o]:2048>o?e+=r.hexTable[192|o>>6]+r.hexTable[128|63&o]:55296>o||o>=57344?e+=r.hexTable[224|o>>12]+r.hexTable[128|o>>6&63]+r.hexTable[128|63&o]:(++n,o=65536+((1023&o)<<10|1023&t.charCodeAt(n)),e+=r.hexTable[240|o>>18]+r.hexTable[128|o>>12&63]+r.hexTable[128|o>>6&63]+r.hexTable[128|63&o])}return e},n.compact=function(t,e){if("object"!=typeof t||null===t)return t;e=e||[];var r=e.indexOf(t);if(-1!==r)return e[r];if(e.push(t),Array.isArray(t)){for(var i=[],o=0,a=t.length;a>o;++o)"undefined"!=typeof t[o]&&i.push(t[o]);return i}var s=Object.keys(t);for(o=0,a=s.length;a>o;++o){var u=s[o];t[u]=n.compact(t[u],e)}return t},n.isRegExp=function(t){return"[object RegExp]"===Object.prototype.toString.call(t)},n.isBuffer=function(t){return null===t||"undefined"==typeof t?!1:!!(t.constructor&&t.constructor.isBuffer&&t.constructor.isBuffer(t))}},{}],165:[function(t,e,n){"use strict";var r=function(){var t=4022871197,e=function(e){if(e){e=e.toString();for(var n=0;n<e.length;n++){t+=e.charCodeAt(n);var r=.02519603282416938*t;t=r>>>0,r-=t,r*=t,t=r>>>0,r-=t,t+=4294967296*r}return 2.3283064365386963e-10*(t>>>0)}t=4022871197};return e},i=function(t){return function(){var e,n,i=48,o=1,a=i,s=new Array(i),u=0,c=new r;for(e=0;i>e;e++)s[e]=c(Math.random());var l=function(){++a>=i&&(a=0);var t=1768863*s[a]+2.3283064365386963e-10*o;return s[a]=t-(o=0|t)},f=function(t){return Math.floor(t*(l()+1.1102230246251565e-16*(2097152*l()|0)))};f.string=function(t){var e,n="";for(e=0;t>e;e++)n+=String.fromCharCode(33+f(94));return n};var p=function(){var t=Array.prototype.slice.call(arguments);for(e=0;e<t.length;e++)for(n=0;i>n;n++)s[n]-=c(t[e]),s[n]<0&&(s[n]+=1)};return f.cleanString=function(t){return t=t.replace(/(^\s*)|(\s*$)/gi,""),t=t.replace(/[\x00-\x1F]/gi,""),t=t.replace(/\n /,"\n")},f.hashString=function(t){for(t=f.cleanString(t),c(t),e=0;e<t.length;e++)for(u=t.charCodeAt(e),n=0;i>n;n++)s[n]-=c(u),s[n]<0&&(s[n]+=1)},f.seed=function(t){("undefined"==typeof t||null===t)&&(t=Math.random()),"string"!=typeof t&&(t=JSON.stringify(t)||""),f.initState(),f.hashString(t)},f.addEntropy=function(){var t=[];for(e=0;e<arguments.length;e++)t.push(arguments[e]);p(u++ +(new Date).getTime()+t.join("")+Math.random())},f.initState=function(){for(c(),e=0;i>e;e++)s[e]=c(" ");o=1,a=i},f.done=function(){c=null},"undefined"!=typeof t&&f.seed(t),f.range=function(t){return f(t)},f.random=function(){return f(Number.MAX_VALUE-1)/Number.MAX_VALUE},f.floatBetween=function(t,e){return f.random()*(e-t)+t},f.intBetween=function(t,e){return Math.floor(f.random()*(e-t+1))+t},f}()};i.create=function(t){return new i(t)},e.exports=i},{}],166:[function(t,e,n){"use strict";function r(t,e){e||(e=t,t=r.defaultEmitter()),this.addListener=r._bind(t.addListener,t,e),this.on=r._bind(t.on,t,e),this.once=r._bind(t.once,t,e),this.removeListener=r._bind(t.removeListener,t,e),this.removeAllListeners=r._bind(t.removeAllListeners,t,e),this.listeners=r._bind(t.listeners,t,e),this.emit=r._bind(t.emit,t,e)}e.exports=r,r._bind=function(t,e){var n=[].slice.call(arguments,2);return t.bind(e,n)},r.defaultEmitter=function(){return new t("events").EventEmitter()}},{}],167:[function(t,e,n){function r(t){return t.replace(/^\s*|\s*$/g,"")}n=e.exports=r,n.left=function(t){return t.replace(/^\s*/,"")},n.right=function(t){return t.replace(/\s*$/,"")}},{}],168:[function(t,e,n){var r=[].indexOf;e.exports=function(t,e){if(r)return t.indexOf(e);for(var n=0;n<t.length;++n)if(t[n]===e)return n;return-1}},{}],169:[function(t,e,n){"use strict";var r=Object.prototype.hasOwnProperty,i=Object.prototype.toString,o=t("./isArguments"),a=!{toString:null}.propertyIsEnumerable("toString"),s=function(){}.propertyIsEnumerable("prototype"),u=["toString","toLocaleString","valueOf","hasOwnProperty","isPrototypeOf","propertyIsEnumerable","constructor"],c=function(t){var e=null!==t&&"object"==typeof t,n="[object Function]"===i.call(t),c=o(t),l=e&&"[object String]"===i.call(t),f=[];if(!e&&!n&&!c)throw new TypeError("Object.keys called on a non-object");var p=s&&n;if(l&&t.length>0&&!r.call(t,0))for(var h=0;h<t.length;++h)f.push(String(h));if(c&&t.length>0)for(var d=0;d<t.length;++d)f.push(String(d));else for(var v in t)p&&"prototype"===v||!r.call(t,v)||f.push(String(v));if(a)for(var g=t.constructor,y=g&&g.prototype===t,m=0;m<u.length;++m)y&&"constructor"===u[m]||!r.call(t,u[m])||f.push(u[m]);return f};c.shim=function(){return Object.keys||(Object.keys=c),Object.keys||c},e.exports=c},{"./isArguments":170}],170:[function(t,e,n){"use strict";var r=Object.prototype.toString;e.exports=function(t){var e=r.call(t),n="[object Arguments]"===e;return n||(n="[object Array]"!==e&&null!==t&&"object"==typeof t&&"number"==typeof t.length&&t.length>=0&&"[object Function]"===r.call(t.callee)),n}},{}],171:[function(t,e,n){function r(){this.protocol=null,this.slashes=null,this.auth=null,this.host=null,this.port=null,this.hostname=null,this.hash=null,this.search=null,this.query=null,this.pathname=null,this.path=null,this.href=null}function i(t,e,n){if(t&&c(t)&&t instanceof r)return t;var i=new r;return i.parse(t,e,n),i}function o(t){return u(t)&&(t=i(t)),t instanceof r?t.format():r.prototype.format.call(t)}function a(t,e){return i(t,!1,!0).resolve(e)}function s(t,e){return t?i(t,!1,!0).resolveObject(e):e}function u(t){return"string"==typeof t}function c(t){return"object"==typeof t&&null!==t}function l(t){return null===t}function f(t){return null==t}function p(t,e){return t.substr(e>=0?e:t.length+e)}var h=t("punycode"),d=Object.keys||t("object-keys"),v=t("indexof");n.parse=i,n.resolve=a,n.resolveObject=s,n.format=o,n.Url=r;var g=/^([a-z0-9.+-]+:)/i,y=/:[0-9]*$/,m=["<",">",'"',"`"," ","\r","\n","	"],b=["{","}","|","\\","^","`"].concat(m),_=["'"].concat(b),x=["%","/","?",";","#"].concat(_),w=["/","?","#"],j=255,A=/^[a-z0-9A-Z_-]{0,63}$/,O=/^([a-z0-9A-Z_-]{0,63})(.*)$/,k={javascript:!0,"javascript:":!0},E={javascript:!0,"javascript:":!0},S={http:!0,https:!0,ftp:!0,gopher:!0,file:!0,"http:":!0,"https:":!0,"ftp:":!0,"gopher:":!0,"file:":!0},C=t("querystring");r.prototype.parse=function(t,e,n){if(!u(t))throw new TypeError("Parameter 'url' must be a string, not "+typeof t);var r=t;r=String(r).replace(/^\s+/,"").replace(/\s+$/,"");var i=g.exec(r);if(i){i=i[0];var o=i.toLowerCase();this.protocol=o,r=r.substr(i.length)}if(n||i||r.match(/^\/\/[^@\/]+@[^@\/]+/)){var a="//"===r.substr(0,2);!a||i&&E[i]||(r=r.substr(2),this.slashes=!0)}if(!E[i]&&(a||i&&!S[i])){for(var s=-1,c=0;c<w.length;c++){var l=v(r,w[c]);-1!==l&&(-1===s||s>l)&&(s=l)}var f,p;p=-1===s?r.lastIndexOf("@"):r.lastIndexOf("@",s),-1!==p&&(f=r.slice(0,p),r=r.slice(p+1),this.auth=decodeURIComponent(f)),s=-1;for(var c=0;c<x.length;c++){var l=v(r,x[c]);-1!==l&&(-1===s||s>l)&&(s=l)}-1===s&&(s=r.length),this.host=r.slice(0,s),r=r.slice(s),this.parseHost(),this.hostname=this.hostname||"";var d="["===this.hostname[0]&&"]"===this.hostname[this.hostname.length-1];if(!d)for(var y=this.hostname.split(/\./),c=0,m=y.length;m>c;c++){var b=y[c];if(b&&!b.match(A)){for(var I="",L=0,R=b.length;R>L;L++)I+=b.charCodeAt(L)>127?"x":b[L];if(!I.match(A)){var T=y.slice(0,c),q=y.slice(c+1),D=b.match(O);D&&(T.push(D[1]),q.unshift(D[2])),q.length&&(r="/"+q.join(".")+r),this.hostname=T.join(".");break}}}if(this.hostname.length>j?this.hostname="":this.hostname=this.hostname.toLowerCase(),!d){for(var N=this.hostname.split("."),U=[],c=0;c<N.length;++c){var P=N[c];U.push(P.match(/[^A-Za-z0-9_-]/)?"xn--"+h.encode(P):P)}this.hostname=U.join(".")}var F=this.port?":"+this.port:"",M=this.hostname||"";this.host=M+F,this.href+=this.host,d&&(this.hostname=this.hostname.substr(1,this.hostname.length-2),"/"!==r[0]&&(r="/"+r))}if(!k[o])for(var c=0,m=_.length;m>c;c++){var z=_[c],B=encodeURIComponent(z);B===z&&(B=escape(z)),r=r.split(z).join(B)}var W=v(r,"#");-1!==W&&(this.hash=r.substr(W),r=r.slice(0,W));var V=v(r,"?");if(-1!==V?(this.search=r.substr(V),this.query=r.substr(V+1),e&&(this.query=C.parse(this.query)),r=r.slice(0,V)):e&&(this.search="",this.query={}),r&&(this.pathname=r),S[o]&&this.hostname&&!this.pathname&&(this.pathname="/"),this.pathname||this.search){var F=this.pathname||"",P=this.search||"";this.path=F+P}return this.href=this.format(),this},r.prototype.format=function(){var t=this.auth||"";t&&(t=encodeURIComponent(t),t=t.replace(/%3A/i,":"),t+="@");var e=this.protocol||"",n=this.pathname||"",r=this.hash||"",i=!1,o="";this.host?i=t+this.host:this.hostname&&(i=t+(-1===v(this.hostname,":")?this.hostname:"["+this.hostname+"]"),this.port&&(i+=":"+this.port)),this.query&&c(this.query)&&d(this.query).length&&(o=C.stringify(this.query));var a=this.search||o&&"?"+o||"";return e&&":"!==p(e,-1)&&(e+=":"),this.slashes||(!e||S[e])&&i!==!1?(i="//"+(i||""),n&&"/"!==n.charAt(0)&&(n="/"+n)):i||(i=""),r&&"#"!==r.charAt(0)&&(r="#"+r),a&&"?"!==a.charAt(0)&&(a="?"+a),n=n.replace(/[?#]/g,function(t){return encodeURIComponent(t)}),a=a.replace("#","%23"),e+i+n+a+r},r.prototype.resolve=function(t){return this.resolveObject(i(t,!1,!0)).format()},r.prototype.resolveObject=function(t){if(u(t)){var e=new r;e.parse(t,!1,!0),t=e}for(var n=new r,i=d(this),o=0;o<i.length;o++){var a=i[o];n[a]=this[a]}if(n.hash=t.hash,""===t.href)return n.href=n.format(),n;if(t.slashes&&!t.protocol)return d(t).forEach(function(e){"protocol"!==e&&(n[e]=t[e])}),S[n.protocol]&&n.hostname&&!n.pathname&&(n.path=n.pathname="/"),n.href=n.format(),n;if(t.protocol&&t.protocol!==n.protocol){if(!S[t.protocol]){for(var i=d(t),o=0;o<i.length;o++){var a=i[o];n[a]=t[a]}return n.href=n.format(),n}if(n.protocol=t.protocol,t.host||E[t.protocol])n.pathname=t.pathname;else{for(var s=(t.pathname||"").split("/");s.length&&!(t.host=s.shift()););t.host||(t.host=""),t.hostname||(t.hostname=""),""!==s[0]&&s.unshift(""),s.length<2&&s.unshift(""),n.pathname=s.join("/")}if(n.search=t.search,n.query=t.query,n.host=t.host||"",n.auth=t.auth,n.hostname=t.hostname||t.host,n.port=t.port,n.pathname||n.search){var c=n.pathname||"",h=n.search||"";n.path=c+h}return n.slashes=n.slashes||t.slashes,n.href=n.format(),n}var g=n.pathname&&"/"===n.pathname.charAt(0),y=t.host||t.pathname&&"/"===t.pathname.charAt(0),m=y||g||n.host&&t.pathname,b=m,_=n.pathname&&n.pathname.split("/")||[],s=t.pathname&&t.pathname.split("/")||[],x=n.protocol&&!S[n.protocol];if(x&&(n.hostname="",n.port=null,n.host&&(""===_[0]?_[0]=n.host:_.unshift(n.host)),n.host="",t.protocol&&(t.hostname=null,t.port=null,t.host&&(""===s[0]?s[0]=t.host:s.unshift(t.host)),t.host=null),m=m&&(""===s[0]||""===_[0])),y)n.host=t.host||""===t.host?t.host:n.host,n.hostname=t.hostname||""===t.hostname?t.hostname:n.hostname,n.search=t.search,n.query=t.query,_=s;else if(s.length)_||(_=[]),_.pop(),_=_.concat(s),n.search=t.search,n.query=t.query;else if(!f(t.search)){if(x){n.hostname=n.host=_.shift();var w=n.host&&v(n.host,"@")>0?n.host.split("@"):!1;w&&(n.auth=w.shift(),n.host=n.hostname=w.shift())}return n.search=t.search,n.query=t.query,l(n.pathname)&&l(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.href=n.format(),n}if(!_.length)return n.pathname=null,n.search?n.path="/"+n.search:n.path=null,n.href=n.format(),n;for(var j=_.slice(-1)[0],A=(n.host||t.host)&&("."===j||".."===j)||""===j,O=0,o=_.length;o>=0;o--)j=_[o],"."==j?_.splice(o,1):".."===j?(_.splice(o,1),O++):O&&(_.splice(o,1),O--);if(!m&&!b)for(;O--;O)_.unshift("..");!m||""===_[0]||_[0]&&"/"===_[0].charAt(0)||_.unshift(""),A&&"/"!==p(_.join("/"),-1)&&_.push("");var k=""===_[0]||_[0]&&"/"===_[0].charAt(0);if(x){n.hostname=n.host=k?"":_.length?_.shift():"";var w=n.host&&v(n.host,"@")>0?n.host.split("@"):!1;w&&(n.auth=w.shift(),n.host=n.hostname=w.shift())}return m=m||n.host&&_.length,m&&!k&&_.unshift(""),_.length?n.pathname=_.join("/"):(n.pathname=null,n.path=null),l(n.pathname)&&l(n.search)||(n.path=(n.pathname?n.pathname:"")+(n.search?n.search:"")),n.auth=t.auth||n.auth,n.slashes=n.slashes||t.slashes,n.href=n.format(),n},r.prototype.parseHost=function(){var t=this.host,e=y.exec(t);e&&(e=e[0],":"!==e&&(this.port=e.substr(1)),t=t.substr(0,t.length-e.length)),t&&(this.hostname=t)}},{indexof:168,"object-keys":169,punycode:35,querystring:38}],172:[function(t,e,n){"use strict";function r(t){for(var e in t)if(t.hasOwnProperty(e))return!1;return!0}function i(t,e){function n(){4===f.readyState&&c()}function o(){var t=void 0;if(f.response?t=f.response:"text"!==f.responseType&&f.responseType||(t=f.responseText||f.responseXML),_)try{t=JSON.parse(t)}catch(e){}return t}function a(t){clearTimeout(d),t instanceof Error||(t=new Error(""+(t||"Unknown XMLHttpRequest Error"))),t.statusCode=0,e(t,l)}function c(){if(!h){var n;clearTimeout(d),n=t.useXDR&&void 0===f.status?200:1223===f.status?204:f.status;var r=l,i=null;0!==n?(r={body:o(),statusCode:n,method:g,headers:{},url:v,rawRequest:f},f.getAllResponseHeaders&&(r.headers=u(f.getAllResponseHeaders()))):i=new Error("Internal XMLHttpRequest Error"),e(i,r,r.body)}}var l={body:void 0,headers:{},statusCode:0,method:g,url:v,rawRequest:f};if("string"==typeof t&&(t={uri:t}),t=t||{},"undefined"==typeof e)throw new Error("callback argument missing");e=s(e);var f=t.xhr||null;f||(f=t.cors||t.useXDR?new i.XDomainRequest:new i.XMLHttpRequest);var p,h,d,v=f.url=t.uri||t.url,g=f.method=t.method||"GET",y=t.body||t.data,m=f.headers=t.headers||{},b=!!t.sync,_=!1;if("json"in t&&(_=!0,m.accept||m.Accept||(m.Accept="application/json"),"GET"!==g&&"HEAD"!==g&&(m["content-type"]||m["Content-Type"]||(m["Content-Type"]="application/json"),y=JSON.stringify(t.json))),f.onreadystatechange=n,f.onload=c,f.onerror=a,f.onprogress=function(){},f.ontimeout=a,f.open(g,v,!b,t.username,t.password),b||(f.withCredentials=!!t.withCredentials),!b&&t.timeout>0&&(d=setTimeout(function(){h=!0,f.abort("timeout");var t=new Error("XMLHttpRequest timeout");t.code="ETIMEDOUT",a(t)},t.timeout)),f.setRequestHeader)for(p in m)m.hasOwnProperty(p)&&f.setRequestHeader(p,m[p]);else if(t.headers&&!r(t.headers))throw new Error("Headers cannot be set on an XDomainRequest object");return"responseType"in t&&(f.responseType=t.responseType),"beforeSend"in t&&"function"==typeof t.beforeSend&&t.beforeSend(f),f.send(y),f}function o(){}var a=t("global/window"),s=t("once"),u=t("parse-headers");e.exports=i,i.XMLHttpRequest=a.XMLHttpRequest||o,i.XDomainRequest="withCredentials"in new i.XMLHttpRequest?i.XMLHttpRequest:a.XDomainRequest},{"global/window":44,once:158,"parse-headers":159}]},{},[2])(2)});
//# sourceMappingURL=absinthe.min.js.map
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/absinthe.min.js'

// global.js: begin JavaScript file: '/js/resource_ready.js'
// ================================================================================
window.Ss = window.Ss || {};
(function(Ss){
	Ss.ResourceReady = {}

	Ss.ResourceReady = {
		keys: {},
		add: function(key, callback){
			if(!this.keys[key]){
				this._createKey(key);	
			}
			var t = this.keys[key];

			if(t.ready){
				callback();
			}else{
				t.add(callback);
			}
		},
		ready: function(key){
			if(!this.keys[key]){
				this._createKey(key);	
			}
			
			this.keys[key].ready = 1;

			var callbacks = this.keys[key].getAll();
			for(var i = 0, l = callbacks.length; i < l ; i++){
				callbacks[i]();
			}
		},
		_createKey: function(key){
			var t = new Key(key)
			this.keys[key] = t;
			return t 
		}
	}

	var Key = function(name){
		this.name = name;
		this.ready = false;
		this.callbacks = [];
	}

	Key.prototype.add = function(callback){
		this.callbacks.push(callback);
	}

	Key.prototype.getAll = function(){
		var callbacks = this.callbacks;
		this.callbacks = [];
		return callbacks;
	}
	Ss.ResourceReady.Key = Key;

})(window.Ss);
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/resource_ready.js'

// global.js: begin JavaScript file: '/js/HandleCookie.js'
// ================================================================================
/***********
 * Handle Cookie
 * Manages check for cookie defined on image download and related modal (or not?) interactions.
 */
Ss = window.Ss || {};

(function (document, Ss, Date) {		
	var HandleCookie = {
		options: {
			cookieName: RegExp('cookie'),
			downloadUrl: '',
			pollInterval: 100,
			frameId: '',
			isIE7_8: false,
			insertParent: document.body,
			loaderId: '',
			unloadMessage: ''
		},
		initialize: function(options) {
			if (options) {
				Object.extend(this.options, options);
			}

			detectCookie.call(this);
		}
	};

	function insertFrame () {
		var frame = document.createElement('iframe');
		frame.id = this.options.frameId;
		frame.src = this.options.downloadUrl;
		this.options.insertParent.appendChild(frame);
	}

	function detectCookie () {
		var instance = this;

		if(this.options.isIE7_8 || (!this.options.isIE7_8 && !this.options.cookieName.test(document.cookie))) {
	 		insertFrame.call(this);
	 		bindUnload.call(this);

			var pollCookie = setInterval(function() {
				if(instance.options.cookieName.test(document.cookie)) {
					clearInterval(pollCookie);
					window.onbeforeunload = null;
					success.call(instance);
				}
			}, this.options.pollInterval);
		} else {
			success.call(instance);
		}
	}

	function success () {
		var loaderElement = document.getElementById(this.options.loaderId);
		loaderElement.className = 'loaded';
	}

	function bindUnload () {
		var message = this.options.unloadMessage;

	    window.onbeforeunload = function(e){
			e = e || window.event;

			if(e) {
				e.returnValue = message;
			}

			return message;
		}
	}

	Ss.HandleCookie = HandleCookie;
}(document, Ss, Date));
// --------------------------------------------------------------------------------
// global.js: end JavaScript file: '/js/HandleCookie.js'


// Cache Key Counter: 768



