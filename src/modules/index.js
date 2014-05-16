// gifshot.js
define(['utils', 'videoStream'], function(util, videoStream) {
	videoStream.startVideoStreaming(function(cameraStream, videoElement, width, height) {


		var images = [],
				i = 0,
				canvas,
				img;

		if(!util.isCanvasSupported()){
			utils.log('ERROR: Canvas not supported');
			return;
		}

		img = document.createElement("img");

		canvas = document.createElement("canvas");
		context = canvas.getContext('2d');

		videoElement.onclick = snapShot;
		document.body.appendChild(videoElement);
		document.body.appendChild(img);

		function snapShot(){

			if (cameraStream) {
				canvas.width = videoElement.videoWidth;
				canvas.height = videoElement.videoHeight;
				context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
				console.log(context.getImageData(0, 0, videoElement.videoWidth, videoElement.videoHeight));
				images.push(canvas.toDataURL('image/gif'));
			}

		}

		setInterval(function(){
			if(images.length){
					var next = ++i;
					i = images.length && next < images.length ? i : 0;
					img.src = images[i];
				}
		}, 100);

	});
});
