// gifshot.js
define([
	'utils',
	'videoStream',
	'screenShot',
	'animatedGif',
	'error'
], function(utils, videoStream, screenShot, AnimatedGif, error) {
	var gifshot = {
		'_defaultOptions': {
			'sampleInterval': 10,
			'numWorkers': 2,
			'gifWidth': 200,
			'gifHeight': 200,
			'interval': 0.1,
			'numFrames': 10,
			'keepCameraOn': false,
			'images': [],
			'video': null,
			'progressCallback': function(captureProgress) {},
			'completeCallback': function() {}
		},
		'_options': {},
		'AnimatedGif': AnimatedGif,
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
				lastCameraStream = userOptions.cameraStream,
				images = options.images,
				imagesLength = images ? images.length : 0;

			// If the user has passed in at least one image path or image DOM elements
			if(imagesLength) {
				// change workerPath to point to where Animated_GIF.worker.js is
				var ag = new AnimatedGif(options),
					x = -1,
					currentImage,
					tempImage,
					loadedImages = 0;

				while(++x < imagesLength) {
					currentImage = images[x];
					if(utils.isElement(currentImage)) {
						currentImage.crossOrigin = 'Anonymous';
						ag.addFrame(currentImage);
						loadedImages += 1;
						if(loadedImages === imagesLength) {
							gifshot._getBase64GIF(ag, callback);
						}
					} else if(utils.isString(currentImage)) {
						tempImage = document.createElement('img');
						tempImage.crossOrigin = 'Anonymous';
						tempImage.src = currentImage;
						utils.setCSSAttr(tempImage, {
							'position': 'fixed',
							'opacity': '0'
						});
						(function(tempImage, ag) {
							tempImage.onload = function() {
								ag.addFrame(tempImage);
								utils.removeElement(tempImage);
								loadedImages += 1;
								if(loadedImages === imagesLength) {
									gifshot._getBase64GIF(ag, callback);
								}
							};
						}(tempImage, ag));
						document.body.appendChild(tempImage);
					}
				}
			} else {
				videoStream.startVideoStreaming(function(obj) {
					gifshot._createAndGetGIF(obj, callback);
				}, {
					'lastCameraStream': lastCameraStream,
					'callback': callback
				});
			}
		},
		_getBase64GIF: function(animatedGifInstance, callback) {
			// This is asynchronous, rendered with WebWorkers
			animatedGifInstance.getBase64GIF(function(image) {
				callback({
					'error': false,
					'errorCode': '',
					'errorMsg': '',
					'image': image
				});
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
	        	'position': 'fixed',
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