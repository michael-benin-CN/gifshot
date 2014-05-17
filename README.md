gifshot
=======

JavaScript library that creates an animated gif(s) from a video stream (e.g. webcam)

Heavily incluenced from [Meatspace Chat](https://chat.meatspac.es/)


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
}, function(image) {
	var animatedImage = document.createElement('img');
	animatedImage.src = image;
	document.body.appendChild(animatedImage);
});

// Takes a snap shot (not animated)
gifshot.takeSnapShot(function(image) {
	var animatedImage = document.createElement('img');
	animatedImage.src = image;
	document.body.appendChild(animatedImage);
});

// Turns off the user's webcam
gifshot.stopVideoStreaming();
```


## Options

```javascript
// Desired width of the image
'gifWidth': 640,
// Desired height of the image
'gifHeight': 480,
// The interval (in milleseconds) that images are created
'interval': 0.2,
// The number of frames to use
'numFrames': 10,
// Callback function that provides the current progress of the current image
'progressCallback': function(captureProgress) {},
// Callback function that is called when the current image is completed
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
```

## Contributors

- Chase West
- Greg Franko