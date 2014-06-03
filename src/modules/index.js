// index.js
// ========
define([
	'utils',
	'videoStream',
	'screenShot',
	'animatedGif',
	'error'
], function(utils, videoStream, screenShot, AnimatedGif, error) {
	var gifshot = {
		'utils': utils,
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
			'webcamVideoElement': null,
			'text': '',
			'fontWeight': 'normal',
			'fontSize': '16px',
			'fontFamily': 'sans-serif',
			'fontColor': '#FFF',
			'textAlign': 'center',
			'textBaseline': 'bottom',
			'textXCoordinate': null,
			'textYCoordinate': null,
			'progressCallback': function(captureProgress) {},
			'completeCallback': function() {}
		},
		'_options': {},
		'createGIF': function (userOptions, callback) {
			callback = utils.isFunction(userOptions) ? userOptions : callback;
			userOptions = utils.isObject(userOptions) ? userOptions : {};

			if(!utils.isFunction(callback)) {
				return;
			}

			var defaultOptions = gifshot._defaultOptions,
				options = gifshot._options = utils.mergeOptions(defaultOptions, userOptions),
				lastCameraStream = userOptions.cameraStream,
				images = options.images,
				existingVideo = options.video,
				webcamVideoElement = options.webcamVideoElement,
				imagesLength = images ? images.length : 0,
				errorObj,
				skipObj = {},
				ag,
				x = -1,
				currentImage,
				tempImage,
				loadedImages = 0,
				videoType,
				videoSrc;

			// If the user has passed in at least one image path or image DOM elements
			if(imagesLength) {
				skipObj = {
					'getUserMedia': true,
					'window.URL': true
				};
				errorObj = error.validate(skipObj);

				if(errorObj.error) {
					return callback(errorObj);
				}

				// change workerPath to point to where Animated_GIF.worker.js is
				ag = new AnimatedGif(options);

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
			} else if(existingVideo) {
				skipObj = {
					'getUserMedia': true,
					'window.URL': true
				};
				errorObj = error.validate(skipObj);

				if(errorObj.error) {
					return callback(errorObj);
				}

				if(utils.isElement(existingVideo) && existingVideo.src) {
					videoSrc = existingVideo.src;
					videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);

					if(!utils.isSupported.videoCodecs[videoType]) {
						return callback(error.messages.videoCodecs);
					}
				} else if(utils.isArray(existingVideo)) {
					utils.each(existingVideo, function(iterator, videoSrc) {
						videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);
						if(utils.isSupported.videoCodecs[videoType]) {
							existingVideo = videoSrc;
							return false;
						}
					});
				}

				videoStream.startStreaming({
					'completed': function(obj) {
						gifshot._createAndGetGIF(obj, callback);
					},
					'existingVideo': existingVideo
				});
			} else {
 				if(!gifshot.isWebCamGIFSupported()) {
					return callback(error.validate());
				}
				videoStream.startVideoStreaming(function(obj) {
					gifshot._createAndGetGIF(obj, callback);
				}, {
					'lastCameraStream': lastCameraStream,
					'callback': callback,
					'webcamVideoElement': webcamVideoElement
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
				videoElement = obj.videoElement,
				webcamVideoElement = obj.webcamVideoElement

			videoStream.stopVideoStreaming({
				'cameraStream': cameraStream,
				'videoElement': videoElement,
				'keepCameraOn': options.keepCameraOn,
				'webcamVideoElement': webcamVideoElement
			});
		},
		'isWebCamGIFSupported': function() {
			return error.isValid();
		},
		'isExistingVideoGIFSupported': function(codecs) {
			var isSupported = false,
				hasValidCodec = false;

			if(utils.isArray(codecs) && codecs.length) {
				utils.each(codecs, function(indece, currentCodec) {
					if(utils.isSupported.videoCodecs[currentCodec]) {
						hasValidCodec = true;
					}
				});
				if(!hasValidCodec) {
					return false;
				}
			} else if(utils.isString(codecs) && codecs.length) {
				if(!utils.isSupported.videoCodecs[codecs]) {
					return false;
				}
			}

			return error.isValid({
				'getUserMedia': true
			});
		},
		'isExistingImagesGIFSupported': function() {
			return error.isValid({
				'getUserMedia': true
			});
		},
		'_createAndGetGIF': function(obj, callback) {
			var options = gifshot._options,
				numFrames = options.numFrames,
				interval = options.interval,
				wait = options.video ? 0 : interval * 10000,
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

			videoElement.width = gifWidth + cropDimensions.width;
			videoElement.height = gifHeight + cropDimensions.height;

			if(!options.webcamVideoElement) {
				utils.setCSSAttr(videoElement, {
					'position': 'fixed',
					'opacity': '0'
				});
				document.body.appendChild(videoElement);
			}


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
