// API.js
// ======

/* Copyright  2014 Yahoo Inc. 
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/support',
  'API/createGIF',
  'API/takeSnapShot',
  'API/stopVideoStreaming'
], function(
  utils,
  support,
  createGIF,
  takeSnapShot,
  stopVideoStreaming
) {
  var gifshot = {
    'utils': utils,
    'createGIF': createGIF,
    'takeSnapShot': takeSnapShot,
    'stopVideoStreaming': stopVideoStreaming,
    'isSupported': support.isSupported,
    'isWebCamGIFSupported': support.isWebCamGIFSupported,
    'isExistingVideoGIFSupported': support.isExistingVideoGIFSupported,
    'isExistingImagesGIFSupported': support.isExistingImagesGIFSupported
  };

  return gifshot;
});