// screenShot.js
// =============
define([
	'utils',
	'animatedGif'
], function(utils, AnimatedGIF) {
	return {
    	getWebcamGif: function (obj, callback) {
    		callback = utils.isFunction(callback) ? callback : function() {}

			var canvas = document.createElement('canvas'),
				context,
				videoElement = obj.videoElement,
				cameraStream = obj.cameraStream,
				gifWidth = obj.gifWidth,
				gifHeight = obj.gifHeight,
				videoWidth = obj.videoWidth,
				videoHeight = obj.videoHeight,
				sampleInterval = obj.sampleInterval,
				numWorkers = obj.numWorkers,
				crop = obj.crop,
				interval = obj.interval,
				progressCallback = obj.progressCallback,
				numFrames = obj.numFrames,
				pendingFrames = numFrames,
				ag = new AnimatedGIF({
					'sampleInterval': sampleInterval,
					'numWorkers': numWorkers,
					'width': gifWidth,
					'height': gifHeight,
					'delay': interval
				}),
				sourceX = Math.floor(crop.scaledWidth / 2),
				sourceWidth = videoWidth - crop.scaledWidth,
				sourceY = Math.floor(crop.scaledHeight / 2),
				sourceHeight = videoHeight - crop.scaledHeight,
				captureFrame = function() {
					var framesLeft = pendingFrames - 1;

					context.drawImage(videoElement,
					  sourceX, sourceY, sourceWidth, sourceHeight,
					  0, 0, gifWidth, gifHeight);

					ag.addFrameImageData(context.getImageData(0, 0, gifWidth, gifHeight));

					pendingFrames = framesLeft;

					// Call back with an r value indicating how far along we are in capture
					progressCallback((numFrames - pendingFrames) / numFrames);

					if (framesLeft > 0) {
						setTimeout(captureFrame, interval * 1000); // timeouts are in milliseconds
					}

					if (!pendingFrames) {
						ag.getBase64GIF(function(image) {
							callback({
								'error': false,
								'errorCode': '',
								'errorMsg': '',
								'image': image,
								'cameraStream': cameraStream,
								'videoElement': videoElement
							});
						});
					}
				};

			numFrames = numFrames !== undefined ? numFrames : 10;
			interval = interval !== undefined ? interval : 0.1; // In seconds

			canvas.width = gifWidth;
			canvas.height = gifHeight;
			context = canvas.getContext('2d');

			captureFrame();
		},
		'getCropDimensions': function (obj) {
		    var width = obj.videoWidth,
				height = obj.videoHeight,
				gifWidth = obj.gifWidth,
				gifHeight = obj.gifHeight,
				result = {
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
});