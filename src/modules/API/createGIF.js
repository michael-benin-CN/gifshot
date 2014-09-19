// createGIF.js
// ============

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/defaultOptions',
  'core/existingImages',
  'core/existingVideo',
  'core/existingWebcam'
], function(utils, defaultOptions, existingImages, existingVideo, existingWebcam) {
  return function(userOptions, callback) {
    callback = utils.isFunction(userOptions) ? userOptions : callback;
    userOptions = utils.isObject(userOptions) ? userOptions : {};

    if (!utils.isFunction(callback)) {
      return;
    }

    var options = utils.mergeOptions(defaultOptions, userOptions) || {},
      lastCameraStream = userOptions.cameraStream,
      images = options.images,
      imagesLength = images ? images.length : 0,
      video = options.video,
      webcamVideoElement = options.webcamVideoElement;

    // If the user would like to create a GIF from an existing image(s)
    if (imagesLength) {
      existingImages({
        'images': images,
        'imagesLength': imagesLength,
        'callback': callback,
        'options': options
      });
    }
    // If the user would like to create a GIF from an existing HTML5 video
    else if (video) {
      existingVideo({
        'existingVideo': video,
        'callback': callback,
        'options': options
      });
    }
    // If the user would like to create a GIF from a webcam stream
    else {
      existingWebcam({
        'lastCameraStream': lastCameraStream,
        'callback': callback,
        'webcamVideoElement': webcamVideoElement,
        'options': options
      });
    }
  };
});