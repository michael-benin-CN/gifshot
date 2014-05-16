// gifshot.js
define(['videoStream'], function(videoStream) {
	videoStream.startVideoStreaming(function(cameraStream, videoElement, width, height) {
		console.log('cameraStream', cameraStream);
		console.log('videoElement', videoElement);
		console.log('width', width);
		console.log('height', height);
	});
});
