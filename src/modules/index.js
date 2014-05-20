// gifshot.js
define([
	'utils',
	'videoStream',
	'screenShot'
], function(utils, videoStream, screenShot) {
	var gifshot = {
		'defaultOptions': {
			'gifWidth': 200,
			'gifHeight': 200,
			'interval': 0.1,
			'numFrames': 10,
			'keepCameraOn': false,
			'progressCallback': function(captureProgress) {},
			'completeCallback': function() {}
		},
		'options': {},
		'createGIF': function (userOptions, callback) {
			userOptions = utils.isObject(userOptions) ? userOptions : {};
			callback = utils.isFunction(userOptions) ? userOptions : callback;

			if(!utils.isFunction(callback)) {
				return;
			} else if(!gifshot.isSupported()) {
				if(!utils.isFunction(utils.getUserMedia)) {
					return callback({
						'error': true,
						'errorCode': 'getUserMedia',
						'errorMsg': 'The getUserMedia API is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isSupported.canvas()) {
					return callback({
						'error': true,
						'errorCode': 'canvas',
						'errorMsg': 'Canvas elements are not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isSupported.webworkers()) {
					return callback({
						'error': true,
						'errorCode': 'webworkers',
						'errorMsg': 'The Web Workers API is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.URL) {
					return callback({
						'error': true,
						'errorCode': 'window.URL',
						'errorMsg': 'The window.URL API is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isSupported.blob()) {
					return callback({
						'error': true,
						'errorCode': 'window.Blob',
						'errorMsg': 'The window.Blob File API is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isFunction(window.btoa)) {
					return callback({
						'error': true,
						'errorCode': 'window.btoa',
						'errorMsg': 'The window.btoa base-64 encoding method is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isFunction(Uint8Array)) {
					return callback({
						'error': true,
						'errorCode': 'window.Uint8Array',
						'errorMsg': 'The window.Uint8Array function constructor is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else if(!utils.isFunction(Uint32Array)) {
					return callback({
						'error': true,
						'errorCode': 'window.Uint32Array',
						'errorMsg': 'The window.Uint32Array function constructor is not supported in your browser',
						'image': null,
						'cameraStream': {}
					});
				} else {
					return callback({
						'error': true,
						'errorCode': 'unknown',
						'errorMsg': 'Unknown error',
						'image': null,
						'cameraStream': {}
					});
				}
			}

			var self = this,
				defaultOptions = gifshot.defaultOptions,
				options = this.options = utils.mergeOptions(defaultOptions, userOptions),
				lastCameraStream = userOptions.cameraStream,
				numFrames = options.numFrames,
				interval = options.interval,
				wait = interval * 10000;

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

				options.crop = cropDimensions;
				options.videoElement = videoElement;
				options.videoWidth = videoWidth;
				options.videoHeight = videoHeight;
				options.cameraStream = cameraStream;

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

		        setTimeout(function() {
					screenShot.getWebcamGif(options, function(obj) {
						gifshot.stopVideoStreaming(obj);
						document.body.removeChild(videoElement);
						completeCallback(obj);
					});
		        }, wait);
			}, {
				'lastCameraStream': lastCameraStream,
				'callback': callback
			});
		},
		'takeSnapShot': function(obj, callback) {
			var defaultOptions = utils.mergeOptions(gifshot.defaultOptions, obj),
				options = utils.mergeOptions(defaultOptions, {
					'interval': .1,
					'numFrames': 1
			});
			this.createGIF(options, callback);
		},
		'stopVideoStreaming': function(obj) {
			obj = utils.isObject(obj) ? obj : {};
			var self = this,
				options = utils.isObject(self.options) ? self.options : {},
				cameraStream = obj.cameraStream,
				videoElement = obj.videoElement;

			videoStream.stopVideoStreaming({
				'cameraStream': cameraStream,
				'videoElement': videoElement,
				'keepCameraOn': options.keepCameraOn
			});
		},
		'isSupported': function() {
			return (utils.isFunction(utils.getUserMedia) &&
				utils.isSupported.canvas() &&
				utils.isSupported.webworkers() &&
				utils.URL &&
				utils.isSupported.blob() &&
				utils.isFunction(window.btoa) &&
				utils.isFunction(Uint8Array) &&
				utils.isFunction(Uint32Array))
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
