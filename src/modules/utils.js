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
    'noop': function() {}
});
