// videoStream.js
// ==============

// Inspired from https://github.com/sole/gumhelper/blob/master/gumhelper.js

/* Copyright  2014 Yahoo Inc. 
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils'
], function(utils) {
  return {
    'loadedData': false,
    'defaultVideoDimensions': {
      'width': 640,
      'height': 480
    },
    'findVideoSize': function findVideoSizeMethod(obj) {
      findVideoSizeMethod.attempts = findVideoSizeMethod.attempts || 0;

      var self = this,
        videoElement = obj.videoElement,
        cameraStream = obj.cameraStream,
        completedCallback = obj.completedCallback;

      if (!videoElement) {
        return;
      }

      if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        videoElement.removeEventListener('loadeddata', self.findVideoSize);
        completedCallback({
          'videoElement': videoElement,
          'cameraStream': cameraStream,
          'videoWidth': videoElement.videoWidth,
          'videoHeight': videoElement.videoHeight
        });
      } else {
        if (findVideoSizeMethod.attempts < 10) {
          findVideoSizeMethod.attempts += 1;
          setTimeout(function() {
            self.findVideoSize(obj);
          }, 200);
        } else {
          completedCallback({
            'videoElement': videoElement,
            'cameraStream': cameraStream,
            'videoWidth': self.defaultVideoDimensions.width,
            'videoHeight': self.defaultVideoDimensions.height,
          });
        }
      }
    },
    'onStreamingTimeout': function(callback) {
      if (utils.isFunction(callback)) {
        callback({
          'error': true,
          'errorCode': 'getUserMedia',
          'errorMsg': 'There was an issue with the getUserMedia API - Timed out while trying to start streaming',
          'image': null,
          'cameraStream': {}
        });
      }
    },
    'stream': function(obj) {
      var self = this,
        existingVideo = utils.isArray(obj.existingVideo) ? obj.existingVideo[0] : obj.existingVideo,
        videoElement = obj.videoElement,
        cameraStream = obj.cameraStream,
        streamedCallback = obj.streamedCallback,
        completedCallback = obj.completedCallback;

      if (utils.isFunction(streamedCallback)) {
        streamedCallback();
      }

      if (existingVideo) {
        if (utils.isString(existingVideo)) {
          videoElement.src = existingVideo;
          videoElement.innerHTML = '<source src="' + existingVideo + '" type="video/' + utils.getExtension(existingVideo) + '" />';
        }
      } else if (videoElement.mozSrcObject) {
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
    'startStreaming': function(obj) {
      var self = this,
        errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop,
        streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop,
        completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop,
        existingVideo = obj.existingVideo,
        webcamVideoElement = obj.webcamVideoElement,
        videoElement = utils.isElement(existingVideo) ? existingVideo : webcamVideoElement ? webcamVideoElement : document.createElement('video'),
        lastCameraStream = obj.lastCameraStream,
        cameraStream;

      videoElement.crossOrigin = 'Anonymous';

      videoElement.autoplay = true;

      videoElement.loop = true;

      videoElement.muted = true;

      videoElement.addEventListener('loadeddata', function(event) {
        self.loadedData = true;
      });

      if (existingVideo) {
        self.stream({
          'videoElement': videoElement,
          'existingVideo': existingVideo,
          'completedCallback': completedCallback
        });
      } else if (lastCameraStream) {
        self.stream({
          'videoElement': videoElement,
          'cameraStream': lastCameraStream,
          'streamedCallback': streamedCallback,
          'completedCallback': completedCallback
        });
      } else {
        utils.getUserMedia({
          'video': true
        }, function(stream) {
          self.stream({
            'videoElement': videoElement,
            'cameraStream': stream,
            'streamedCallback': streamedCallback,
            'completedCallback': completedCallback
          });
        }, errorCallback);
      }
    },
    startVideoStreaming: function(callback, options) {
      options = options || {};

      var self = this,
        noGetUserMediaSupportTimeout,
        timeoutLength = options.timeout !== undefined ? options.timeout : 0,
        originalCallback = options.callback,
        webcamVideoElement = options.webcamVideoElement;

      // Some browsers apparently have support for video streaming because of the
      // presence of the getUserMedia function, but then do not answer our
      // calls for streaming.
      // So we'll set up this timeout and if nothing happens after a while, we'll
      // conclude that there's no actual getUserMedia support.
      if (timeoutLength > 0) {
        noGetUserMediaSupportTimeout = setTimeout(function() {
          self.onStreamingTimeout(originalCallback);
        }, 10000);
      }

      this.startStreaming({
        'error': function() {
          originalCallback({
            'error': true,
            'errorCode': 'getUserMedia',
            'errorMsg': 'There was an issue with the getUserMedia API - the user probably denied permission',
            'image': null,
            'cameraStream': {}
          });
        },
        'streamed': function() {
          // The streaming started somehow, so we can assume there is getUserMedia support
          clearTimeout(noGetUserMediaSupportTimeout);
        },
        'completed': function(obj) {
          var cameraStream = obj.cameraStream,
            videoElement = obj.videoElement,
            videoWidth = obj.videoWidth,
            videoHeight = obj.videoHeight;

          callback({
            'cameraStream': cameraStream,
            'videoElement': videoElement,
            'videoWidth': videoWidth,
            'videoHeight': videoHeight,
          });
        },
        'lastCameraStream': options.lastCameraStream,
        'webcamVideoElement': webcamVideoElement
      });
    },
    'stopVideoStreaming': function(obj) {
      obj = utils.isObject(obj) ? obj : {};
      var cameraStream = obj.cameraStream,
        videoElement = obj.videoElement,
        keepCameraOn = obj.keepCameraOn,
        webcamVideoElement = obj.webcamVideoElement;

      if (!keepCameraOn && cameraStream && utils.isFunction(cameraStream.stop)) {
        // Stops the camera stream
        cameraStream.stop();
      }

      if (utils.isElement(videoElement) && !webcamVideoElement) {
        // Pauses the video, revokes the object URL (freeing up memory), and remove the video element
        videoElement.pause();

        // Destroys the object url
        if (utils.isFunction(utils.URL.revokeObjectURL) && !utils.webWorkerError) {
          if (videoElement.src) {
            utils.URL.revokeObjectURL(videoElement.src);
          }
        }

        // Removes the video element from the DOM
        utils.removeElement(videoElement);
      }
    }
  };
});