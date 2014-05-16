;(function(window, navigator, document, undefined) {var utils, videoStream, index;
utils = {
    'URL': window.URL || window.webkitURL || window.mozURL || window.msURL,
    'getUserMedia': function () {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }(),
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
    'noop': function () {
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
            callback(new Error('Timed out while trying to start streaming'));
        },
        'errorCallback': function (obj) {
            // ERROR!!!
            new Error('getUserMedia cannot access the camera', obj);
        },
        'startStreaming': function (obj) {
            var self = this, errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop, streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop, completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop, videoElement = document.createElement('video'), cameraStream;
            videoElement.autoplay = true;
            utils.getUserMedia({ 'video': true }, function (stream) {
                streamedCallback();
                if (videoElement.mozSrcObject) {
                    videoElement.mozSrcObject = stream;
                } else if (utils.URL) {
                    videoElement.src = utils.URL.createObjectURL(stream);
                }
                cameraStream = stream;
                videoElement.play();
                videoElement.addEventListener('loadeddata', function (event) {
                    self.findVideoSize({
                        'videoElement': videoElement,
                        'cameraStream': cameraStream,
                        'completedCallback': completedCallback
                    });
                });
            }, errorCallback);
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
                    'error': self.errorCallback,
                    'streamed': function () {
                        // The streaming started somehow, so we can assume there is getUserMedia support
                        clearTimeout(noGetUserMediaSupportTimeout);
                    },
                    'completed': function (obj) {
                        var videoElement = this.videoElement = obj.videoElement, cameraStream = this.cameraStream = obj.cameraStream, width = obj.videoWidth, height = obj.videoHeight;
                        callback(cameraStream, videoElement, width, height);
                    }
                });
            } else {
                callback(new Error('Native device media streaming (getUserMedia) not supported in this browser.'));
            }
        },
        'stopVideoStreaming': function () {
            var cameraStream = this.cameraStream, videoElement = this.videoElement;
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
index = function () {
    videoStream.startVideoStreaming(function (cameraStream, videoElement, width, height) {
        console.log('cameraStream', cameraStream);
        console.log('videoElement', videoElement);
        console.log('width', width);
        console.log('height', height);
    });
}();}(window, window.navigator, document));