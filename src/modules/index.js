// gifshot.js
define([
	'utils',
	'videoStream',
	'screenShot',
	'animatedGif',
	'error'
], function(utils, videoStream, screenShot, animated_GIF, error) {
	var gifshot = {
		'_defaultOptions': {
			'sampleInterval': 10,
			'numWorkers': 2,
			'gifWidth': 200,
			'gifHeight': 200,
			'interval': 0.1,
			'numFrames': 10,
			'keepCameraOn': false,
			'progressCallback': function(captureProgress) {},
			'completeCallback': function() {}
		},
		'_options': {},
		'animated_GIF': animated_GIF,
		'createGIF': function (userOptions, callback) {
			callback = utils.isFunction(userOptions) ? userOptions : callback;
			userOptions = utils.isObject(userOptions) ? userOptions : {};

			if(!utils.isFunction(callback)) {
				return;
			} else if(!gifshot.isSupported()) {
				return callback(error.validate());
			}

			var defaultOptions = gifshot._defaultOptions,
				options = gifshot._options = utils.mergeOptions(defaultOptions, userOptions),
				lastCameraStream = userOptions.cameraStream;

			videoStream.startVideoStreaming(function(obj) {
				gifshot._createAndGetGIF(obj, callback);
			}, {
				'lastCameraStream': lastCameraStream,
				'callback': callback
			});
		},
		'takeSnapShot': function(obj, callback) {
			var defaultOptions = utils.mergeOptions(gifshot._defaultOptions, obj),
				options = utils.mergeOptions(defaultOptions, {
					'interval': .1,
					'numFrames': 1
			});
			this.createGIF(options, callback);
		},
		'stopVideoStreaming': function(obj) {
			obj = utils.isObject(obj) ? obj : {};
			var options = utils.isObject(gifshot._options) ? gifshot._options : {},
				cameraStream = obj.cameraStream,
				videoElement = obj.videoElement;

			videoStream.stopVideoStreaming({
				'cameraStream': cameraStream,
				'videoElement': videoElement,
				'keepCameraOn': options.keepCameraOn
			});
		},
		'isSupported': function() {
			return error.isValid();
		},
		'_createAndGetGIF': function(obj, callback) {
			var options = gifshot._options,
				numFrames = options.numFrames,
				interval = options.interval,
				wait = interval * 10000,
				cameraStream = obj.cameraStream,
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
					completeCallback(obj);
				});
	        }, wait);
		} 
	},
		publicApi = function (api) {
			var method,
			  currentMethod,
			  publicApi = {};
			for(method in api) {
			  currentMethod = api[method];
			  if(method.charAt(0) !== '_') {
			    publicApi[method] = api[method];
			  }
			}
			return publicApi;
		};
	// Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, and plain browser loading
	if(typeof define === 'function' && define.amd) {
		define('gifshot', [], function() {
			return publicApi(gifshot);
		});
	} else if (typeof exports !== 'undefined') {
		module.exports = publicApi(gifshot);
	} else {
		window.gifshot = publicApi(gifshot);
	}
});