define({
    'URL': (window.URL ||
        window.webkitURL ||
        window.mozURL ||
        window.msURL),
    'getUserMedia': function() {
        var getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);
        return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }(),
    'isObject': function(obj) {
        if(!obj) {
            return false;
        }
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    'isArray': function(arr) {
        if(!arr) {
            return false;
        }
        if('isArray' in Array) {
            return Array.isArray(arr);
        } else {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }
    },
    'isFunction': function(func) {
        if(!func) {
            return false;
        }
        return Object.prototype.toString.call(func) === '[object Function]';
    },
    'isElement': function(elem) {
        return elem && elem.nodeType === 1;
    },
    'isString': function(value) {
        return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
    },
    'isCanvasSupported': function() {
      var el = document.createElement('canvas');
      return !!(el.getContext && el.getContext('2d'));
    },
    'isConsoleSupported': function() {
      var console = window.console;
      return console && this.isFunction(console.log);
    },
    'log': function() {
        if(this.isConsoleSupported()) {
            console.log.apply(window.console, arguments);
        }
    },
    'noop': function() {},
    'each': function(collection, callback) {
        var x, len;
        if(this.isArray(collection)) {
            x = -1;
            len = collection.length;
            while(++x < len) {
                if (callback(x, collection[x]) === false) {
                    break;
                }
            }
        } else if(this.isObject(collection)) {
            for(x in collection) {
                if(collection.hasOwnProperty(x)) {
                    if (callback(x, collection[x]) === false) {
                        break;
                    }
                }
            }
        }
    },
    'mergeOptions': function (defaultOptions, userOptions) {
        for(var i=1; i<arguments.length; i++) {
            for(var key in arguments[i]) {
                if(arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    },
    'setCSSAttr': function(elem, attr, val) {
        if(!this.isElement(elem)) {
            return;
        }
        if(this.isString(attr) && this.isString(val)) {
            elem.style[attr] = val;
        } else if(this.isObject(attr)) {
            this.each(attr, function(key, val) {
                elem.style[key] = val;
            });
        }
    }
});
