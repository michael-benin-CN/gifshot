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

- Anthony Dekker's [NeuQuant](http://members.ozemail.com.au/~dekker/NEUQUANT.HTML) image quantization algorithm to reduce the number of colors required to represent the image (thus decreasing the file size).   This script was ported from C into Java by Kevin Weiner and then to [ActionScript 3](http://www.bytearray.org/?p=93) by Thibault Imbert, and to [JavaScript](http://antimatter15.com/wp/2010/07/javascript-to-animated-gif/) by antimatter15, and fixed, patched and revised by [sole](http://soledadpenades.com).

- Dean McNamee's [omggif](https://github.com/deanm/omggif) library - for actually encoding into GIF89


Influenced By:

- [animated_GIF.js](https://github.com/sole/Animated_GIF) - Uses web workers and encoding/decoding algorithms to produce a Base 64 data URI image

- [Meatspace Chat](https://chat.meatspac.es/)

## Quick Start
*  Include `gifshot.js` on your HTML page

```html
<script src='gifshot.js'></script>
```

*  Start using the JavaScript API to create your animated GIFs

```javascript
// By default, a user's webcam is used to create the animated GIF
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
// Creates an animated gif from either a webcam stream, an existing video (e.g. mp4), or existing images
gifshot.createGIF(options, callback);

// Takes a snap shot (not animated) image from a webcam stream or existing video
gifshot.takeSnapShot(options, callback);

// Turns off the user's webcam (by default, the user's webcam is turned off)
gifshot.stopVideoStreaming();
```

## Examples

**Web Cam**

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

**HTML5 Video**

```javascript
gifshot.createGIF({
	'video': ['example.mp4', 'example.ogv']
},function(obj) {
	if(!obj.error) {
		var image = obj.image,
		animatedImage = document.createElement('img');
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
});
```

**Images**

```javascript
gifshot.createGIF({
	'images': ['http://i.imgur.com/2OO33vX.jpg', 'http://i.imgur.com/qOwVaSN.png', 'http://i.imgur.com/Vo5mFZJ.gif']
},function(obj) {
	if(!obj.error) {
		var image = obj.image,
		animatedImage = document.createElement('img');
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
});
```

**Snap Shot**

```javascript
gifshot.takeSnapShot(function(obj) {
	if(!obj.error) {
		var image = obj.image,
		animatedImage = document.createElement('img');
		animatedImage.src = image;
		document.body.appendChild(animatedImage);
	}
});
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
// Note: You may also pass a NodeList of existing image elements on the page
'images': [],
// If this option is used, then a gif will be created using the appropriate video
// HTML5 video that you would like to create your animated GIF from
// Note: Browser support for certain video codecs is checked, and the appropriate video is selected
// Note: You may also pass a NodeList of existing video elements on the page
// e.g. 'video': ['example.mp4', 'example.ogv'],
'video': null,
// Whether or not you would like the user's camera to stay on after the gif is created
// If you keep the camera on, then you can reuse the returned cameraStream object to
// create another gif and/or snapshot without asking for the user's permission to
// access the camera again
'keepCameraOn': false,
// The amount of time (in seconds) to wait between each frame capture of a video
'interval': 0.1,
// The number of frames to use to create the animated GIF
// Note: Each frame is captured every 100 milleseconds of a video
'numFrames': 10,
// Callback function that provides the current progress of the current image
'progressCallback': function(captureProgress) {},
// Callback function that is called when the current image is completed
'completeCallback': function() {},
// how many pixels to skip when creating the palette. Default is 10. Less is better, but slower.
// Note: By adjusting the sample interval, you can either produce extremely high-quality images slowly, or produce good images in
//       reasonable times. With a sampleInterval of 1, the entire image is used in the learning phase, while with an interval of 10,
//       a pseudo-random subset of 1/10 of the pixels are used in the learning phase. A sampling factor of 10 gives a substantial
//       speed-up, with a small quality penalty.
'sampleInterval': 10,
// how many web workers to use to process the animated GIF frames. Default is 2.
'numWorkers': 2
```

## Contributors

- Chase West
- Greg Franko
