// getBase64GIF.js
// ===============

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([], function() {
  return function getBase64GIF(animatedGifInstance, callback) {
    // This is asynchronous, rendered with WebWorkers
    animatedGifInstance.getBase64GIF(function(image) {
      callback({
        'error': false,
        'errorCode': '',
        'errorMsg': '',
        'image': image
      });
    });
  };
});