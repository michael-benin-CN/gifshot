![](http://i.imgur.com/I17GUX9.gif) 
=======

JavaScript library that can create Animated GIFs from video streams (e.g. webcam), existing videos (e.g. mp4), or existing images


## How

gifshot.js uses the following technologies:

- The webRTC `getUserMedia()` API to get permission to use a user's webcam and manipulate the `CameraStream` Media object

- The HTML5 `Filesystem` APIs to handle the temporary blob URL creation

- The HTML5 `video` element to stream the blob URL

- The `canvas` API to create a dynamic image from an HTML5 video, or images

- `Web workers` to process the gif frames

- `Typed Arrays` to handle binary image data

- `Base 64 encoding` (both `window.btoa` and a polyfilled method)


## Browser Support

 - **Animated GIF from Webcam** :

 * Firefox 17+, Chrome 21+, Opera 18+, Blackberry Browser 10+, Opera Mobile 12+, Chrome For Android 35+, Firefox for Android 29+

 - **Animated GIF from Existing Video** :

 * All modern browsers (IE10+)

 - **Animated GIF from Existing Images** :

 * All modern browsers (IE10+)


## Quick Start
*  Include `gifshot.js` on your HTML page (`gifshot.js` can be found in the `build` directory)

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

// If the current browser supports creating animated GIFs from a webcam video stream
gifshot.isWebCamGIFSupported();

// If the current browser supports creating animated GIFs from an existing HTML video (e.g. mp4, ogg, ogv, webm)
// e.g. gifshot.isExistingVideoGIFSupported(['mp4', 'ogg']);
gifshot.isExistingVideoGIFSupported(codecs);

// If the current browser supports creating animated GIFs from existing images (e.g. jpeg, png, gif)
gifshot.isExistingImagesGIFSupported();
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
// You can pass an existing video element to use for the webcam GIF creation process,
// and this video element will not be hidden (useful when used with the keepCameraOn option)
// Pro tip: Set the height and width of the video element to the same values as your future GIF
// Another Pro Tip: If you use this option, the video will not be paused, the object url not revoked, and
// the video will not be removed from the DOM.  You will need to handle this yourself.
'webcamVideoElement': null,
// Whether or not you would like the user's camera to stay on after the gif is created
// Note: The cameraStream Media object is passed back to you in the createGIF() callback function
'keepCameraOn': false,
// Expects a cameraStream Media object
// Note: Passing an existing camera stream will allow you to create another GIF and/or snapshot without
//	asking for the user's permission to access the camera again if you are not using SSL
'cameraStream': null,
// The amount of time (in seconds) to wait between each frame capture of a video
'interval': 0.1,
// The number of frames to use to create the animated GIF
// Note: Each frame is captured every 100 milleseconds of a video
'numFrames': 10,
// The text that covers the animated gif
'text': '',
// The font weight of the text that covers the animated gif
'fontWeight': 'normal',
// The font size of the text that covers the animated gif
'fontSize': '16px',
// The font family of the text that covers the animated gif
'fontFamily': 'sans-serif',
// The font color of the text that covers the animated gif
'fontColor': '#FFF',
// The horizontal text alignment of the text that covers the animated gif
'textAlign': 'center',
// The vertical text alignment of the text that covers the animated gif
'textBaseline': 'bottom',
// The X (horizontal) Coordinate of the text that covers the animated gif (only use this if the default textAlign and textBaseline options don't work for you)
'textXCoordinate': null,
// The Y (vertical) Coordinate of the text that covers the animated gif (only use this if the default textAlign and textBaseline options don't work for you)
'textYCoordinate': null,
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
'numWorkers': 2,
// Whether or not you would like to save all of the canvas image binary data from your created GIF
// Note: This is particularly useful for when you want to re-use a GIF to add text to later
'saveRenderingContexts': false,
// Expects an array of canvas image data
// Note: If you set the saveRenderingContexts option to true, then you get the savedRenderingContexts
//	in the createGIF callback function
'savedRenderingContexts': []
```

## Contributing

Please send all PR's to the `dev` branch.

If your PR is a code change:

1.  Install all node.js dev dependencies: `npm install`
2.  Update the appropriate module inside of the `src/modules` directory.
3.  Install gulp.js globally: `sudo npm install gulp -g`
4.  Lint and Minify with Gulp: `gulp`
5.  Verify that the minified output file has been updated in `build/gifshot.js` and `build/gifshot.min.js`
6.  Send the PR!

**Note:** There is a gulp `watch` task set up that will automatically build, lint, and minify gifshot whenever a module inside of the `src/modules` directory is changed.  We recommend using it.


## Credits

gifshot.js would not have been possible without the help/inspiration of the following libraries/awesome people:

- Anthony Dekker's [NeuQuant](http://members.ozemail.com.au/~dekker/NEUQUANT.HTML)
 * An image quantization algorithm to reduce the number of colors required to represent the image (thus decreasing the file size). This script was ported from C into Java by Kevin Weiner and then to [ActionScript 3](http://www.bytearray.org/?p=93) by Thibault Imbert, and to [JavaScript](http://antimatter15.com/wp/2010/07/javascript-to-animated-gif/) by antimatter15, and fixed, patched and revised by [sole](http://soledadpenades.com).

- Dean McNamee's [omggif](https://github.com/deanm/omggif)
 * Encodes a gif into the GIF89 spec

- Soledad Penadés's [gumhelper.js](https://github.com/sole/gumhelper)
 * A module wrapping WebRTC's getUserMedia

- Soledad Penadés's [animated_GIF.js](https://github.com/sole/Animated_GIF)
 * Uses web workers and encoding/decoding algorithms to produce a Base 64 data URI image

- Jen Fong-Adwent's (aka Edna Piranha) [Meatspace Chat](https://chat.meatspac.es/)

- Greg Franko's [AMDclean](https://github.com/gfranko/amdclean)
 * A build tool that converts AMD and/or CommonJS code to standard JavaScript


## Contributors

- Chase West
- Greg Franko