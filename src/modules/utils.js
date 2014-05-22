define(function() {
    var utils = {
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
        'Blob': (window.Blob ||
                window.BlobBuilder ||
                window.WebKitBlobBuilder ||
                window.MozBlobBuilder),
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
        'isSupported': {
            'canvas': function() {
                var el = document.createElement('canvas');
                return !!(el.getContext && el.getContext('2d'));
            },
            'console': function() {
                var console = window.console;
                return console && utils.isFunction(console.log);
            },
            'webworkers': function() {
                var worker = window.Worker;
                return utils.isFunction(worker);
            },
            'blob': function() {
                return utils.Blob;
            }
        },
        'log': function() {
            if(utils.isSupported.console()) {
                console.log.apply(window.console, arguments);
            }
        },
        'noop': function() {},
        'each': function(collection, callback) {
            var x, len;
            if(utils.isArray(collection)) {
                x = -1;
                len = collection.length;
                while(++x < len) {
                    if (callback(x, collection[x]) === false) {
                        break;
                    }
                }
            } else if(utils.isObject(collection)) {
                for(x in collection) {
                    if(collection.hasOwnProperty(x)) {
                        if (callback(x, collection[x]) === false) {
                            break;
                        }
                    }
                }
            }
        },
        'mergeOptions': function deepMerge(defaultOptions, userOptions) {
            if(!utils.isObject(defaultOptions) || !utils.isObject(userOptions) || !Object.keys) {
                return;
            }
            var newObj = {};

            utils.each(defaultOptions, function(key, val) {
                newObj[key] = defaultOptions[key];
            });

            utils.each(userOptions, function(key, val) {
                var currentUserOption = userOptions[key];
                if(!utils.isObject(currentUserOption)) {
                    newObj[key] = currentUserOption;
                } else {
                    if(!defaultOptions[key]) {
                        newObj[key] = currentUserOption;
                    } else {
                        newObj[key] = deepMerge(defaultOptions[key], currentUserOption);
                    }
                }
            });

            return newObj;
        },
        'setCSSAttr': function(elem, attr, val) {
            if(!utils.isElement(elem)) {
                return;
            }
            if(utils.isString(attr) && utils.isString(val)) {
                elem.style[attr] = val;
            } else if(utils.isObject(attr)) {
                utils.each(attr, function(key, val) {
                    elem.style[key] = val;
                });
            }
        },
        'removeElement': function(node) {
            if(!utils.isElement(node)) {
                return;
            }
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
        },
        'set': function(name, value){
          if(utils.isSupported.localStorage()){
              window.localStorage.setItem(name, value);
          }
        },
        'get': function(name){
          if(utils.isSupported.localStorage()){
            window.localStorage.getItem(name);
          }
        },
        'createWebWorker': function(content) {
            if(!utils.isString(content)) {
                return {};
            }
            try {
                var blob = new utils.Blob([content], {
                    'type': 'text/javascript'
                }),
                    objectUrl = window.URL.createObjectURL(blob),
                    worker = new Worker(objectUrl);

                return {
                    'objectUrl': objectUrl,
                    'worker': worker
                }
            } catch(e) {
                return {};
            }
        }
    };
    return utils;
});