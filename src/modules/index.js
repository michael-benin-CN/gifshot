// gifshot.js
define(['utils', 'videoStream'], function(util, videoStream) {
	videoStream.startVideoStreaming(function(cameraStream, videoElement, width, height) {

		var canvas = document.createElement('canvas');

		if(!util.isCanvasSupported()){
			utils.log('ERROR: Canvas not supported');
			return;
		}

		videoElement.onclick = snapShot;
		document.body.appendChild(videoElement);

		function snapShot(){

			if (cameraStream) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
				images.push(canvas.toDataURL('image/gif'));
			}

		}

	});
});
