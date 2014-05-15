define(function() {

  return {

    isObject: function(obj) {
        if(!obj) {
            return false;
        }
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isArray: function(arr) {
        if(!arr) {
            return false;
        }
        if('isArray' in Array) {
            return Array.isArray(arr);
        } else {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }
    },
    isFunction: function(func) {
        if(!func) {
            return false;
        }
        return Object.prototype.toString.call(func) === '[object Function]';
    }

  };

});
