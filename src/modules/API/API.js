// API.js
// ======

/* Copyright  2014 Yahoo Inc. 
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/error',
  'core/defaultOptions',
  'API/isSupported',
  'API/isWebCamGIFSupported',
  'API/isExistingImagesGIFSupported',
  'API/isExistingVideoGIFSupported',
  'API/createGIF',
  'API/takeSnapShot',
  'API/stopVideoStreaming'
], function(
  utils,
  error,
  defaultOptions,
  isSupported,
  isWebCamGIFSupported,
  isExistingImagesGIFSupported,
  isExistingVideoGIFSupported,
  createGIF,
  takeSnapShot,
  stopVideoStreaming
) {
  var gifshot = {
    'utils': utils,
    'error': error,
    'defaultOptions': defaultOptions,
    'createGIF': createGIF,
    'takeSnapShot': takeSnapShot,
    'stopVideoStreaming': stopVideoStreaming,
    'isSupported': isSupported,
    'isWebCamGIFSupported': isWebCamGIFSupported,
    'isExistingVideoGIFSupported': isExistingVideoGIFSupported,
    'isExistingImagesGIFSupported': isExistingImagesGIFSupported,
    'VERSION': '0.0.1'
  };

  return gifshot;
});