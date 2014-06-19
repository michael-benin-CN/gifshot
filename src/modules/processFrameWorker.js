// processFrameWorker.js
// =====================

// Inspired from https://github.com/sole/Animated_GIF/blob/master/src/Animated_GIF.worker.js

/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/

define([
    'NeuQuant'
], function(NeuQuant) {
    var workerCode = function worker() {
        self.onmessage = function(ev) {
            var data = ev.data,
                response = workerMethods.run(data);

            postMessage(response);
        };

        var workerMethods = {
            'dataToRGB': function(data, width, height) {
                var i = 0,
                    length = width * height * 4,
                    rgb = [];

                while(i < length) {
                    rgb.push( data[i++] );
                    rgb.push( data[i++] );
                    rgb.push( data[i++] );
                    i++; // for the alpha channel which we don't care about
                }

                return rgb;
            },
            'componentizedPaletteToArray': function(paletteRGB) {
                var paletteArray = [],
                    i,
                    r,
                    g,
                    b;

                for(i = 0; i < paletteRGB.length; i += 3) {
                    r = paletteRGB[ i ];
                    g = paletteRGB[ i + 1 ];
                    b = paletteRGB[ i + 2 ];
                    paletteArray.push(r << 16 | g << 8 | b);
                }

                return paletteArray;
            },
            // This is the "traditional" Animated_GIF style of going from RGBA to indexed color frames
            'processFrameWithQuantizer': function(imageData, width, height, sampleInterval) {
                var rgbComponents = this.dataToRGB(imageData, width, height),
                    nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval),
                    paletteRGB = nq.process(),
                    paletteArray = new Uint32Array(this.componentizedPaletteToArray(paletteRGB)),
                    numberPixels = width * height,
                    indexedPixels = new Uint8Array(numberPixels),
                    k = 0,
                    i;

                for(i = 0; i < numberPixels; i++) {
                    r = rgbComponents[k++];
                    g = rgbComponents[k++];
                    b = rgbComponents[k++];
                    indexedPixels[i] = nq.map(r, g, b);
                }

                return {
                    pixels: indexedPixels,
                    palette: paletteArray
                };
            },
            'run': function(frame) {
                var width = frame.width,
                    height = frame.height,
                    imageData = frame.data,
                    palette = frame.palette,
                    sampleInterval = frame.sampleInterval;

                return this.processFrameWithQuantizer(imageData, width, height, sampleInterval);
            }
        };

        return workerMethods;
    };

    return workerCode;
});