// existingImages.js
// =================

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/AnimatedGIF',
  'core/getBase64GIF',
  'core/error'
], function(utils, AnimatedGIF, getBase64GIF, error) {
  return function(obj) {
    var images = obj.images,
      imagesLength = obj.imagesLength,
      callback = obj.callback,
      options = obj.options,
      skipObj = {
        'getUserMedia': true,
        'window.URL': tru
      },
      errorObj = error.validate(skipObj),
      loadedImages = 0,
      tempImage,
      ag;

    if (errorObj.error) {
      return callback(errorObj);
    }

    // change workerPath to point to where Animated_GIF.worker.js is
    ag = new AnimatedGIF(options);

    utils.each(images, function(index, currentImage) {
      if (utils.isElement(currentImage)) {
        currentImage.crossOrigin = 'Anonymous';
        ag.addFrame(currentImage, currentImage.src, options);
        loadedImages += 1;
        if (loadedImages === imagesLength) {
          getBase64GIF(ag, callback);
        }
      } else if (utils.isString(currentImage)) {
        tempImage = document.createElement('img');
        tempImage.crossOrigin = 'Anonymous';
        tempImage.onerror = function(e) {
          // If there is an error, ignore the image
          if (imagesLength > 0) {
            imagesLength -= 1;
          }
        }

        tempImage.src = currentImage;

        utils.setCSSAttr(tempImage, {
          'position': 'fixed',
          'opacity': '0'
        });

        (function(tempImage, ag, currentImage) {
          tempImage.onload = function() {
            ag.addFrame(tempImage, currentImage, options);
            utils.removeElement(tempImage);
            loadedImages += 1;
            if (loadedImages === imagesLength) {
              getBase64GIF(ag, callback);
            }
          };
        }(tempImage, ag, currentImage));
        document.body.appendChild(tempImage);
      }
    });
  };
});