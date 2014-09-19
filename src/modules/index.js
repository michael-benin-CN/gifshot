// index.js
// ========

/* Copyright  2014 Yahoo Inc. 
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

require([
  'API/API'
], function(API) {
  // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, and plain browser loading
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return API;
    });
  } else if (typeof exports !== 'undefined') {
    module.exports = API;
  } else {
    window.gifshot = API;
  }
});