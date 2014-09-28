// defaultOptions.js
// =================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define({
  'sampleInterval': 10,
  'numWorkers': 2,
  'gifWidth': 200,
  'gifHeight': 200,
  'interval': 0.1,
  'numFrames': 10,
  'keepCameraOn': false,
  'images': [],
  'video': null,
  'webcamVideoElement': null,
  'cameraStream': null,
  'text': '',
  'fontWeight': 'normal',
  'fontSize': '16px',
  'minFontSize': '10px',
  'resizeFont': false,
  'fontFamily': 'sans-serif',
  'fontColor': '#ffffff',
  'textAlign': 'center',
  'textBaseline': 'bottom',
  'textXCoordinate': null,
  'textYCoordinate': null,
  'progressCallback': function(captureProgress) {},
  'completeCallback': function() {},
  'saveRenderingContexts': false,
  'savedRenderingContexts': []
});