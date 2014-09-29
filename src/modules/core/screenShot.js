// screenShot.js
// =============

// Inspired from https://github.com/meatspaces/meatspace-chat/blob/master/public/javascripts/base/videoShooter.js

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/AnimatedGIF'
], function(utils, AnimatedGIF) {
  return {
    getWebcamGIF: function(options, callback) {
      callback = utils.isFunction(callback) ? callback : function() {}

      var canvas = document.createElement('canvas'),
        context,
        videoElement = options.videoElement,
        keepCameraOn = options.keepCameraOn,
        webcamVideoElement = options.webcamVideoElement,
        cameraStream = options.cameraStream,
        gifWidth = options.gifWidth,
        gifHeight = options.gifHeight,
        videoWidth = options.videoWidth,
        videoHeight = options.videoHeight,
        sampleInterval = options.sampleInterval,
        numWorkers = options.numWorkers,
        crop = options.crop,
        interval = options.interval,
        progressCallback = options.progressCallback,
        savedRenderingContexts = options.savedRenderingContexts,
        saveRenderingContexts = options.saveRenderingContexts,
        renderingContextsToSave = [],
        numFrames = savedRenderingContexts.length ? savedRenderingContexts.length : options.numFrames,
        pendingFrames = numFrames,
        ag = new AnimatedGIF({
          'sampleInterval': sampleInterval,
          'numWorkers': numWorkers,
          'width': gifWidth,
          'height': gifHeight,
          'delay': interval
        }),
        text = options.text,
        fontWeight = options.fontWeight,
        fontSize = utils.getFontSize(options),
        fontFamily = options.fontFamily,
        fontColor = options.fontColor,
        textAlign = options.textAlign,
        textBaseline = options.textBaseline,
        textXCoordinate = options.textXCoordinate ? options.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? gifWidth : gifWidth / 2,
        textYCoordinate = options.textYCoordinate ? options.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? gifHeight / 2 : gifHeight,
        font = fontWeight + ' ' + fontSize + ' ' + fontFamily,
        sourceX = crop ? Math.floor(crop.scaledWidth / 2) : 0,
        sourceWidth = crop ? videoWidth - crop.scaledWidth : 0,
        sourceY = crop ? Math.floor(crop.scaledHeight / 2) : 0,
        sourceHeight = crop ? videoHeight - crop.scaledHeight : 0,
        captureFrame = function() {
          var framesLeft = pendingFrames - 1;

          if (savedRenderingContexts.length) {
            context.putImageData(savedRenderingContexts[numFrames - pendingFrames], 0, 0);
          } else {
            context.drawImage(videoElement,
              sourceX, sourceY, sourceWidth, sourceHeight,
              0, 0, gifWidth, gifHeight);
          }

          if (saveRenderingContexts) {
            renderingContextsToSave.push(context.getImageData(0, 0, gifWidth, gifHeight));
          }

          // If there is text to display, make sure to display it on the canvas after the image is drawn
          if (text) {
            context.font = font;
            context.fillStyle = fontColor;
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;
            context.fillText(text, textXCoordinate, textYCoordinate);
          }

          ag.addFrameImageData(context.getImageData(0, 0, gifWidth, gifHeight));

          pendingFrames = framesLeft;

          // Call back with an r value indicating how far along we are in capture
          progressCallback((numFrames - pendingFrames) / numFrames);

          if (framesLeft > 0) {
            setTimeout(captureFrame, interval * 1000); // timeouts are in milliseconds
          }

          if (!pendingFrames) {
            ag.getBase64GIF(function(image) {
              callback({
                'error': false,
                'errorCode': '',
                'errorMsg': '',
                'image': image,
                'cameraStream': cameraStream,
                'videoElement': videoElement,
                'webcamVideoElement': webcamVideoElement,
                'savedRenderingContexts': renderingContextsToSave,
                'keepCameraOn': keepCameraOn
              });
            });
          }
        };

      numFrames = numFrames !== undefined ? numFrames : 10;
      interval = interval !== undefined ? interval : 0.1; // In seconds

      canvas.width = gifWidth;
      canvas.height = gifHeight;
      context = canvas.getContext('2d');

      captureFrame();
    },
    'getCropDimensions': function(obj) {
      var width = obj.videoWidth,
        height = obj.videoHeight,
        gifWidth = obj.gifWidth,
        gifHeight = obj.gifHeight,
        result = {
          width: 0,
          height: 0,
          scaledWidth: 0,
          scaledHeight: 0
        };

      if (width > height) {
        result.width = Math.round(width * (gifHeight / height)) - gifWidth;
        result.scaledWidth = Math.round(result.width * (height / gifHeight));
      } else {
        result.height = Math.round(height * (gifWidth / width)) - gifHeight;
        result.scaledHeight = Math.round(result.height * (width / gifWidth));
      }

      return result;
    }
  };
});