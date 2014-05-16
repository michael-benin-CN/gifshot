// gifshot.js
define(['videoStream'], function(videoStream) {
	videoStream.startVideoStreaming(function(cameraStream, videoElement, width, height) {

		videoElement.onclick = function(){
			console.log(this);
		};

		document.body.appendChild(videoElement);


	});
});
