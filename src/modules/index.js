// gifshot.js
define(['utils', 'videoStream', 'gifCodec'], function(util, videoStream, gifCodec) {
	videoStream.startVideoStreaming(function(cameraStream, videoElement, width, height) {

		var codecWriter,
				images = [],
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

			var imageData;

			if (cameraStream) {
				canvas.width = videoElement.videoWidth;
				canvas.height = videoElement.videoHeight;

				imageData = context.getImageData(0, 0, videoElement.videoWidth, videoElement.videoHeight);
				images.push(imageData);

				codec = new gifCodec.GifWriter(imageData, videoElement.videoWidth, videoElement.videoHeight);
				console.log(codec);

			}

		}

		/*setInterval(function(){
			if(images.length){
					var next = ++i;
					i = images.length && next < images.length ? i : 0;
					img.src = images[i];
				}
		}, 100);*/

	});
});
