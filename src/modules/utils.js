// utils.js
// ========
define(function() {
    var utils = {
        'URL': (window.URL ||
            window.webkitURL ||
            window.mozURL ||
            window.msURL),
        'getUserMedia': function getUserMedia() {
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
        'isObject': function isObject(obj) {
            if(!obj) {
                return false;
            }
            return Object.prototype.toString.call(obj) === '[object Object]';
        },
        'isArray': function isArray(arr) {
            if(!arr) {
                return false;
            }
            if('isArray' in Array) {
                return Array.isArray(arr);
            } else {
                return Object.prototype.toString.call(arr) === '[object Array]';
            }
        },
        'isFunction': function isFunction(func) {
            if(!func) {
                return false;
            }
            return Object.prototype.toString.call(func) === '[object Function]';
        },
        'isElement': function isElement(elem) {
            return elem && elem.nodeType === 1;
        },
        'isString': function isString(value) {
            return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
        },
        'isSupported': {
            'canvas': function canvas() {
                var el = document.createElement('canvas');
                return !!(el.getContext && el.getContext('2d'));
            },
            'console': function console() {
                var console = window.console;
                return console && utils.isFunction(console.log);
            },
            'webworkers': function webworkers() {
                return window.Worker;
            },
            'blob': function blob() {
                return utils.Blob;
            },
            'Uint8Array': function Uint8Array() {
                return window.Uint8Array;
            },
            'Uint32Array': function Uint32Array() {
                return window.Uint32Array;
            },
            'videoCodecs': (function() {
                var testEl = document.createElement('video'),
                    supportObj = {
                        'mp4': false,
                        'h264': false,
                        'ogv': false,
                        'ogg': false,
                        'webm': false
                    };
                if(testEl.canPlayType) {
                    // Check for MPEG-4 support
                    supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';

                    // Check for h264 support
                    supportObj.h264 = (testEl.canPlayType( 'video/mp4; codecs="avc1.42E01E"') ||
                        testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) !== '';

                    // Check for Ogv support
                    supportObj.ogv = testEl.canPlayType('video/ogg; codecs="theora"') !== '';

                    // Check for Ogg support
                    supportObj.ogg = testEl.canPlayType('video/ogg; codecs="theora"') !== '';

                    // Check for Webm support
                    supportObj.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"') !== -1;
                }

                return supportObj;
            }())
        },
        'log': function log() {
            if(utils.isSupported.console()) {
                console.log.apply(window.console, arguments);
            }
        },
        'noop': function noop() {},
        'each': function each(collection, callback) {
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
        'setCSSAttr': function setCSSAttr(elem, attr, val) {
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
        'removeElement': function removeElement(node) {
            if(!utils.isElement(node)) {
                return;
            }
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
        },
        'createWebWorker': function createWebWorker(content) {
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
