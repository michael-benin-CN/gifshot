// existingImages.js
// =================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/createAndGetGIF',
  'core/videoStream',
  'core/error'
], function(utils, createAndGetGIF, videoStream, error) {
  return function(obj) {
    var existingVideo = obj.existingVideo,
      callback = obj.callback,
      options = obj.options,
      skipObj = {
        'getUserMedia': true,
        'window.URL': true
      },
      errorObj = error.validate(skipObj),
      loadedImages = 0,
      videoType,
      videoSrc,
      tempImage,
      ag;

    if (errorObj.error) {
      return callback(errorObj);
    }

    if (utils.isElement(existingVideo) && existingVideo.src) {
      videoSrc = existingVideo.src;
      videoType = utils.getExtension(videoSrc);

      if (!utils.isSupported.videoCodecs[videoType]) {
        return callback(error.messages.videoCodecs);
      }
    } else if (utils.isArray(existingVideo)) {
      utils.each(existingVideo, function(iterator, videoSrc) {
        videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);
        if (utils.isSupported.videoCodecs[videoType]) {
          existingVideo = videoSrc;
          return false;
        }
      });
    }

    videoStream.startStreaming({
      'completed': function(obj) {
        obj.options = options || {};
        createAndGetGIF(obj, callback);
      },
      'existingVideo': existingVideo
    });
  };
});