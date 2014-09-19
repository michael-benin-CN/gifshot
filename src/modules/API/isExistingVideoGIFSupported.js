// isExistingVideoGIFSupported.js
// ==============================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/error'
], function(utils, error) {
  return function(codecs) {
    var isSupported = false,
      hasValidCodec = false;

    if (utils.isArray(codecs) && codecs.length) {
      utils.each(codecs, function(indece, currentCodec) {
        if (utils.isSupported.videoCodecs[currentCodec]) {
          hasValidCodec = true;
        }
      });
      if (!hasValidCodec) {
        return false;
      }
    } else if (utils.isString(codecs) && codecs.length) {
      if (!utils.isSupported.videoCodecs[codecs]) {
        return false;
      }
    }

    return error.isValid({
      'getUserMedia': true
    });
  };
});