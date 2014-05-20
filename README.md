gifshot
=======

JavaScript library that creates an animated gif(s) from a video stream (e.g. webcam)

Heavily incluenced from [Meatspace Chat](https://chat.meatspac.es/)

## Demo

gifshot is currently set up here: http://pokedsoaked.corp.ne1.yahoo.com:8001/

## How

gifshot.js uses: 

- The webRTC `getUserMedia()` API to get permission to use a user's webcam
- The `canvas` API to create a dynamic image from a video stream
- [animated_GIF.js](https://github.com/sole/Animated_GIF) - Uses web workers and encoding/decoding algorithms to produce a Base 64 data URI image

## Getting Started

1.  git clone this repo: `git clone https://git.corp.yahoo.com/sports/gifshot.git`
2.  Install [Node.js](http://nodejs.org/)
3.  Install the gulp module globally: `sudo npm install gulp -g`
4.  Install all local dependencies: `npm install`
5.  Start up the included node.js preview server: `node server/server.js`
6.  Go to `localhost:8001` to try out gifshot.js.

## API Methods

```javascript
// Creates an animated gif
gifshot.createGIF({
	'gifHeight': 200,
	'gifWidth': 200,
}, function(obj) {
	var error = obj.error,
		errorCode = obj.errorCode,
		errorMsg = obj.errorMsg,
		image = obj.image,
		cameraStream = obj.cameraStream,
		animatedImage = document.createElement('img');

	animatedImage.src = image;
	document.body.appendChild(animatedImage);
});

// Takes a snap shot (not animated)
gifshot.takeSnapShot(function(obj) {
	var error = obj.error,
		errorCode = obj.errorCode,
		errorMsg = obj.errorMsg,
		image = obj.image,
		cameraStream = obj.cameraStream,
		animatedImage = document.createElement('img');

	animatedImage.src = image;
	document.body.appendChild(animatedImage);
});

// Turns off the user's webcam
gifshot.stopVideoStreaming();

// Helper method to determine if the user's browser supports the technology to create animated gifs in JavaScript
gifshot.isSupported();
```


## Options

```javascript
// Desired width of the image
'gifWidth': 200,
// Desired height of the image
'gifHeight': 200,
// Whether or not you would like the user's camera to stay on after the gif is created
'keepCameraOn': false,
// The interval (in milleseconds) that images are created
'interval': 0.1,
// The number of frames to use
'numFrames': 10,
// Callback function that provides the current progress of the current image
'progressCallback': function(captureProgress) {},
// Callback function that is called when the current image is completed
'completeCallback': function() {},
// how many pixels to skip when creating the palette. Default is 10. Less is better, but slower.
'sampleInterval': 10,
// how many web workers to use. Default is 2.
'numWorkers': 2
```

## Contributors

- Chase West
- Greg Franko
