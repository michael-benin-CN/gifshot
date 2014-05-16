// gifshot.js
define(['utils', 'videoStream', 'screenShot'], function(utils, videoStream, screenShot) {
	var lastCameraStream,
		lastVideoElement,
		gifshot = {
		'defaultOptions': {
			'gifWidth': 640,
			'gifHeight': 480,
			'interval': 0.2,
			'numFrames': 10,
			'progressCallback': function(captureProgress) {},
			'completeCallback': function() {}
		},
		'createGIF': function (userOptions, callback) {
			userOptions = utils.isObject(userOptions) ? userOptions : {};
			callback = utils.isFunction(userOptions) ? userOptions : callback;

			var self = this,
				defaultOptions = gifshot.defaultOptions,
				options = utils.mergeOptions(defaultOptions, userOptions);

			videoStream.startVideoStreaming(function(obj) {
				var cameraStream = obj.cameraStream,
					videoElement = obj.videoElement,
					videoWidth = obj.videoWidth,
					videoHeight = obj.videoHeight,
					gifWidth = options.gifWidth,
					gifHeight = options.gifHeight,
					cropDimensions = screenShot.getCropDimensions({
						'videoWidth': videoWidth,
						'videoHeight': videoHeight,
						'gifHeight': gifHeight,
						'gifWidth': gifWidth
					}),
					completeCallback = callback;

				lastCameraStream = cameraStream;

				lastVideoElement = videoElement;

				options.crop = cropDimensions;
				options.videoElement = videoElement;
				options.videoWidth = videoWidth;
				options.videoHeight = videoHeight;

				if(!utils.isElement(videoElement)) {
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

		        screenShot.getWebcamGif(options, function() {
					self.stopVideoStreaming();
		        	completeCallback.apply(this, arguments);
		        });
			}, {
				'lastCameraStream': lastCameraStream
			});
		},
		'takeSnapShot': function(callback) {
			this.createGIF({
				'interval': .1,
				'numFrames': 2
			}, callback);
		},
		'stopVideoStreaming': function(obj) {
			obj = utils.isObject(obj) ? obj : {};
			var cameraStream = obj.cameraStream || lastCameraStream,
				videoElement = obj.videoElement || lastVideoElement;

			videoStream.stopVideoStreaming({
				'cameraStream': cameraStream,
				'videoElement': videoElement
			});
		},
		'startVideoStreaming': function(obj){
				obj = utils.isObject(obj) ? obj : {};
				var cameraStream = obj.cameraStream || lastCameraStream,

				videoElement = obj.videoElement || lastVideoElement;

				videoStream.startVideoStreaming({
					'cameraStream': cameraStream,
					'videoElement': videoElement
				});

		}

	};
	// Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, and plain browser loading
	if(typeof define === 'function' && define.amd) {
		define('gifshot', [], function() {
			return gifshot
		});
	} else if (typeof exports !== 'undefined') {
		module.exports = gifshot;
	} else {
		window.gifshot = gifshot;
	}
});
