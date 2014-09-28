// utils.js
// ========

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define(function() {
  var utils = {
    'URL': (window.URL ||
      window.webkitURL ||
      window.mozURL ||
      window.msURL),
    'getUserMedia': (function() {
      var getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
      return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }()),
    'Blob': (window.Blob ||
      window.BlobBuilder ||
      window.WebKitBlobBuilder ||
      window.MozBlobBuilder ||
      window.MSBlobBuilder),
    'btoa': (function() {
      var btoa = window.btoa || function(input) {
        var output = '',
          i = 0,
          l = input.length,
          key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
          chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        while (i < l) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) enc3 = enc4 = 64;
          else if (isNaN(chr3)) enc4 = 64;
          output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
        }
        return output;
      };

      return btoa ? btoa.bind(window) : function() {};
    }()),
    'isObject': function(obj) {
      return obj && Object.prototype.toString.call(obj) === '[object Object]';
    },
    'isEmptyObject': function(obj) {
      return utils.isObject(obj) && !Object.keys(obj).length;
    },
    'isArray': function(arr) {
      return arr && Array.isArray(arr);
    },
    'isFunction': function(func) {
      return func && typeof func === 'function';
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
        return el && el.getContext && el.getContext('2d');
      },
      'webworkers': function() {
        return window.Worker;
      },
      'blob': function() {
        return utils.Blob;
      },
      'Uint8Array': function() {
        return window.Uint8Array;
      },
      'Uint32Array': function() {
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

        if (testEl && testEl.canPlayType) {
          // Check for MPEG-4 support
          supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';

          // Check for h264 support
          supportObj.h264 = (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"') ||
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
    'noop': function() {},
    'each': function(collection, callback) {
      var x, len;
      if (utils.isArray(collection)) {
        x = -1;
        len = collection.length;
        while (++x < len) {
          if (callback(x, collection[x]) === false) {
            break;
          }
        }
      } else if (utils.isObject(collection)) {
        for (x in collection) {
          if (collection.hasOwnProperty(x)) {
            if (callback(x, collection[x]) === false) {
              break;
            }
          }
        }
      }
    },
    'mergeOptions': function deepMerge(defaultOptions, userOptions) {
      if (!utils.isObject(defaultOptions) || !utils.isObject(userOptions) || !Object.keys) {
        return;
      }
      var newObj = {};

      utils.each(defaultOptions, function(key, val) {
        newObj[key] = defaultOptions[key];
      });

      utils.each(userOptions, function(key, val) {
        var currentUserOption = userOptions[key];
        if (!utils.isObject(currentUserOption)) {
          newObj[key] = currentUserOption;
        } else {
          if (!defaultOptions[key]) {
            newObj[key] = currentUserOption;
          } else {
            newObj[key] = deepMerge(defaultOptions[key], currentUserOption);
          }
        }
      });

      return newObj;
    },
    'setCSSAttr': function(elem, attr, val) {
      if (!utils.isElement(elem)) {
        return;
      }
      if (utils.isString(attr) && utils.isString(val)) {
        elem.style[attr] = val;
      } else if (utils.isObject(attr)) {
        utils.each(attr, function(key, val) {
          elem.style[key] = val;
        });
      }
    },
    'removeElement': function(node) {
      if (!utils.isElement(node)) {
        return;
      }
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    },
    'createWebWorker': function(content) {
      if (!utils.isString(content)) {
        return {};
      }
      try {
        var blob = new utils.Blob([content], {
            'type': 'text/javascript'
          }),
          objectUrl = utils.URL.createObjectURL(blob),
          worker = new Worker(objectUrl);

        return {
          'objectUrl': objectUrl,
          'worker': worker
        }
      } catch (e) {
        return '' + e;
      }
    },
    'getExtension': function(src) {
      return src.substr(src.lastIndexOf('.') + 1, src.length);
    },
    'getFontSize': function(options) {
      options = options || {};

      if (!document.body || (options.resizeFont === false)) {
        return options.fontSize;
      }

      var text = options.text,
        containerWidth = options.gifWidth, 
        fontSize = parseInt(options.fontSize, 10),
        minFontSize = parseInt(options.minFontSize, 10),
        div = document.createElement('div'),
        span = document.createElement('span');

      div.setAttribute('width', containerWidth);
      div.appendChild(span);

      span.innerHTML = text;
      span.style.fontSize = fontSize + 'px';
      span.style.textIndent = '-9999px';
      span.style.visibility = 'hidden';

      document.body.appendChild(span);

      while (span.offsetWidth > containerWidth && fontSize >= minFontSize) {
        span.style.fontSize = --fontSize + 'px';
      }

      document.body.removeChild(span);

      return fontSize + 'px';

    },
    'webWorkerError': false
  };

  return utils;
});