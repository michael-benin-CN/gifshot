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
			'completeCallback': function() {},
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

		        screenShot.getWebcamGif(options, completeCallback);
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

			lastCameraStream = null;
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
