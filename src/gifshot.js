;(function(window, navigator, document, undefined) {
var utils, videoStream, screenShot, index;
utils = {
    'URL': window.URL || window.webkitURL || window.mozURL || window.msURL,
    'getUserMedia': function () {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }(),
    'isLocalStorage': function () {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (e) {
            return false;
        }
    },
    'isObject': function (obj) {
        if (!obj) {
            return false;
        }
        return Object.prototype.toString.call(obj) === '[object Object]';
    },
    'isArray': function (arr) {
        if (!arr) {
            return false;
        }
        if ('isArray' in Array) {
            return Array.isArray(arr);
        } else {
            return Object.prototype.toString.call(arr) === '[object Array]';
        }
    },
    'isFunction': function (func) {
        if (!func) {
            return false;
        }
        return Object.prototype.toString.call(func) === '[object Function]';
    },
    'isElement': function (elem) {
        return elem && elem.nodeType === 1;
    },
    'isString': function (value) {
        return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
    },
    'isCanvasSupported': function () {
        var el = document.createElement('canvas');
        return !!(el.getContext && el.getContext('2d'));
    },
    'isConsoleSupported': function () {
        var console = window.console;
        return console && this.isFunction(console.log);
    },
    'log': function () {
        if (this.isConsoleSupported()) {
            console.log.apply(window.console, arguments);
        }
    },
    'noop': function () {
    },
    'each': function (collection, callback) {
        var x, len;
        if (this.isArray(collection)) {
            x = -1;
            len = collection.length;
            while (++x < len) {
                if (callback(x, collection[x]) === false) {
                    break;
                }
            }
        } else if (this.isObject(collection)) {
            for (x in collection) {
                if (collection.hasOwnProperty(x)) {
                    if (callback(x, collection[x]) === false) {
                        break;
                    }
                }
            }
        }
    },
    'mergeOptions': function (defaultOptions, userOptions) {
        for (var i = 1; i < arguments.length; i++) {
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    arguments[0][key] = arguments[i][key];
                }
            }
        }
        return arguments[0];
    },
    'setCSSAttr': function (elem, attr, val) {
        if (!this.isElement(elem)) {
            return;
        }
        if (this.isString(attr) && this.isString(val)) {
            elem.style[attr] = val;
        } else if (this.isObject(attr)) {
            this.each(attr, function (key, val) {
                elem.style[key] = val;
            });
        }
    },
    'set': function (name, value) {
        if (this.isLocalStorage()) {
            window.localStorage.setItem(name, value);
        }
    },
    'get': function (name) {
        if (this.isLocalStorage()) {
            window.localStorage.getItem(name);
        }
    }
};
videoStream = function () {
    return {
        'videoElement': undefined,
        'cameraStream': undefined,
        'defaultVideoDimensions': {
            'height': 640,
            'width': 480
        },
        'findVideoSize': function findVideoSize(obj) {
            var videoElement = obj.videoElement, cameraStream = obj.cameraStream, completedCallback = obj.completedCallback;
            if (!videoElement) {
                return;
            }
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                videoElement.removeEventListener('loadeddata', this.findVideoSize);
                completedCallback({
                    'videoElement': videoElement,
                    'cameraStream': cameraStream,
                    'videoWidth': videoElement.videoWidth,
                    'videoHeight': videoElement.videoHeight
                });
            } else {
                if (findVideoSize.attempts < 10) {
                    findVideoSize.attempts += 1;
                    setTimeout(findVideoSize, 200);
                } else {
                    completedCallback({
                        'videoElement': videoElement,
                        'cameraStream': cameraStream,
                        'videoWidth': this.defaultVideoDimensions.width,
                        'videoHeight': this.defaultVideoDimensions.height
                    });
                }
            }
        },
        'onStreamingTimeout': function (callback) {
            utils.log('Timed out while trying to start streaming');
            if (utils.isFunction(callback)) {
                callback({});
            }
        },
        'errorCallback': function (callback) {
            // ERROR!!!
            utils.log('getUserMedia cannot access the camera');
            if (utils.isFunction(callback)) {
                callback({});
            }
        },
        'stream': function (obj) {
            var self = this, videoElement = obj.videoElement, cameraStream = obj.cameraStream, streamedCallback = obj.streamedCallback, completedCallback = obj.completedCallback;
            streamedCallback();
            if (videoElement.mozSrcObject) {
                videoElement.mozSrcObject = cameraStream;
            } else if (utils.URL) {
                videoElement.src = utils.URL.createObjectURL(cameraStream);
            }
            videoElement.play();
            setTimeout(function checkLoadedData() {
                checkLoadedData.count = checkLoadedData.count || 0;
                if (self.loadedData === true) {
                    self.findVideoSize({
                        'videoElement': videoElement,
                        'cameraStream': cameraStream,
                        'completedCallback': completedCallback
                    });
                    self.loadedData = false;
                } else {
                    checkLoadedData.count += 1;
                    if (checkLoadedData.count > 10) {
                        self.findVideoSize({
                            'videoElement': videoElement,
                            'cameraStream': cameraStream,
                            'completedCallback': completedCallback
                        });
                    } else {
                        checkLoadedData();
                    }
                }
            }, 100);
        },
        'startStreaming': function (obj) {
            var self = this, errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop, streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop, completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop, videoElement = document.createElement('video'), lastCameraStream = obj.lastCameraStream, cameraStream;
            videoElement.autoplay = true;
            videoElement.addEventListener('loadeddata', function (event) {
                self.loadedData = true;
            });
            if (lastCameraStream) {
                self.stream({
                    'videoElement': videoElement,
                    'cameraStream': lastCameraStream,
                    'streamedCallback': streamedCallback,
                    'completedCallback': completedCallback
                });
            } else {
                utils.getUserMedia({ 'video': true }, function (stream) {
                    self.stream({
                        'videoElement': videoElement,
                        'cameraStream': stream,
                        'streamedCallback': streamedCallback,
                        'completedCallback': completedCallback
                    });
                }, errorCallback);
            }
        },
        startVideoStreaming: function (callback, options) {
            options = options || {};
            var self = this, noGetUserMediaSupportTimeout, timeoutLength = options.timeout !== undefined ? options.timeout : 0;
            if (utils.isFunction(utils.getUserMedia)) {
                // Some browsers apparently have support for video streaming because of the
                // presence of the getUserMedia function, but then do not answer our
                // calls for streaming.
                // So we'll set up this timeout and if nothing happens after a while, we'll
                // conclude that there's no actual getUserMedia support.
                if (timeoutLength > 0) {
                    noGetUserMediaSupportTimeout = setTimeout(function () {
                        self.onStreamingTimeout(callback);
                    }, 10000);
                }
                this.startStreaming({
                    'error': function () {
                        self.errorCallback(callback);
                    },
                    'streamed': function () {
                        // The streaming started somehow, so we can assume there is getUserMedia support
                        clearTimeout(noGetUserMediaSupportTimeout);
                    },
                    'completed': function (obj) {
                        var cameraStream = this.cameraStream = obj.cameraStream, videoElement = this.videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight;
                        callback({
                            'cameraStream': cameraStream,
                            'videoElement': videoElement,
                            'videoWidth': videoWidth,
                            'videoHeight': videoHeight
                        });
                    },
                    'lastCameraStream': options.lastCameraStream
                });
            } else {
                utils.log('Native device media streaming (getUserMedia) not supported in this browser.');
                callback({});
            }
        },
        'stopVideoStreaming': function (obj) {
            obj = utils.isObject(obj) ? obj : {};
            var cameraStream = obj.cameraStream || this.cameraStream, videoElement = obj.videoElement || this.videoElement;
            if (cameraStream) {
                cameraStream.stop();
            }
            if (videoElement) {
                videoElement.pause();
                // TODO free src url object
                videoElement.src = null;
                videoElement = null;
            }
        }
    };
}();
screenShot = function () {
    return {
        getWebcamGif: function (obj, callback) {
            callback = utils.isFunction(callback) ? callback : function () {
            };
            if (!utils.isCanvasSupported()) {
                utils.log('ERROR: Canvas not supported');
                callback();
                return;
            }
            var canvas = document.createElement('canvas'), context, videoElement = obj.videoElement, gifWidth = obj.gifWidth, gifHeight = obj.gifHeight, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight, sampleInterval = obj.sampleInterval, numWorkers = obj.numWorkers, workerPath = obj.workerPath, useQuantizer = obj.useQuantizer, dithering = obj.dithering, palette = obj.palette, crop = obj.crop, interval = obj.interval, progressCallback = obj.progressCallback, numFrames = obj.numFrames, pendingFrames = numFrames, ag = new Animated_GIF({
                    'sampleInterval': sampleInterval,
                    'numWorkers': numWorkers,
                    'workerPath': workerPath,
                    'useQuantizer': useQuantizer,
                    'dithering': dithering,
                    'palette': palette
                }), sourceX = Math.floor(crop.scaledWidth / 2), sourceWidth = videoWidth - crop.scaledWidth, sourceY = Math.floor(crop.scaledHeight / 2), sourceHeight = videoHeight - crop.scaledHeight, captureFrame = function () {
                    var framesLeft = pendingFrames - 1;
                    if (numFrames !== framesLeft + 1) {
                        context.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gifWidth, gifHeight);
                        ag.addFrameImageData(context.getImageData(0, 0, gifWidth, gifHeight));
                    }
                    pendingFrames = framesLeft;
                    // Call back with an r value indicating how far along we are in capture
                    progressCallback((numFrames - pendingFrames) / numFrames);
                    if (framesLeft > 0) {
                        setTimeout(captureFrame, interval * 1000);
                    }
                    if (!pendingFrames) {
                        ag.getBase64GIF(function (image) {
                            // Ensure workers are freed-so we avoid bug #103
                            // https://github.com/meatspaces/meatspace-chat/issues/103
                            ag.destroy();
                            callback(image);
                        });
                    }
                };
            numFrames = numFrames !== undefined ? numFrames : 3;
            interval = interval !== undefined ? interval : 0.1;
            // In seconds
            canvas.width = gifWidth;
            canvas.height = gifHeight;
            context = canvas.getContext('2d');
            ag.setSize(gifWidth, gifHeight);
            ag.setDelay(interval);
            captureFrame();
        },
        'getCropDimensions': function (obj) {
            var width = obj.videoWidth, height = obj.videoHeight, gifWidth = obj.gifWidth, gifHeight = obj.gifHeight, result = {
                    width: 0,
                    height: 0,
                    scaledWidth: 0,
                    scaledHeight: 0
                };
            if (width > height) {
                result.width = Math.round(width * (gifHeight / height)) - gifWidth;
                result.scaledWidth = Math.round(result.width * (height / gifHeight));
            } else {
                result.height = Math.round(height * (gifWidth / width)) - gifHeight;
                result.scaledHeight = Math.round(result.height * (width / gifWidth));
            }
            return result;
        }
    };
}();
index = function () {
    var lastCameraStream, lastVideoElement, gifshot = {
            'defaultOptions': {
                'gifWidth': 640,
                'gifHeight': 480,
                'interval': 0.2,
                'numFrames': 10,
                'progressCallback': function (captureProgress) {
                },
                'completeCallback': function () {
                },
                // how many pixels to skip when creating the palette. Default is 10. Less is better, but slower.
                'sampleInterval': 10,
                // how many web workers to use. Default is 2.
                'numWorkers': 2,
                // path to the Animated_GIF.worker.js file (or Animated_GIF.worker.min.js). Default is dist/Animated_GIF.worker.js, change accordingly if you place the files somewhere else than dist.
                'workerPath': 'src/vendor/Animated_GIF.worker.js',
                // this is true by default, and provides the highest quality results, at the cost of slower processing and bigger files. When this is enabled, a neural network quantizer will be used to find the best palette for each frame. No dithering is available in this case, as the colours are chosen with the quantizer too.
                'useQuantizer': true,
                // selects how to best spread the error in colour mapping, to conceal the fact that we're using a palette and not true color. Note that using this option automatically disables the aforementioned quantizer. Best results if you pass in a palette, but if not we'll create one using the colours in the first frame. Possible options:
                // bayer: creates a somewhat nice and retro 'x' hatched pattern
                // floyd: creates another somewhat retro look where error is spread, using the Floyd-Steinberg algorithm
                // closest: actually no dithering, just picks the closest colour from the palette per each pixel
                'dithering': null,
                // An array of integers containing a palette. E.g. [ 0xFF0000, 0x00FF00, 0x0000FF, 0x000000 ] contains red, green, blue and black. The length of a palette must be a power of 2, and contain between 2 and 256 colours.
                'palette': null
            },
            'createGIF': function (userOptions, callback) {
                userOptions = utils.isObject(userOptions) ? userOptions : {};
                callback = utils.isFunction(userOptions) ? userOptions : callback;
                var self = this, defaultOptions = gifshot.defaultOptions, options = utils.mergeOptions(defaultOptions, userOptions);
                videoStream.startVideoStreaming(function (obj) {
                    var cameraStream = obj.cameraStream, videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight, gifWidth = options.gifWidth, gifHeight = options.gifHeight, cropDimensions = screenShot.getCropDimensions({
                            'videoWidth': videoWidth,
                            'videoHeight': videoHeight,
                            'gifHeight': gifHeight,
                            'gifWidth': gifWidth
                        }), completeCallback = callback;
                    lastCameraStream = cameraStream;
                    lastVideoElement = videoElement;
                    options.crop = cropDimensions;
                    options.videoElement = videoElement;
                    options.videoWidth = videoWidth;
                    options.videoHeight = videoHeight;
                    if (!utils.isElement(videoElement)) {
                        return;
                    }
                    videoElement.src = utils.URL.createObjectURL(cameraStream);
                    videoElement.width = gifWidth + cropDimensions.width;
                    videoElement.height = gifHeight + cropDimensions.height;
                    utils.setCSSAttr(videoElement, {
                        'position': 'absolute',
                        'width': gifWidth + cropDimensions.videoWidth + 'px',
                        'height': gifHeight + cropDimensions.videoHeight + 'px',
                        'left': -Math.floor(cropDimensions.videoWidth / 2) + 'px',
                        'top': -Math.floor(cropDimensions.videoHeight / 2) + 'px',
                        'opacity': '0'
                    });
                    document.body.appendChild(videoElement);
                    // Firefox doesn't seem to obey autoplay if the element is not in the DOM when the content
                    // is loaded, so we must manually trigger play after adding it, or the video will be frozen
                    videoElement.play();
                    screenShot.getWebcamGif(options, completeCallback);
                }, { 'lastCameraStream': lastCameraStream });
            },
            'takeSnapShot': function (obj, callback) {
                var defaultOptions = utils.mergeOptions(gifshot.defaultOptions, obj), options = utils.mergeOptions(defaultOptions, {
                        'interval': 0.1,
                        'numFrames': 2
                    });
                this.createGIF(options, callback);
            },
            'stopVideoStreaming': function (obj) {
                obj = utils.isObject(obj) ? obj : {};
                var cameraStream = obj.cameraStream || lastCameraStream, videoElement = obj.videoElement || lastVideoElement;
                videoStream.stopVideoStreaming({
                    'cameraStream': cameraStream,
                    'videoElement': videoElement
                });
                lastCameraStream = null;
            }
        };
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, and plain browser loading
    if (typeof define === 'function' && define.amd) {
        define('gifshot', [], function () {
            return gifshot;
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = gifshot;
    } else {
        window.gifshot = gifshot;
    }
}();
}(window, window.navigator, document));