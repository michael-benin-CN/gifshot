// support.js
// ==========

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/error',
  'API/isExistingVideoGIFSupported'
], function(utils, error, isExistingVideoGIFSupported) {
  return {
    'isSupported': function() {
      return error.isValid();
    },
    'isWebCamGIFSupported': function() {
      return error.isValid();
    },
    'isExistingVideoGIFSupported': isExistingVideoGIFSupported,
    'isExistingImagesGIFSupported': function() {
      return error.isValid({
        'getUserMedia': true
      });
    }
  }
});