define([
  'utils'
], function(utils) {
  return {
    'defaultVideoDimensions': {
      'height': 200,
      'width': 200
    },
    'loadedData': false,
    'findVideoSize': function findVideoSize(obj) {
      var videoElement = obj.videoElement,
        cameraStream = obj.cameraStream,
        completedCallback = obj.completedCallback;
      if(!videoElement) {
        return;
      }

      if(videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        videoElement.removeEventListener('loadeddata', this.findVideoSize);
        completedCallback({
          'videoElement': videoElement,
          'cameraStream': cameraStream,
          'videoWidth': videoElement.videoWidth,
          'videoHeight': videoElement.videoHeight
        });
      } else {
        if(findVideoSize.attempts < 10) {
          findVideoSize.attempts += 1;
          setTimeout(findVideoSize, 200);
        } else {
          completedCallback({
            'videoElement': videoElement,
            'cameraStream': cameraStream,
            'videoWidth': this.defaultVideoDimensions.width,
            'videoHeight': this.defaultVideoDimensions.height,
          });
        }
      }
    },
    'onStreamingTimeout': function(callback) {
      if(utils.isFunction(callback)) {
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
        videoElement = obj.videoElement,
        cameraStream = obj.cameraStream,
        streamedCallback = obj.streamedCallback,
        completedCallback = obj.completedCallback;

      streamedCallback();

      if(videoElement.mozSrcObject) {
          videoElement.mozSrcObject = cameraStream;
      } else if(utils.URL) {
          videoElement.src = utils.URL.createObjectURL(cameraStream);
      }

      videoElement.play();
      setTimeout(function checkLoadedData() {
        checkLoadedData.count = checkLoadedData.count || 0;
        if(self.loadedData === true) {
          self.findVideoSize({
            'videoElement': videoElement,
            'cameraStream': cameraStream,
            'completedCallback': completedCallback
          });
          self.loadedData = false;
        } else {
          checkLoadedData.count += 1;
          if(checkLoadedData.count > 10) {
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
        videoElement = document.createElement('video'),
        lastCameraStream = obj.lastCameraStream,
        cameraStream;

      videoElement.autoplay = true;

      videoElement.addEventListener('loadeddata', function(event) {
        self.loadedData = true;
      });

      if(lastCameraStream) {
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
    startVideoStreaming: function(callback, options) {
      options = options || {};

      var self = this,
        noGetUserMediaSupportTimeout,
        timeoutLength = options.timeout !== undefined ? options.timeout : 0,
        originalCallback = options.callback;

      // Some browsers apparently have support for video streaming because of the
      // presence of the getUserMedia function, but then do not answer our
      // calls for streaming.
      // So we'll set up this timeout and if nothing happens after a while, we'll
      // conclude that there's no actual getUserMedia support.
      if(timeoutLength > 0) {
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
          var cameraStream = this.cameraStream = obj.cameraStream,
            videoElement = this.videoElement = obj.videoElement,
            videoWidth = obj.videoWidth,
            videoHeight = obj.videoHeight;

          callback({
            'cameraStream': cameraStream,
            'videoElement': videoElement,
            'videoWidth': videoWidth,
            'videoHeight': videoHeight,
          });
        },
        'lastCameraStream': options.lastCameraStream
      });
    },
    'stopVideoStreaming': function(obj) {
      obj = utils.isObject(obj) ? obj : {};
      var cameraStream = obj.cameraStream,
        videoElement = obj.videoElement,
        keepCameraOn = obj.keepCameraOn;

      if(!keepCameraOn && cameraStream && utils.isFunction(cameraStream.stop)) {
        // Stops the camera stream
        cameraStream.stop();
      }

      if(utils.isElement(videoElement)) {
        // Pauses the video, revokes the object URL (freeing up memory), and remove the video element
        videoElement.pause();

        // Destroys the object url
        if(utils.isFunction(utils.URL.revokeObjectURL)) {
          utils.URL.revokeObjectURL(videoElement.src);
        }

        // Removes the video element from the DOM
        utils.removeElement(videoElement);
      }
    }
  };
});