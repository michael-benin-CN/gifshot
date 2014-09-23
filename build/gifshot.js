/*Copyrights for code authored by Yahoo Inc. is licensed under the following terms:
MIT License
Copyright  2014 Yahoo Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function(window, document, navigator, undefined) {
var utils, error, defaultOptions, isSupported, isWebCamGIFSupported, isExistingImagesGIFSupported, isExistingVideoGIFSupported, NeuQuant, processFrameWorker, gifWriter, AnimatedGIF, getBase64GIF, existingImages, screenShot, videoStream, stopVideoStreaming, createAndGetGIF, existingVideo, existingWebcam, createGIF, takeSnapShot, API, _index_;
utils = function () {
  var utils = {
    'URL': window.URL || window.webkitURL || window.mozURL || window.msURL,
    'getUserMedia': function () {
      var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }(),
    'Blob': window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder,
    'btoa': function () {
      var btoa = window.btoa || function (input) {
        var output = '', i = 0, l = input.length, key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        while (i < l) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = (chr1 & 3) << 4 | chr2 >> 4;
          enc3 = (chr2 & 15) << 2 | chr3 >> 6;
          enc4 = chr3 & 63;
          if (isNaN(chr2))
            enc3 = enc4 = 64;
          else if (isNaN(chr3))
            enc4 = 64;
          output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
        }
        return output;
      };
      return btoa ? btoa.bind(window) : function () {
      };
    }(),
    'isObject': function (obj) {
      return obj && Object.prototype.toString.call(obj) === '[object Object]';
    },
    'isEmptyObject': function (obj) {
      return utils.isObject(obj) && !Object.keys(obj).length;
    },
    'isArray': function (arr) {
      return arr && Array.isArray(arr);
    },
    'isFunction': function (func) {
      return func && typeof func === 'function';
    },
    'isElement': function (elem) {
      return elem && elem.nodeType === 1;
    },
    'isString': function (value) {
      return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
    },
    'isSupported': {
      'canvas': function () {
        var el = document.createElement('canvas');
        return el && el.getContext && el.getContext('2d');
      },
      'webworkers': function () {
        return window.Worker;
      },
      'blob': function () {
        return utils.Blob;
      },
      'Uint8Array': function () {
        return window.Uint8Array;
      },
      'Uint32Array': function () {
        return window.Uint32Array;
      },
      'videoCodecs': function () {
        var testEl = document.createElement('video'), supportObj = {
            'mp4': false,
            'h264': false,
            'ogv': false,
            'ogg': false,
            'webm': false
          };
        if (testEl && testEl.canPlayType) {
          supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';
          supportObj.h264 = (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"') || testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) !== '';
          supportObj.ogv = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
          supportObj.ogg = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
          supportObj.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"') !== -1;
        }
        return supportObj;
      }()
    },
    'noop': function () {
    },
    'each': function (collection, callback) {
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
      utils.each(defaultOptions, function (key, val) {
        newObj[key] = defaultOptions[key];
      });
      utils.each(userOptions, function (key, val) {
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
    'setCSSAttr': function (elem, attr, val) {
      if (!utils.isElement(elem)) {
        return;
      }
      if (utils.isString(attr) && utils.isString(val)) {
        elem.style[attr] = val;
      } else if (utils.isObject(attr)) {
        utils.each(attr, function (key, val) {
          elem.style[key] = val;
        });
      }
    },
    'removeElement': function (node) {
      if (!utils.isElement(node)) {
        return;
      }
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    },
    'createWebWorker': function (content) {
      if (!utils.isString(content)) {
        return {};
      }
      try {
        var blob = new utils.Blob([content], { 'type': 'text/javascript' }), objectUrl = utils.URL.createObjectURL(blob), worker = new Worker(objectUrl);
        return {
          'objectUrl': objectUrl,
          'worker': worker
        };
      } catch (e) {
        return '' + e;
      }
    },
    'getExtension': function (src) {
      return src.substr(src.lastIndexOf('.') + 1, src.length);
    },
    'getFontSize': function (text, containerWidth, maxFontSize, minFontSize) {
      if (!document.body) {
        return;
      }
      var div = document.createElement('div'), span = document.createElement('span'), fontSize = maxFontSize;
      div.setAttribute('width', containerWidth);
      div.appendChild(span);
      span.innerHTML = text;
      span.style.fontSize = maxFontSize + 'px';
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
}();
error = function () {
  var error = {
    'validate': function (skipObj) {
      skipObj = utils.isObject(skipObj) ? skipObj : {};
      var errorObj = {};
      utils.each(error.validators, function (indece, currentValidator) {
        var errorCode = currentValidator.errorCode;
        if (!skipObj[errorCode] && !currentValidator.condition) {
          errorObj = currentValidator;
          errorObj.error = true;
          return false;
        }
      });
      delete errorObj.condition;
      return errorObj;
    },
    'isValid': function (skipObj) {
      var errorObj = error.validate(skipObj), isValid = errorObj.error !== true ? true : false;
      return isValid;
    },
    'validators': [
      {
        'condition': utils.isFunction(utils.getUserMedia),
        'errorCode': 'getUserMedia',
        'errorMsg': 'The getUserMedia API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.canvas(),
        'errorCode': 'canvas',
        'errorMsg': 'Canvas elements are not supported in your browser'
      },
      {
        'condition': utils.isSupported.webworkers(),
        'errorCode': 'webworkers',
        'errorMsg': 'The Web Workers API is not supported in your browser'
      },
      {
        'condition': utils.isFunction(utils.URL),
        'errorCode': 'window.URL',
        'errorMsg': 'The window.URL API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.blob(),
        'errorCode': 'window.Blob',
        'errorMsg': 'The window.Blob File API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.Uint8Array(),
        'errorCode': 'window.Uint8Array',
        'errorMsg': 'The window.Uint8Array function constructor is not supported in your browser'
      },
      {
        'condition': utils.isSupported.Uint32Array(),
        'errorCode': 'window.Uint32Array',
        'errorMsg': 'The window.Uint32Array function constructor is not supported in your browser'
      }
    ],
    'messages': {
      'videoCodecs': {
        'errorCode': 'videocodec',
        'errorMsg': 'The video codec you are trying to use is not supported in your browser'
      }
    }
  };
  return error;
}();
defaultOptions = {
  'sampleInterval': 10,
  'numWorkers': 2,
  'gifWidth': 200,
  'gifHeight': 200,
  'interval': 0.1,
  'numFrames': 10,
  'keepCameraOn': false,
  'images': [],
  'video': null,
  'webcamVideoElement': null,
  'cameraStream': null,
  'text': '',
  'fontWeight': 'normal',
  'fontSize': '16px',
  'fontFamily': 'sans-serif',
  'fontColor': '#FFF',
  'textAlign': 'center',
  'textBaseline': 'bottom',
  'textXCoordinate': null,
  'textYCoordinate': null,
  'progressCallback': function (captureProgress) {
  },
  'completeCallback': function () {
  },
  'saveRenderingContexts': false,
  'savedRenderingContexts': []
};
isSupported = function () {
  return error.isValid();
};
isWebCamGIFSupported = function () {
  return error.isValid();
};
isExistingImagesGIFSupported = function () {
  var skipObj = { 'getUserMedia': true };
  return error.isValid(skipObj);
};
isExistingVideoGIFSupported = function (codecs) {
  var isSupported = false, hasValidCodec = false;
  if (utils.isArray(codecs) && codecs.length) {
    utils.each(codecs, function (indece, currentCodec) {
      if (utils.isSupported.videoCodecs[currentCodec]) {
        hasValidCodec = true;
      }
    });
    if (!hasValidCodec) {
      return false;
    }
  } else if (utils.isString(codecs) && codecs.length) {
    if (!utils.isSupported.videoCodecs[codecs]) {
      return false;
    }
  }
  return error.isValid({ 'getUserMedia': true });
};
stopVideoStreaming = function (obj) {
  obj = utils.isObject(obj) ? obj : {};
  var options = utils.isObject(obj.options) ? obj.options : {}, cameraStream = obj.cameraStream, videoElement = obj.videoElement, webcamVideoElement = obj.webcamVideoElement;
  videoStream.stopVideoStreaming({
    'cameraStream': cameraStream,
    'videoElement': videoElement,
    'keepCameraOn': options.keepCameraOn,
    'webcamVideoElement': webcamVideoElement
  });
};
existingWebcam = function (obj) {
  var lastCameraStream = obj.lastCameraStream, callback = obj.callback, webcamVideoElement = obj.webcamVideoElement, options = obj.options;
  if (!isWebCamGIFSupported()) {
    return callback(error.validate());
  }
  if (options.savedRenderingContexts.length) {
    screenShot.getWebcamGIF(options, function (obj) {
      callback(obj);
    });
    return;
  }
  videoStream.startVideoStreaming(function (obj) {
    obj.options = options || {};
    createAndGetGIF(obj, callback);
  }, {
    'lastCameraStream': lastCameraStream,
    'callback': callback,
    'webcamVideoElement': webcamVideoElement
  });
};
createGIF = function (userOptions, callback) {
  callback = utils.isFunction(userOptions) ? userOptions : callback;
  userOptions = utils.isObject(userOptions) ? userOptions : {};
  if (!utils.isFunction(callback)) {
    return;
  }
  var options = utils.mergeOptions(defaultOptions, userOptions) || {}, lastCameraStream = userOptions.cameraStream, images = options.images, imagesLength = images ? images.length : 0, video = options.video, webcamVideoElement = options.webcamVideoElement;
  if (imagesLength) {
    existingImages({
      'images': images,
      'imagesLength': imagesLength,
      'callback': callback,
      'options': options
    });
  } else if (video) {
    existingVideo({
      'existingVideo': video,
      'callback': callback,
      'options': options
    });
  } else {
    existingWebcam({
      'lastCameraStream': lastCameraStream,
      'callback': callback,
      'webcamVideoElement': webcamVideoElement,
      'options': options
    });
  }
};
takeSnapShot = function (userOptions, callback) {
  callback = utils.isFunction(userOptions) ? userOptions : callback;
  userOptions = utils.isObject(userOptions) ? userOptions : {};
  if (!utils.isFunction(callback)) {
    return;
  }
  var mergedOptions = utils.mergeOptions(defaultOptions, userOptions), options = utils.mergeOptions(mergedOptions, {
      'interval': 0.1,
      'numFrames': 1
    });
  createGIF(options, callback);
};
API = function () {
  var gifshot = {
    'utils': utils,
    'error': error,
    'defaultOptions': defaultOptions,
    'createGIF': createGIF,
    'takeSnapShot': takeSnapShot,
    'stopVideoStreaming': stopVideoStreaming,
    'isSupported': isSupported,
    'isWebCamGIFSupported': isWebCamGIFSupported,
    'isExistingVideoGIFSupported': isExistingVideoGIFSupported,
    'isExistingImagesGIFSupported': isExistingImagesGIFSupported
  };
  return gifshot;
}();
(function () {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return API;
    });
  } else if (typeof exports !== 'undefined') {
    module.exports = API;
  } else {
    window.gifshot = API;
  }
}());
}(this || {}, typeof document !== "undefined" ? document : { createElement: function() {} }, this.navigator || {}));