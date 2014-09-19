// existingWebcam.js
// =================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/error',
  'core/createAndGetGIF',
  'core/screenShot',
  'core/videoStream',
  'API/isWebCamGIFSupported',
], function(utils, error, createAndGetGIF, screenShot, videoStream, isWebCamGIFSupported) {
  return function(obj) {
    var lastCameraStream = obj.lastCameraStream,
      callback = obj.callback,
      webcamVideoElement = obj.webcamVideoElement,
      options = obj.options;

    if (!isWebCamGIFSupported()) {
      return callback(error.validate());
    }
    if (options.savedRenderingContexts.length) {
      screenShot.getWebcamGIF(options, function(obj) {
        callback(obj);
      });
      return;
    }
    videoStream.startVideoStreaming(function(obj) {
      obj.options = options || {};
      createAndGetGIF(obj, callback);
    }, {
      'lastCameraStream': lastCameraStream,
      'callback': callback,
      'webcamVideoElement': webcamVideoElement
    });
  };
});