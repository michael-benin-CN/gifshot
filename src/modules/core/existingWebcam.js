// existingWebcam.js
// =================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/error',
  'core/support',
  'core/createAndGetGIF',
  'core/screenShot',
  'core/videoStream'
], function(utils, error, support, createAndGetGIF, screenShot, videoStream) {
  return function(obj) {
    var lastCameraStream = obj.lastCameraStream,
      callback = obj.callback,
      webcamVideoElement = obj.webcamVideoElement,
      options = obj.options;

    if (!support.isWebCamGIFSupported()) {
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