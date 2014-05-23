gifshot
=======

JavaScript library that can create animated gifs from video streams (e.g. webcam), existing videos (e.g. mp4), or existing images 

## Demo

gifshot is currently set up here: http://pokedsoaked.corp.ne1.yahoo.com:8001/

## How

gifshot.js uses: 

- The webRTC `getUserMedia()` API to get permission to use a user's webcam

- The `canvas` API to create a dynamic image from a video stream, video, or images

- Web workers to process the gif frames

- `window.btoa()` to create a base 64 URI

- Anthony Dekker's [NeuQuant](http://members.ozemail.com.au/~dekker/NEUQUANT.HTML) image quantization algorithm which was ported from C into Java by Kevin Weiner and then to [ActionScript 3](http://www.bytearray.org/?p=93) by Thibault Imbert, and to [JavaScript](http://antimatter15.com/wp/2010/07/javascript-to-animated-gif/) by antimatter15, and fixed, patched and revised by [sole](http://soledadpenades.com).

- Dean McNamee's [omggif](https://github.com/deanm/omggif) library - for actually encoding into GIF89


Influenced By:

- [animated_GIF.js](https://github.com/sole/Animated_GIF) - Uses web workers and encoding/decoding algorithms to produce a Base 64 data URI image

- [Meatspace Chat](https://chat.meatspac.es/)

## Quick Start
1.  Include `gifshot.js` on your HTML page

```html
<script src='gifshot.js'></script>
```

2.  Start using the JavaScript API to create your animated GIFs

```javascript
gifshot.createGIF(function(obj) {
	if(!obj.error) {
		var image = obj.image,
		animatedImage = document.createElement('img');
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
});
```

## Demo Set Up

1.  git clone this repo: `git clone https://git.corp.yahoo.com/sports/gifshot.git`
2.  Install [Node.js](http://nodejs.org/)
3.  Install the gulp module globally: `sudo npm install gulp -g`
4.  Install all local dependencies: `npm install`
5.  Run the gulp build: `gulp`
6.  Start up the included node.js preview server: `node server/server.js`
7.  Go to `localhost:8001` to try out gifshot.js.

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

	if(!error) {
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
});

// Takes a snap shot (not animated)
gifshot.takeSnapShot(function(obj) {
	var error = obj.error,
		errorCode = obj.errorCode,
		errorMsg = obj.errorMsg,
		image = obj.image,
		cameraStream = obj.cameraStream,
		animatedImage = document.createElement('img');

	if(!error) {
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
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
// If this option is used, then a gif will be created using these images
// e.g. ['http://i.imgur.com/2OO33vX.jpg', 'http://i.imgur.com/qOwVaSN.png', 'http://i.imgur.com/Vo5mFZJ.gif'],
// Note: Make sure these image resources are CORS enabled to prevent any cross-origin JavaScript errors
'images': [],
// If this option is used, then a gif will be created using the appropriate video
// HTML5 video that you would like to create your animated GIF from
// Browser support for certain video codecs is checked, and the appropriate video is selected
// e.g. 'video': ['example.mp4', 'example.ogv'],
'video': null,
// Whether or not you would like the user's camera to stay on after the gif is created
// If you keep the camera on, then you can reuse the returned cameraStream object to
// create another gif and/or snapshot without asking for the user's permission to
// access the camera again
'keepCameraOn': false,
// Pass an array of image DOM elements or src URL's
[],
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
