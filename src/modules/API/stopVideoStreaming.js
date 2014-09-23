// stopVideoStreaming.js
// =====================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/videoStream'
], function(utils, videoStream) {
  return function(obj) {
    obj = utils.isObject(obj) ? obj : {};

    var options = utils.isObject(obj.options) ? obj.options : {},
      cameraStream = obj.cameraStream,
      videoElement = obj.videoElement,
      webcamVideoElement = obj.webcamVideoElement,
      keepCameraOn = obj.keepCameraOn

    videoStream.stopVideoStreaming({
      'cameraStream': cameraStream,
      'videoElement': videoElement,
      'keepCameraOn': keepCameraOn,
      'webcamVideoElement': webcamVideoElement
    });
  };
});