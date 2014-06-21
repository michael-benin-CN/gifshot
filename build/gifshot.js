/*Copyrights for code authored by Yahoo! Inc. is licensed under the following terms:
MIT License
Copyright  2014 Yahoo! Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function(window, navigator, document, undefined) {
// utils.js
// ========
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
var videoStream, NeuQuant, processFrameWorker, GifWriter, animatedGif, screenShot, _utils_, _error_, utils;
_utils_ = utils = function () {
    var utils = {
            'URL': window.URL || window.webkitURL || window.mozURL || window.msURL,
            'getUserMedia': function () {
                var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
            }(),
            'Blob': window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder,
            'btoa': function () {
                var btoa = window.btoa || this.btoaPolyfill;
                return btoa ? btoa.bind(window) : false;
            }(),
            'btoaPolyfill': function (input) {
                var output = '', i = 0, l = input.length, key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                while (i < l) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
                    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
                    enc4 = chr3 & 63;
                    if (isNaN(chr2))
                        enc3 = enc4 = 64;
                    else if (isNaN(chr3))
                        enc4 = 64;
                    output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
                }
                return output;
            },
            'isObject': function (obj) {
                if (!obj) {
                    return false;
                }
                return Object.prototype.toString.call(obj) === '[object Object]';
            },
            'isEmptyObject': function (obj) {
                var isEmpty = true;
                if (utils.isFunction(Object.keys)) {
                    isEmpty = !Object.keys(obj).length;
                } else {
                    utils.each(obj, function () {
                        isEmpty = false;
                    });
                }
                return isEmpty;
            },
            'isArray': function (arr) {
                if (!arr) {
                    return false;
                }
                if ('isArray' in Array) {
                    return Array.isArray(arr);
                } else {
                    return Object.prototype.toString.call(arr) === '[object Array]';
                }
            },
            'isFunction': function (func) {
                if (!func) {
                    return false;
                }
                return Object.prototype.toString.call(func) === '[object Function]';
            },
            'isElement': function (elem) {
                return elem && elem.nodeType === 1;
            },
            'isString': function (value) {
                return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
            },
            'isSupported': {
                'canvas': function () {
                    var el = document.createElement('canvas');
                    return !!(el.getContext && el.getContext('2d'));
                },
                'console': function () {
                    var console = window.console;
                    return console && utils.isFunction(console.log);
                },
                'webworkers': function () {
                    return window.Worker;
                },
                'blob': function () {
                    return utils.Blob;
                },
                'Uint8Array': function () {
                    return window.Uint8Array;
                },
                'Uint32Array': function () {
                    return window.Uint32Array;
                },
                'videoCodecs': function () {
                    var testEl = document.createElement('video'), supportObj = {
                            'mp4': false,
                            'h264': false,
                            'ogv': false,
                            'ogg': false,
                            'webm': false
                        };
                    if (testEl.canPlayType) {
                        supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';
                        supportObj.h264 = (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"') || testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) !== '';
                        supportObj.ogv = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
                        supportObj.ogg = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
                        supportObj.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"') !== -1;
                    }
                    return supportObj;
                }()
            },
            'log': function () {
                if (utils.isSupported.console()) {
                    console.log.apply(window.console, arguments);
                }
            },
            'noop': function () {
            },
            'each': function (collection, callback) {
                var x, len;
                if (utils.isArray(collection)) {
                    x = -1;
                    len = collection.length;
                    while (++x < len) {
                        if (callback(x, collection[x]) === false) {
                            break;
                        }
                    }
                } else if (utils.isObject(collection)) {
                    for (x in collection) {
                        if (collection.hasOwnProperty(x)) {
                            if (callback(x, collection[x]) === false) {
                                break;
                            }
                        }
                    }
                }
            },
            'mergeOptions': function deepMerge(defaultOptions, userOptions) {
                if (!utils.isObject(defaultOptions) || !utils.isObject(userOptions) || !Object.keys) {
                    return;
                }
                var newObj = {};
                utils.each(defaultOptions, function (key, val) {
                    newObj[key] = defaultOptions[key];
                });
                utils.each(userOptions, function (key, val) {
                    var currentUserOption = userOptions[key];
                    if (!utils.isObject(currentUserOption)) {
                        newObj[key] = currentUserOption;
                    } else {
                        if (!defaultOptions[key]) {
                            newObj[key] = currentUserOption;
                        } else {
                            newObj[key] = deepMerge(defaultOptions[key], currentUserOption);
                        }
                    }
                });
                return newObj;
            },
            'setCSSAttr': function (elem, attr, val) {
                if (!utils.isElement(elem)) {
                    return;
                }
                if (utils.isString(attr) && utils.isString(val)) {
                    elem.style[attr] = val;
                } else if (utils.isObject(attr)) {
                    utils.each(attr, function (key, val) {
                        elem.style[key] = val;
                    });
                }
            },
            'removeElement': function (node) {
                if (!utils.isElement(node)) {
                    return;
                }
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            },
            'createWebWorker': function (content) {
                if (!utils.isString(content)) {
                    return {};
                }
                try {
                    var blob = new utils.Blob([content], { 'type': 'text/javascript' }), objectUrl = utils.URL.createObjectURL(blob), worker = new Worker(objectUrl);
                    return {
                        'objectUrl': objectUrl,
                        'worker': worker
                    };
                } catch (e) {
                    return '' + e;
                }
            },
            'getExtension': function (src) {
                return src.substr(src.lastIndexOf('.') + 1, src.length);
            },
            'webWorkerError': false
        };
    return utils;
}();
// videoStream.js
// ==============
// Inspired from https://github.com/sole/gumhelper/blob/master/gumhelper.js
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
videoStream = function () {
    return {
        'loadedData': false,
        'defaultVideoDimensions': {
            'width': 640,
            'height': 480
        },
        'findVideoSize': function findVideoSizeMethod(obj) {
            findVideoSizeMethod.attempts = findVideoSizeMethod.attempts || 0;
            var self = this, videoElement = obj.videoElement, cameraStream = obj.cameraStream, completedCallback = obj.completedCallback;
            if (!videoElement) {
                return;
            }
            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                videoElement.removeEventListener('loadeddata', self.findVideoSize);
                completedCallback({
                    'videoElement': videoElement,
                    'cameraStream': cameraStream,
                    'videoWidth': videoElement.videoWidth,
                    'videoHeight': videoElement.videoHeight
                });
            } else {
                if (findVideoSizeMethod.attempts < 10) {
                    findVideoSizeMethod.attempts += 1;
                    setTimeout(function () {
                        self.findVideoSize(obj);
                    }, 200);
                } else {
                    completedCallback({
                        'videoElement': videoElement,
                        'cameraStream': cameraStream,
                        'videoWidth': self.defaultVideoDimensions.width,
                        'videoHeight': self.defaultVideoDimensions.height
                    });
                }
            }
        },
        'onStreamingTimeout': function (callback) {
            if (utils.isFunction(callback)) {
                callback({
                    'error': true,
                    'errorCode': 'getUserMedia',
                    'errorMsg': 'There was an issue with the getUserMedia API - Timed out while trying to start streaming',
                    'image': null,
                    'cameraStream': {}
                });
            }
        },
        'stream': function (obj) {
            var self = this, existingVideo = utils.isArray(obj.existingVideo) ? obj.existingVideo[0] : obj.existingVideo, videoElement = obj.videoElement, cameraStream = obj.cameraStream, streamedCallback = obj.streamedCallback, completedCallback = obj.completedCallback;
            if (utils.isFunction(streamedCallback)) {
                streamedCallback();
            }
            if (existingVideo) {
                if (utils.isString(existingVideo)) {
                    videoElement.src = existingVideo;
                    videoElement.innerHTML = '<source src="' + existingVideo + '" type="video/' + utils.getExtension(existingVideo) + '" />';
                }
            } else if (videoElement.mozSrcObject) {
                videoElement.mozSrcObject = cameraStream;
            } else if (utils.URL) {
                videoElement.src = utils.URL.createObjectURL(cameraStream);
            }
            videoElement.play();
            setTimeout(function checkLoadedData() {
                checkLoadedData.count = checkLoadedData.count || 0;
                if (self.loadedData === true) {
                    self.findVideoSize({
                        'videoElement': videoElement,
                        'cameraStream': cameraStream,
                        'completedCallback': completedCallback
                    });
                    self.loadedData = false;
                } else {
                    checkLoadedData.count += 1;
                    if (checkLoadedData.count > 10) {
                        self.findVideoSize({
                            'videoElement': videoElement,
                            'cameraStream': cameraStream,
                            'completedCallback': completedCallback
                        });
                    } else {
                        checkLoadedData();
                    }
                }
            }, 100);
        },
        'startStreaming': function (obj) {
            var self = this, errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop, streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop, completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop, existingVideo = obj.existingVideo, webcamVideoElement = obj.webcamVideoElement, videoElement = utils.isElement(existingVideo) ? existingVideo : webcamVideoElement ? webcamVideoElement : document.createElement('video'), lastCameraStream = obj.lastCameraStream, cameraStream;
            videoElement.crossOrigin = 'Anonymous';
            videoElement.autoplay = true;
            videoElement.loop = true;
            videoElement.muted = true;
            videoElement.addEventListener('loadeddata', function (event) {
                self.loadedData = true;
            });
            if (existingVideo) {
                self.stream({
                    'videoElement': videoElement,
                    'existingVideo': existingVideo,
                    'completedCallback': completedCallback
                });
            } else if (lastCameraStream) {
                self.stream({
                    'videoElement': videoElement,
                    'cameraStream': lastCameraStream,
                    'streamedCallback': streamedCallback,
                    'completedCallback': completedCallback
                });
            } else {
                utils.getUserMedia({ 'video': true }, function (stream) {
                    self.stream({
                        'videoElement': videoElement,
                        'cameraStream': stream,
                        'streamedCallback': streamedCallback,
                        'completedCallback': completedCallback
                    });
                }, errorCallback);
            }
        },
        startVideoStreaming: function (callback, options) {
            options = options || {};
            var self = this, noGetUserMediaSupportTimeout, timeoutLength = options.timeout !== undefined ? options.timeout : 0, originalCallback = options.callback, webcamVideoElement = options.webcamVideoElement;
            // Some browsers apparently have support for video streaming because of the
            // presence of the getUserMedia function, but then do not answer our
            // calls for streaming.
            // So we'll set up this timeout and if nothing happens after a while, we'll
            // conclude that there's no actual getUserMedia support.
            if (timeoutLength > 0) {
                noGetUserMediaSupportTimeout = setTimeout(function () {
                    self.onStreamingTimeout(originalCallback);
                }, 10000);
            }
            this.startStreaming({
                'error': function () {
                    originalCallback({
                        'error': true,
                        'errorCode': 'getUserMedia',
                        'errorMsg': 'There was an issue with the getUserMedia API - the user probably denied permission',
                        'image': null,
                        'cameraStream': {}
                    });
                },
                'streamed': function () {
                    // The streaming started somehow, so we can assume there is getUserMedia support
                    clearTimeout(noGetUserMediaSupportTimeout);
                },
                'completed': function (obj) {
                    var cameraStream = obj.cameraStream, videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight;
                    callback({
                        'cameraStream': cameraStream,
                        'videoElement': videoElement,
                        'videoWidth': videoWidth,
                        'videoHeight': videoHeight
                    });
                },
                'lastCameraStream': options.lastCameraStream,
                'webcamVideoElement': webcamVideoElement
            });
        },
        'stopVideoStreaming': function (obj) {
            obj = utils.isObject(obj) ? obj : {};
            var cameraStream = obj.cameraStream, videoElement = obj.videoElement, keepCameraOn = obj.keepCameraOn, webcamVideoElement = obj.webcamVideoElement;
            if (!keepCameraOn && cameraStream && utils.isFunction(cameraStream.stop)) {
                // Stops the camera stream
                cameraStream.stop();
            }
            if (utils.isElement(videoElement) && !webcamVideoElement) {
                // Pauses the video, revokes the object URL (freeing up memory), and remove the video element
                videoElement.pause();
                // Destroys the object url
                if (utils.isFunction(utils.URL.revokeObjectURL) && !utils.webWorkerError) {
                    if (videoElement.src) {
                        utils.URL.revokeObjectURL(videoElement.src);
                    }
                }
                // Removes the video element from the DOM
                utils.removeElement(videoElement);
            }
        }
    };
}();
// NeuQuant.js
// ===========
/*
* NeuQuant Neural-Net Quantization Algorithm
* ------------------------------------------
* 
* Copyright (c) 1994 Anthony Dekker
* 
* NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See
* "Kohonen neural networks for optimal colour quantization" in "Network:
* Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of
* the algorithm.
* 
* Any party obtaining a copy of these files from the author, directly or
* indirectly, is granted, free of charge, a full and unrestricted irrevocable,
* world-wide, paid up, royalty-free, nonexclusive right and license to deal in
* this software and documentation files (the "Software"), including without
* limitation the rights to use, copy, modify, merge, publish, distribute,
* sublicense, and/or sell copies of the Software, and to permit persons who
* receive copies from any such party to do so, with the only requirement being
* that this copyright notice remain intact.
*/
/*
* This class handles Neural-Net quantization algorithm
* @author Kevin Weiner (original Java version - kweiner@fmsware.com)
* @author Thibault Imbert (AS3 version - bytearray.org)
* @version 0.1 AS3 implementation
* @version 0.2 JS->AS3 "translation" by antimatter15
* @version 0.3 JS clean up + using modern JS idioms by sole - http://soledadpenades.com
* Also implement fix in color conversion described at http://stackoverflow.com/questions/16371712/neuquant-js-javascript-color-quantization-hidden-bug-in-js-conversion
*/
NeuQuant = function () {
    function NeuQuant() {
        var netsize = 256;
        // number of colours used
        // four primes near 500 - assume no image has a length so large
        // that it is divisible by all four primes
        var prime1 = 499;
        var prime2 = 491;
        var prime3 = 487;
        var prime4 = 503;
        // minimum size for input image
        var minpicturebytes = 3 * prime4;
        // Network Definitions
        var maxnetpos = netsize - 1;
        var netbiasshift = 4;
        // bias for colour values
        var ncycles = 100;
        // no. of learning cycles
        // defs for freq and bias
        var intbiasshift = 16;
        // bias for fractions
        var intbias = 1 << intbiasshift;
        var gammashift = 10;
        // gamma = 1024
        var gamma = 1 << gammashift;
        var betashift = 10;
        var beta = intbias >> betashift;
        // beta = 1/1024
        var betagamma = intbias << gammashift - betashift;
        // defs for decreasing radius factor
        // For 256 colors, radius starts at 32.0 biased by 6 bits
        // and decreases by a factor of 1/30 each cycle
        var initrad = netsize >> 3;
        var radiusbiasshift = 6;
        var radiusbias = 1 << radiusbiasshift;
        var initradius = initrad * radiusbias;
        var radiusdec = 30;
        // defs for decreasing alpha factor
        // Alpha starts at 1.0 biased by 10 bits
        var alphabiasshift = 10;
        var initalpha = 1 << alphabiasshift;
        var alphadec;
        // radbias and alpharadbias used for radpower calculation
        var radbiasshift = 8;
        var radbias = 1 << radbiasshift;
        var alpharadbshift = alphabiasshift + radbiasshift;
        var alpharadbias = 1 << alpharadbshift;
        // Input image
        var thepicture;
        // Height * Width * 3
        var lengthcount;
        // Sampling factor 1..30
        var samplefac;
        // The network itself
        var network;
        var netindex = [];
        // for network lookup - really 256
        var bias = [];
        // bias and freq arrays for learning
        var freq = [];
        var radpower = [];
        function NeuQuantConstructor(thepic, len, sample) {
            var i;
            var p;
            thepicture = thepic;
            lengthcount = len;
            samplefac = sample;
            network = new Array(netsize);
            for (i = 0; i < netsize; i++) {
                network[i] = new Array(4);
                p = network[i];
                p[0] = p[1] = p[2] = (i << netbiasshift + 8) / netsize | 0;
                freq[i] = intbias / netsize | 0;
                // 1 / netsize
                bias[i] = 0;
            }
        }
        function colorMap() {
            var map = [];
            var index = new Array(netsize);
            for (var i = 0; i < netsize; i++)
                index[network[i][3]] = i;
            var k = 0;
            for (var l = 0; l < netsize; l++) {
                var j = index[l];
                map[k++] = network[j][0];
                map[k++] = network[j][1];
                map[k++] = network[j][2];
            }
            return map;
        }
        // Insertion sort of network and building of netindex[0..255]
        // (to do after unbias)
        function inxbuild() {
            var i;
            var j;
            var smallpos;
            var smallval;
            var p;
            var q;
            var previouscol;
            var startpos;
            previouscol = 0;
            startpos = 0;
            for (i = 0; i < netsize; i++) {
                p = network[i];
                smallpos = i;
                smallval = p[1];
                // index on g
                // find smallest in i..netsize-1
                for (j = i + 1; j < netsize; j++) {
                    q = network[j];
                    if (q[1] < smallval) {
                        // index on g
                        smallpos = j;
                        smallval = q[1];
                    }
                }
                q = network[smallpos];
                // swap p (i) and q (smallpos) entries
                if (i != smallpos) {
                    j = q[0];
                    q[0] = p[0];
                    p[0] = j;
                    j = q[1];
                    q[1] = p[1];
                    p[1] = j;
                    j = q[2];
                    q[2] = p[2];
                    p[2] = j;
                    j = q[3];
                    q[3] = p[3];
                    p[3] = j;
                }
                // smallval entry is now in position i
                if (smallval != previouscol) {
                    netindex[previouscol] = startpos + i >> 1;
                    for (j = previouscol + 1; j < smallval; j++) {
                        netindex[j] = i;
                    }
                    previouscol = smallval;
                    startpos = i;
                }
            }
            netindex[previouscol] = startpos + maxnetpos >> 1;
            for (j = previouscol + 1; j < 256; j++) {
                netindex[j] = maxnetpos;
            }
        }
        // Main Learning Loop
        function learn() {
            var i;
            var j;
            var b;
            var g;
            var r;
            var radius;
            var rad;
            var alpha;
            var step;
            var delta;
            var samplepixels;
            var p;
            var pix;
            var lim;
            if (lengthcount < minpicturebytes) {
                samplefac = 1;
            }
            alphadec = 30 + (samplefac - 1) / 3;
            p = thepicture;
            pix = 0;
            lim = lengthcount;
            samplepixels = lengthcount / (3 * samplefac);
            delta = samplepixels / ncycles | 0;
            alpha = initalpha;
            radius = initradius;
            rad = radius >> radiusbiasshift;
            if (rad <= 1) {
                rad = 0;
            }
            for (i = 0; i < rad; i++) {
                radpower[i] = alpha * ((rad * rad - i * i) * radbias / (rad * rad));
            }
            if (lengthcount < minpicturebytes) {
                step = 3;
            } else if (lengthcount % prime1 !== 0) {
                step = 3 * prime1;
            } else {
                if (lengthcount % prime2 !== 0) {
                    step = 3 * prime2;
                } else {
                    if (lengthcount % prime3 !== 0) {
                        step = 3 * prime3;
                    } else {
                        step = 3 * prime4;
                    }
                }
            }
            i = 0;
            while (i < samplepixels) {
                b = (p[pix + 0] & 255) << netbiasshift;
                g = (p[pix + 1] & 255) << netbiasshift;
                r = (p[pix + 2] & 255) << netbiasshift;
                j = contest(b, g, r);
                altersingle(alpha, j, b, g, r);
                if (rad !== 0) {
                    // Alter neighbours
                    alterneigh(rad, j, b, g, r);
                }
                pix += step;
                if (pix >= lim) {
                    pix -= lengthcount;
                }
                i++;
                if (delta === 0) {
                    delta = 1;
                }
                if (i % delta === 0) {
                    alpha -= alpha / alphadec;
                    radius -= radius / radiusdec;
                    rad = radius >> radiusbiasshift;
                    if (rad <= 1) {
                        rad = 0;
                    }
                    for (j = 0; j < rad; j++) {
                        radpower[j] = alpha * ((rad * rad - j * j) * radbias / (rad * rad));
                    }
                }
            }
        }
        // Search for BGR values 0..255 (after net is unbiased) and return colour index
        function map(b, g, r) {
            var i;
            var j;
            var dist;
            var a;
            var bestd;
            var p;
            var best;
            // Biggest possible distance is 256 * 3
            bestd = 1000;
            best = -1;
            i = netindex[g];
            // index on g
            j = i - 1;
            // start at netindex[g] and work outwards
            while (i < netsize || j >= 0) {
                if (i < netsize) {
                    p = network[i];
                    dist = p[1] - g;
                    // inx key
                    if (dist >= bestd) {
                        i = netsize;
                    } else {
                        i++;
                        if (dist < 0) {
                            dist = -dist;
                        }
                        a = p[0] - b;
                        if (a < 0) {
                            a = -a;
                        }
                        dist += a;
                        if (dist < bestd) {
                            a = p[2] - r;
                            if (a < 0) {
                                a = -a;
                            }
                            dist += a;
                            if (dist < bestd) {
                                bestd = dist;
                                best = p[3];
                            }
                        }
                    }
                }
                if (j >= 0) {
                    p = network[j];
                    dist = g - p[1];
                    // inx key - reverse dif
                    if (dist >= bestd) {
                        j = -1;
                    } else {
                        j--;
                        if (dist < 0) {
                            dist = -dist;
                        }
                        a = p[0] - b;
                        if (a < 0) {
                            a = -a;
                        }
                        dist += a;
                        if (dist < bestd) {
                            a = p[2] - r;
                            if (a < 0) {
                                a = -a;
                            }
                            dist += a;
                            if (dist < bestd) {
                                bestd = dist;
                                best = p[3];
                            }
                        }
                    }
                }
            }
            return best;
        }
        function process() {
            learn();
            unbiasnet();
            inxbuild();
            return colorMap();
        }
        // Unbias network to give byte values 0..255 and record position i
        // to prepare for sort
        function unbiasnet() {
            var i;
            var j;
            for (i = 0; i < netsize; i++) {
                network[i][0] >>= netbiasshift;
                network[i][1] >>= netbiasshift;
                network[i][2] >>= netbiasshift;
                network[i][3] = i;
            }
        }
        // Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2))
        // in radpower[|i-j|]
        function alterneigh(rad, i, b, g, r) {
            var j;
            var k;
            var lo;
            var hi;
            var a;
            var m;
            var p;
            lo = i - rad;
            if (lo < -1) {
                lo = -1;
            }
            hi = i + rad;
            if (hi > netsize) {
                hi = netsize;
            }
            j = i + 1;
            k = i - 1;
            m = 1;
            while (j < hi || k > lo) {
                a = radpower[m++];
                if (j < hi) {
                    p = network[j++];
                    try {
                        p[0] -= a * (p[0] - b) / alpharadbias | 0;
                        p[1] -= a * (p[1] - g) / alpharadbias | 0;
                        p[2] -= a * (p[2] - r) / alpharadbias | 0;
                    } catch (e) {
                    }
                }
                if (k > lo) {
                    p = network[k--];
                    try {
                        p[0] -= a * (p[0] - b) / alpharadbias | 0;
                        p[1] -= a * (p[1] - g) / alpharadbias | 0;
                        p[2] -= a * (p[2] - r) / alpharadbias | 0;
                    } catch (e) {
                    }
                }
            }
        }
        // Move neuron i towards biased (b,g,r) by factor alpha
        function altersingle(alpha, i, b, g, r) {
            // alter hit neuron
            var n = network[i];
            var alphaMult = alpha / initalpha;
            n[0] -= alphaMult * (n[0] - b) | 0;
            n[1] -= alphaMult * (n[1] - g) | 0;
            n[2] -= alphaMult * (n[2] - r) | 0;
        }
        // Search for biased BGR values
        function contest(b, g, r) {
            // finds closest neuron (min dist) and updates freq
            // finds best neuron (min dist-bias) and returns position
            // for frequently chosen neurons, freq[i] is high and bias[i] is negative
            // bias[i] = gamma*((1/netsize)-freq[i])
            var i;
            var dist;
            var a;
            var biasdist;
            var betafreq;
            var bestpos;
            var bestbiaspos;
            var bestd;
            var bestbiasd;
            var n;
            bestd = ~(1 << 31);
            bestbiasd = bestd;
            bestpos = -1;
            bestbiaspos = bestpos;
            for (i = 0; i < netsize; i++) {
                n = network[i];
                dist = n[0] - b;
                if (dist < 0) {
                    dist = -dist;
                }
                a = n[1] - g;
                if (a < 0) {
                    a = -a;
                }
                dist += a;
                a = n[2] - r;
                if (a < 0) {
                    a = -a;
                }
                dist += a;
                if (dist < bestd) {
                    bestd = dist;
                    bestpos = i;
                }
                biasdist = dist - (bias[i] >> intbiasshift - netbiasshift);
                if (biasdist < bestbiasd) {
                    bestbiasd = biasdist;
                    bestbiaspos = i;
                }
                betafreq = freq[i] >> betashift;
                freq[i] -= betafreq;
                bias[i] += betafreq << gammashift;
            }
            freq[bestpos] += beta;
            bias[bestpos] -= betagamma;
            return bestbiaspos;
        }
        NeuQuantConstructor.apply(this, arguments);
        var exports = {};
        exports.map = map;
        exports.process = process;
        return exports;
    }
    return NeuQuant;
}();
// processFrameWorker.js
// =====================
// Inspired from https://github.com/sole/Animated_GIF/blob/master/src/Animated_GIF.worker.js
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
processFrameWorker = function () {
    var workerCode = function worker() {
        self.onmessage = function (ev) {
            var data = ev.data, response = workerMethods.run(data);
            postMessage(response);
        };
        var workerMethods = {
                'dataToRGB': function (data, width, height) {
                    var i = 0, length = width * height * 4, rgb = [];
                    while (i < length) {
                        rgb.push(data[i++]);
                        rgb.push(data[i++]);
                        rgb.push(data[i++]);
                        i++;
                    }
                    return rgb;
                },
                'componentizedPaletteToArray': function (paletteRGB) {
                    var paletteArray = [], i, r, g, b;
                    for (i = 0; i < paletteRGB.length; i += 3) {
                        r = paletteRGB[i];
                        g = paletteRGB[i + 1];
                        b = paletteRGB[i + 2];
                        paletteArray.push(r << 16 | g << 8 | b);
                    }
                    return paletteArray;
                },
                // This is the "traditional" Animated_GIF style of going from RGBA to indexed color frames
                'processFrameWithQuantizer': function (imageData, width, height, sampleInterval) {
                    var rgbComponents = this.dataToRGB(imageData, width, height), nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval), paletteRGB = nq.process(), paletteArray = new Uint32Array(this.componentizedPaletteToArray(paletteRGB)), numberPixels = width * height, indexedPixels = new Uint8Array(numberPixels), k = 0, i;
                    for (i = 0; i < numberPixels; i++) {
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
                'run': function (frame) {
                    var width = frame.width, height = frame.height, imageData = frame.data, palette = frame.palette, sampleInterval = frame.sampleInterval;
                    return this.processFrameWithQuantizer(imageData, width, height, sampleInterval);
                }
            };
        return workerMethods;
    };
    return workerCode;
}();
// gifWriter.js
// ============
// (c) Dean McNamee <dean@gmail.com>, 2013.
//
// https://github.com/deanm/omggif
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// omggif is a JavaScript implementation of a GIF 89a encoder and decoder,
// including animation and compression.  It does not rely on any specific
// underlying system, so should run in the browser, Node, or Plask.
GifWriter = function () {
    return function GifWriter(buf, width, height, gopts) {
        var p = 0;
        gopts = gopts === undefined ? {} : gopts;
        var loop_count = gopts.loop === undefined ? null : gopts.loop;
        var global_palette = gopts.palette === undefined ? null : gopts.palette;
        if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
            throw 'Width/Height invalid.';
        function check_palette_and_num_colors(palette) {
            var num_colors = palette.length;
            if (num_colors < 2 || num_colors > 256 || num_colors & num_colors - 1)
                throw 'Invalid code/color length, must be power of 2 and 2 .. 256.';
            return num_colors;
        }
        // - Header.
        buf[p++] = 71;
        buf[p++] = 73;
        buf[p++] = 70;
        // GIF
        buf[p++] = 56;
        buf[p++] = 57;
        buf[p++] = 97;
        // 89a
        // Handling of Global Color Table (palette) and background index.
        var gp_num_colors_pow2 = 0;
        var background = 0;
        // - Logical Screen Descriptor.
        // NOTE(deanm): w/h apparently ignored by implementations, but set anyway.
        buf[p++] = width & 255;
        buf[p++] = width >> 8 & 255;
        buf[p++] = height & 255;
        buf[p++] = height >> 8 & 255;
        // NOTE: Indicates 0-bpp original color resolution (unused?).
        buf[p++] = (global_palette !== null ? 128 : 0) | // Global Color Table Flag.
        gp_num_colors_pow2;
        // NOTE: No sort flag (unused?).
        buf[p++] = background;
        // Background Color Index.
        buf[p++] = 0;
        // Pixel aspect ratio (unused?).
        if (loop_count !== null) {
            // Netscape block for looping.
            if (loop_count < 0 || loop_count > 65535)
                throw 'Loop count invalid.';
            // Extension code, label, and length.
            buf[p++] = 33;
            buf[p++] = 255;
            buf[p++] = 11;
            // NETSCAPE2.0
            buf[p++] = 78;
            buf[p++] = 69;
            buf[p++] = 84;
            buf[p++] = 83;
            buf[p++] = 67;
            buf[p++] = 65;
            buf[p++] = 80;
            buf[p++] = 69;
            buf[p++] = 50;
            buf[p++] = 46;
            buf[p++] = 48;
            // Sub-block
            buf[p++] = 3;
            buf[p++] = 1;
            buf[p++] = loop_count & 255;
            buf[p++] = loop_count >> 8 & 255;
            buf[p++] = 0;
        }
        var ended = false;
        this.addFrame = function (x, y, w, h, indexed_pixels, opts) {
            if (ended === true) {
                --p;
                ended = false;
            }
            // Un-end.
            opts = opts === undefined ? {} : opts;
            // TODO(deanm): Bounds check x, y.  Do they need to be within the virtual
            // canvas width/height, I imagine?
            if (x < 0 || y < 0 || x > 65535 || y > 65535)
                throw 'x/y invalid.';
            if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
                throw 'Width/Height invalid.';
            if (indexed_pixels.length < w * h)
                throw 'Not enough pixels for the frame size.';
            var using_local_palette = true;
            var palette = opts.palette;
            if (palette === undefined || palette === null) {
                using_local_palette = false;
                palette = global_palette;
            }
            if (palette === undefined || palette === null)
                throw 'Must supply either a local or global palette.';
            var num_colors = check_palette_and_num_colors(palette);
            // Compute the min_code_size (power of 2), destroying num_colors.
            var min_code_size = 0;
            while (num_colors >>= 1)
                ++min_code_size;
            num_colors = 1 << min_code_size;
            // Now we can easily get it back.
            var delay = opts.delay === undefined ? 0 : opts.delay;
            // From the spec:
            //     0 -   No disposal specified. The decoder is
            //           not required to take any action.
            //     1 -   Do not dispose. The graphic is to be left
            //           in place.
            //     2 -   Restore to background color. The area used by the
            //           graphic must be restored to the background color.
            //     3 -   Restore to previous. The decoder is required to
            //           restore the area overwritten by the graphic with
            //           what was there prior to rendering the graphic.
            //  4-7 -    To be defined.
            // NOTE(deanm): Dispose background doesn't really work, apparently most
            // browsers ignore the background palette index and clear to transparency.
            var disposal = opts.disposal === undefined ? 0 : opts.disposal;
            if (disposal < 0 || disposal > 3)
                // 4-7 is reserved.
                throw 'Disposal out of range.';
            var use_transparency = false;
            var transparent_index = 0;
            if (opts.transparent !== undefined && opts.transparent !== null) {
                use_transparency = true;
                transparent_index = opts.transparent;
                if (transparent_index < 0 || transparent_index >= num_colors)
                    throw 'Transparent color index.';
            }
            if (disposal !== 0 || use_transparency || delay !== 0) {
                // - Graphics Control Extension
                buf[p++] = 33;
                buf[p++] = 249;
                // Extension / Label.
                buf[p++] = 4;
                // Byte size.
                buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
                buf[p++] = delay & 255;
                buf[p++] = delay >> 8 & 255;
                buf[p++] = transparent_index;
                // Transparent color index.
                buf[p++] = 0;
            }
            // - Image Descriptor
            buf[p++] = 44;
            // Image Seperator.
            buf[p++] = x & 255;
            buf[p++] = x >> 8 & 255;
            // Left.
            buf[p++] = y & 255;
            buf[p++] = y >> 8 & 255;
            // Top.
            buf[p++] = w & 255;
            buf[p++] = w >> 8 & 255;
            buf[p++] = h & 255;
            buf[p++] = h >> 8 & 255;
            // NOTE: No sort flag (unused?).
            // TODO(deanm): Support interlace.
            buf[p++] = using_local_palette === true ? 128 | min_code_size - 1 : 0;
            // - Local Color Table
            if (using_local_palette === true) {
                for (var i = 0, il = palette.length; i < il; ++i) {
                    var rgb = palette[i];
                    buf[p++] = rgb >> 16 & 255;
                    buf[p++] = rgb >> 8 & 255;
                    buf[p++] = rgb & 255;
                }
            }
            p = GifWriterOutputLZWCodeStream(buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);
        };
        this.end = function () {
            if (ended === false) {
                buf[p++] = 59;
                // Trailer.
                ended = true;
            }
            return p;
        };
        // Main compression routine, palette indexes -> LZW code stream.
        // |index_stream| must have at least one entry.
        function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
            buf[p++] = min_code_size;
            var cur_subblock = p++;
            // Pointing at the length field.
            var clear_code = 1 << min_code_size;
            var code_mask = clear_code - 1;
            var eoi_code = clear_code + 1;
            var next_code = eoi_code + 1;
            var cur_code_size = min_code_size + 1;
            // Number of bits per code.
            var cur_shift = 0;
            // We have at most 12-bit codes, so we should have to hold a max of 19
            // bits here (and then we would write out).
            var cur = 0;
            function emit_bytes_to_buffer(bit_block_size) {
                while (cur_shift >= bit_block_size) {
                    buf[p++] = cur & 255;
                    cur >>= 8;
                    cur_shift -= 8;
                    if (p === cur_subblock + 256) {
                        // Finished a subblock.
                        buf[cur_subblock] = 255;
                        cur_subblock = p++;
                    }
                }
            }
            function emit_code(c) {
                cur |= c << cur_shift;
                cur_shift += cur_code_size;
                emit_bytes_to_buffer(8);
            }
            // I am not an expert on the topic, and I don't want to write a thesis.
            // However, it is good to outline here the basic algorithm and the few data
            // structures and optimizations here that make this implementation fast.
            // The basic idea behind LZW is to build a table of previously seen runs
            // addressed by a short id (herein called output code).  All data is
            // referenced by a code, which represents one or more values from the
            // original input stream.  All input bytes can be referenced as the same
            // value as an output code.  So if you didn't want any compression, you
            // could more or less just output the original bytes as codes (there are
            // some details to this, but it is the idea).  In order to achieve
            // compression, values greater then the input range (codes can be up to
            // 12-bit while input only 8-bit) represent a sequence of previously seen
            // inputs.  The decompressor is able to build the same mapping while
            // decoding, so there is always a shared common knowledge between the
            // encoding and decoder, which is also important for "timing" aspects like
            // how to handle variable bit width code encoding.
            //
            // One obvious but very important consequence of the table system is there
            // is always a unique id (at most 12-bits) to map the runs.  'A' might be
            // 4, then 'AA' might be 10, 'AAA' 11, 'AAAA' 12, etc.  This relationship
            // can be used for an effecient lookup strategy for the code mapping.  We
            // need to know if a run has been seen before, and be able to map that run
            // to the output code.  Since we start with known unique ids (input bytes),
            // and then from those build more unique ids (table entries), we can
            // continue this chain (almost like a linked list) to always have small
            // integer values that represent the current byte chains in the encoder.
            // This means instead of tracking the input bytes (AAAABCD) to know our
            // current state, we can track the table entry for AAAABC (it is guaranteed
            // to exist by the nature of the algorithm) and the next character D.
            // Therefor the tuple of (table_entry, byte) is guaranteed to also be
            // unique.  This allows us to create a simple lookup key for mapping input
            // sequences to codes (table indices) without having to store or search
            // any of the code sequences.  So if 'AAAA' has a table entry of 12, the
            // tuple of ('AAAA', K) for any input byte K will be unique, and can be our
            // key.  This leads to a integer value at most 20-bits, which can always
            // fit in an SMI value and be used as a fast sparse array / object key.
            // Output code for the current contents of the index buffer.
            var ib_code = index_stream[0] & code_mask;
            // Load first input index.
            var code_table = {};
            // Key'd on our 20-bit "tuple".
            emit_code(clear_code);
            // Spec says first code should be a clear code.
            // First index already loaded, process the rest of the stream.
            for (var i = 1, il = index_stream.length; i < il; ++i) {
                var k = index_stream[i] & code_mask;
                var cur_key = ib_code << 8 | k;
                // (prev, k) unique tuple.
                var cur_code = code_table[cur_key];
                // buffer + k.
                // Check if we have to create a new code table entry.
                if (cur_code === undefined) {
                    // We don't have buffer + k.
                    // Emit index buffer (without k).
                    // This is an inline version of emit_code, because this is the core
                    // writing routine of the compressor (and V8 cannot inline emit_code
                    // because it is a closure here in a different context).  Additionally
                    // we can call emit_byte_to_buffer less often, because we can have
                    // 30-bits (from our 31-bit signed SMI), and we know our codes will only
                    // be 12-bits, so can safely have 18-bits there without overflow.
                    // emit_code(ib_code);
                    cur |= ib_code << cur_shift;
                    cur_shift += cur_code_size;
                    while (cur_shift >= 8) {
                        buf[p++] = cur & 255;
                        cur >>= 8;
                        cur_shift -= 8;
                        if (p === cur_subblock + 256) {
                            // Finished a subblock.
                            buf[cur_subblock] = 255;
                            cur_subblock = p++;
                        }
                    }
                    if (next_code === 4096) {
                        // Table full, need a clear.
                        emit_code(clear_code);
                        next_code = eoi_code + 1;
                        cur_code_size = min_code_size + 1;
                        code_table = {};
                    } else {
                        // Table not full, insert a new entry.
                        // Increase our variable bit code sizes if necessary.  This is a bit
                        // tricky as it is based on "timing" between the encoding and
                        // decoder.  From the encoders perspective this should happen after
                        // we've already emitted the index buffer and are about to create the
                        // first table entry that would overflow our current code bit size.
                        if (next_code >= 1 << cur_code_size)
                            ++cur_code_size;
                        code_table[cur_key] = next_code++;
                    }
                    ib_code = k;
                } else {
                    ib_code = cur_code;
                }
            }
            emit_code(ib_code);
            // There will still be something in the index buffer.
            emit_code(eoi_code);
            // End Of Information.
            // Flush / finalize the sub-blocks stream to the buffer.
            emit_bytes_to_buffer(1);
            // Finish the sub-blocks, writing out any unfinished lengths and
            // terminating with a sub-block of length 0.  If we have already started
            // but not yet used a sub-block it can just become the terminator.
            if (cur_subblock + 1 === p) {
                // Started but unused.
                buf[cur_subblock] = 0;
            } else {
                // Started and used, write length and additional terminator block.
                buf[cur_subblock] = p - cur_subblock - 1;
                buf[p++] = 0;
            }
            return p;
        }
    };
}();
// animatedGif.js
// ==============
// Inspired from https://github.com/sole/Animated_GIF/blob/master/src/Animated_GIF.js
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
animatedGif = function (frameWorkerCode) {
    var AnimatedGIF = function (options) {
        options = utils.isObject(options) ? options : {};
        this.canvas = null;
        this.ctx = null;
        this.repeat = 0;
        this.frames = [];
        this.numRenderedFrames = 0;
        this.onRenderCompleteCallback = utils.noop;
        this.onRenderProgressCallback = utils.noop;
        this.workers = [];
        this.availableWorkers = [];
        this.generatingGIF = false;
        this.options = options = utils.mergeOptions(this.defaultOptions, options);
        // Constructs and initializes the the web workers appropriately
        this.initializeWebWorkers(options);
    };
    AnimatedGIF.prototype = {
        'defaultOptions': {
            'width': 160,
            'height': 120,
            'delay': 250,
            'palette': null,
            'sampleInterval': 10,
            'numWorkers': 2
        },
        'workerMethods': frameWorkerCode(),
        'initializeWebWorkers': function (options) {
            var processFrameWorkerCode = NeuQuant.toString() + frameWorkerCode.toString() + 'worker();', webWorkerObj, objectUrl, webWorker, numWorkers, x = -1, workerError = '';
            numWorkers = options.numWorkers;
            while (++x < numWorkers) {
                webWorkerObj = utils.createWebWorker(processFrameWorkerCode);
                if (utils.isObject(webWorkerObj)) {
                    objectUrl = webWorkerObj.objectUrl;
                    webWorker = webWorkerObj.worker;
                    this.workers.push({
                        'worker': webWorker,
                        'objectUrl': objectUrl
                    });
                    this.availableWorkers.push(webWorker);
                } else {
                    workerError = webWorkerObj;
                    utils.webWorkerError = !!webWorkerObj;
                }
            }
            this.workerError = workerError;
            this.canvas = document.createElement('canvas');
            this.canvas.width = options.width;
            this.canvas.height = options.height;
            this.ctx = this.canvas.getContext('2d');
            this.options.delay = this.options.delay * 0.1;
            this.frames = [];
        },
        // Return a worker for processing a frame
        'getWorker': function () {
            return this.availableWorkers.pop();
        },
        // Restores a worker to the pool
        'freeWorker': function (worker) {
            this.availableWorkers.push(worker);
        },
        'byteMap': function () {
            var byteMap = [];
            for (var i = 0; i < 256; i++) {
                byteMap[i] = String.fromCharCode(i);
            }
            return byteMap;
        }(),
        'bufferToString': function (buffer) {
            var numberValues = buffer.length, str = '', x = -1;
            while (++x < numberValues) {
                str += this.byteMap[buffer[x]];
            }
            return str;
        },
        'onFrameFinished': function () {
            // The GIF is not written until we're done with all the frames
            // because they might not be processed in the same order
            var self = this, frames = this.frames, allDone = frames.every(function (frame) {
                    return !frame.beingProcessed && frame.done;
                });
            this.numRenderedFrames++;
            this.onRenderProgressCallback(this.numRenderedFrames * 0.75 / frames.length);
            if (allDone) {
                if (!this.generatingGIF) {
                    this.generateGIF(frames, this.onRenderCompleteCallback);
                }
            } else {
                setTimeout(function () {
                    self.processNextFrame();
                }, 1);
            }
        },
        'processFrame': function (position) {
            var AnimatedGifContext = this, options = this.options, sampleInterval = options.sampleInterval, frames = this.frames, frame, worker, done = function (ev) {
                    var data = ev.data;
                    // Delete original data, and free memory
                    delete frame.data;
                    frame.pixels = Array.prototype.slice.call(data.pixels);
                    frame.palette = Array.prototype.slice.call(data.palette);
                    frame.done = true;
                    frame.beingProcessed = false;
                    AnimatedGifContext.freeWorker(worker);
                    AnimatedGifContext.onFrameFinished();
                };
            frame = frames[position];
            if (frame.beingProcessed || frame.done) {
                this.onFrameFinished();
                return;
            }
            frame.sampleInterval = sampleInterval;
            frame.beingProcessed = true;
            worker = this.getWorker();
            if (worker) {
                // Process the frame in a web worker
                worker.onmessage = done;
                worker.postMessage(frame);
            } else {
                // Process the frame in the current thread
                done({ 'data': AnimatedGifContext.workerMethods.run(frame) });
            }
        },
        'startRendering': function (completeCallback) {
            this.onRenderCompleteCallback = completeCallback;
            for (var i = 0; i < this.options.numWorkers && i < this.frames.length; i++) {
                this.processFrame(i);
            }
        },
        'processNextFrame': function () {
            var position = -1;
            for (var i = 0; i < this.frames.length; i++) {
                var frame = this.frames[i];
                if (!frame.done && !frame.beingProcessed) {
                    position = i;
                    break;
                }
            }
            if (position >= 0) {
                this.processFrame(position);
            }
        },
        // Takes the already processed data in frames and feeds it to a new
        // GifWriter instance in order to get the binary GIF file
        'generateGIF': function (frames, callback) {
            // TODO: Weird: using a simple JS array instead of a typed array,
            // the files are WAY smaller o_o. Patches/explanations welcome!
            var buffer = [],
                // new Uint8Array(width * height * frames.length * 5);
                gifOptions = { 'loop': this.repeat }, options = this.options, height = options.height, width = options.width, gifWriter = new GifWriter(buffer, width, height, gifOptions), onRenderProgressCallback = this.onRenderProgressCallback, delay = options.delay, bufferToString, gif;
            this.generatingGIF = true;
            utils.each(frames, function (iterator, frame) {
                var framePalette = frame.palette;
                onRenderProgressCallback(0.75 + 0.25 * frame.position * 1 / frames.length);
                gifWriter.addFrame(0, 0, width, height, frame.pixels, {
                    palette: framePalette,
                    delay: delay
                });
            });
            gifWriter.end();
            onRenderProgressCallback(1);
            this.frames = [];
            this.generatingGIF = false;
            if (utils.isFunction(callback)) {
                bufferToString = this.bufferToString(buffer);
                gif = 'data:image/gif;base64,' + utils.btoa(bufferToString);
                callback(gif);
            }
        },
        // From GIF: 0 = loop forever, null = not looping, n > 0 = loop n times and stop
        'setRepeat': function (r) {
            this.repeat = r;
        },
        'addFrame': function (element, src, gifshotOptions) {
            gifshotOptions = utils.isObject(gifshotOptions) ? gifshotOptions : {};
            var self = this, ctx = this.ctx, options = this.options, width = options.width, height = options.height, imageData, gifHeight = gifshotOptions.gifHeight, gifWidth = gifshotOptions.gifWidth, text = gifshotOptions.text, fontWeight = gifshotOptions.fontWeight, fontSize = gifshotOptions.fontSize, fontFamily = gifshotOptions.fontFamily, fontColor = gifshotOptions.fontColor, textAlign = gifshotOptions.textAlign, textBaseline = gifshotOptions.textBaseline, textXCoordinate = gifshotOptions.textXCoordinate ? gifshotOptions.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? width : width / 2, textYCoordinate = gifshotOptions.textYCoordinate ? gifshotOptions.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? height / 2 : height, font = fontWeight + ' ' + fontSize + ' ' + fontFamily;
            try {
                if (src) {
                    element.src = src;
                }
                ctx.drawImage(element, 0, 0, width, height);
                if (text) {
                    ctx.font = font;
                    ctx.fillStyle = fontColor;
                    ctx.textAlign = textAlign;
                    ctx.textBaseline = textBaseline;
                    ctx.fillText(text, textXCoordinate, textYCoordinate);
                }
                imageData = ctx.getImageData(0, 0, width, height);
                self.addFrameImageData(imageData);
            } catch (e) {
                return '' + e;
            }
        },
        'addFrameImageData': function (imageData) {
            var frames = this.frames, imageDataArray = imageData.data;
            this.frames.push({
                'data': imageDataArray,
                'width': imageData.width,
                'height': imageData.height,
                'palette': null,
                'dithering': null,
                'done': false,
                'beingProcessed': false,
                'position': frames.length
            });
        },
        'onRenderProgress': function (callback) {
            this.onRenderProgressCallback = callback;
        },
        'isRendering': function () {
            return this.generatingGIF;
        },
        'getBase64GIF': function (completeCallback) {
            var self = this, onRenderComplete = function (gif) {
                    self.destroyWorkers();
                    setTimeout(function () {
                        completeCallback(gif);
                    }, 0);
                };
            this.startRendering(onRenderComplete);
        },
        'destroyWorkers': function () {
            if (this.workerError) {
                return;
            }
            var workers = this.workers;
            // Explicitly ask web workers to die so they are explicitly GC'ed
            utils.each(workers, function (iterator, workerObj) {
                var worker = workerObj.worker, objectUrl = workerObj.objectUrl;
                worker.terminate();
                utils.URL.revokeObjectURL(objectUrl);
            });
        }
    };
    return AnimatedGIF;
}(processFrameWorker);
// screenShot.js
// =============
// Inspired from https://github.com/meatspaces/meatspace-chat/blob/master/public/javascripts/base/videoShooter.js
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
screenShot = function (AnimatedGIF) {
    return {
        getWebcamGif: function (obj, callback) {
            callback = utils.isFunction(callback) ? callback : function () {
            };
            var canvas = document.createElement('canvas'), context, videoElement = obj.videoElement, webcamVideoElement = obj.webcamVideoElement, cameraStream = obj.cameraStream, gifWidth = obj.gifWidth, gifHeight = obj.gifHeight, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight, sampleInterval = obj.sampleInterval, numWorkers = obj.numWorkers, crop = obj.crop, interval = obj.interval, progressCallback = obj.progressCallback, savedRenderingContexts = obj.savedRenderingContexts, saveRenderingContexts = obj.saveRenderingContexts, renderingContextsToSave = [], numFrames = savedRenderingContexts.length ? savedRenderingContexts.length : obj.numFrames, pendingFrames = numFrames, ag = new AnimatedGIF({
                    'sampleInterval': sampleInterval,
                    'numWorkers': numWorkers,
                    'width': gifWidth,
                    'height': gifHeight,
                    'delay': interval
                }), text = obj.text, fontWeight = obj.fontWeight, fontSize = obj.fontSize, fontFamily = obj.fontFamily, fontColor = obj.fontColor, textAlign = obj.textAlign, textBaseline = obj.textBaseline, textXCoordinate = obj.textXCoordinate ? obj.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? gifWidth : gifWidth / 2, textYCoordinate = obj.textYCoordinate ? obj.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? gifHeight / 2 : gifHeight, font = fontWeight + ' ' + fontSize + ' ' + fontFamily, sourceX = crop ? Math.floor(crop.scaledWidth / 2) : 0, sourceWidth = crop ? videoWidth - crop.scaledWidth : 0, sourceY = crop ? Math.floor(crop.scaledHeight / 2) : 0, sourceHeight = crop ? videoHeight - crop.scaledHeight : 0, captureFrame = function () {
                    var framesLeft = pendingFrames - 1;
                    if (savedRenderingContexts.length) {
                        context.putImageData(savedRenderingContexts[numFrames - pendingFrames], 0, 0);
                    } else {
                        context.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gifWidth, gifHeight);
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
                        setTimeout(captureFrame, interval * 1000);
                    }
                    if (!pendingFrames) {
                        ag.getBase64GIF(function (image) {
                            callback({
                                'error': false,
                                'errorCode': '',
                                'errorMsg': '',
                                'image': image,
                                'cameraStream': cameraStream,
                                'videoElement': videoElement,
                                'webcamVideoElement': webcamVideoElement,
                                'savedRenderingContexts': renderingContextsToSave
                            });
                        });
                    }
                };
            numFrames = numFrames !== undefined ? numFrames : 10;
            interval = interval !== undefined ? interval : 0.1;
            // In seconds
            canvas.width = gifWidth;
            canvas.height = gifHeight;
            context = canvas.getContext('2d');
            captureFrame();
        },
        'getCropDimensions': function (obj) {
            var width = obj.videoWidth, height = obj.videoHeight, gifWidth = obj.gifWidth, gifHeight = obj.gifHeight, result = {
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
}(animatedGif);
// error.js
// ========
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
_error_ = function () {
    var error = {
            'validate': function (skipObj) {
                skipObj = utils.isObject(skipObj) ? skipObj : {};
                var errorObj = {};
                utils.each(error.validators, function (indece, currentValidator) {
                    var errorCode = currentValidator.errorCode;
                    if (!skipObj[errorCode] && !currentValidator.condition) {
                        errorObj = currentValidator;
                        errorObj.error = true;
                        return false;
                    }
                });
                delete errorObj.condition;
                return errorObj;
            },
            'isValid': function (skipObj) {
                var errorObj = error.validate(skipObj), isValid = errorObj.error !== true ? true : false;
                return isValid;
            },
            'validators': [
                {
                    'condition': utils.isFunction(utils.getUserMedia),
                    'errorCode': 'getUserMedia',
                    'errorMsg': 'The getUserMedia API is not supported in your browser'
                },
                {
                    'condition': utils.isSupported.canvas(),
                    'errorCode': 'canvas',
                    'errorMsg': 'Canvas elements are not supported in your browser'
                },
                {
                    'condition': utils.isSupported.webworkers(),
                    'errorCode': 'webworkers',
                    'errorMsg': 'The Web Workers API is not supported in your browser'
                },
                {
                    'condition': utils.isFunction(utils.URL),
                    'errorCode': 'window.URL',
                    'errorMsg': 'The window.URL API is not supported in your browser'
                },
                {
                    'condition': utils.isSupported.blob(),
                    'errorCode': 'window.Blob',
                    'errorMsg': 'The window.Blob File API is not supported in your browser'
                },
                {
                    'condition': utils.isSupported.Uint8Array(),
                    'errorCode': 'window.Uint8Array',
                    'errorMsg': 'The window.Uint8Array function constructor is not supported in your browser'
                },
                {
                    'condition': utils.isSupported.Uint32Array(),
                    'errorCode': 'window.Uint32Array',
                    'errorMsg': 'The window.Uint32Array function constructor is not supported in your browser'
                }
            ],
            'messages': {
                'videoCodecs': {
                    'errorCode': 'videocodec',
                    'errorMsg': 'The video codec you are trying to use is not supported in your browser'
                }
            }
        };
    return error;
}();
// index.js
// ========
/* Copyright  2014 Yahoo! Inc. 
* Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
*/
(function (utils, AnimatedGif, error) {
    var gifshot = {
            'utils': utils,
            '_defaultOptions': {
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
                'text': '',
                'fontWeight': 'normal',
                'fontSize': '16px',
                'fontFamily': 'sans-serif',
                'fontColor': '#FFF',
                'textAlign': 'center',
                'textBaseline': 'bottom',
                'textXCoordinate': null,
                'textYCoordinate': null,
                'progressCallback': function (captureProgress) {
                },
                'completeCallback': function () {
                },
                'saveRenderingContexts': false,
                'savedRenderingContexts': []
            },
            '_options': {},
            'createGIF': function (userOptions, callback) {
                callback = utils.isFunction(userOptions) ? userOptions : callback;
                userOptions = utils.isObject(userOptions) ? userOptions : {};
                if (!utils.isFunction(callback)) {
                    return;
                }
                var defaultOptions = gifshot._defaultOptions, options = gifshot._options = utils.mergeOptions(defaultOptions, userOptions), lastCameraStream = userOptions.cameraStream, images = options.images, existingVideo = options.video, webcamVideoElement = options.webcamVideoElement, imagesLength = images ? images.length : 0, errorObj, skipObj = {}, ag, x = -1, currentImage, tempImage, loadedImages = 0, videoType, videoSrc;
                // If the user has passed in at least one image path or image DOM elements
                if (imagesLength) {
                    skipObj = {
                        'getUserMedia': true,
                        'window.URL': true
                    };
                    errorObj = error.validate(skipObj);
                    if (errorObj.error) {
                        return callback(errorObj);
                    }
                    // change workerPath to point to where Animated_GIF.worker.js is
                    ag = new AnimatedGif(options);
                    while (++x < imagesLength) {
                        currentImage = images[x];
                        if (utils.isElement(currentImage)) {
                            currentImage.crossOrigin = 'Anonymous';
                            ag.addFrame(currentImage, currentImage.src, options);
                            loadedImages += 1;
                            if (loadedImages === imagesLength) {
                                gifshot._getBase64GIF(ag, callback);
                            }
                        } else if (utils.isString(currentImage)) {
                            tempImage = document.createElement('img');
                            tempImage.crossOrigin = 'Anonymous';
                            tempImage.onerror = function (e) {
                                // If there is an error, ignore the image
                                if (imagesLength > 0) {
                                    imagesLength -= 1;
                                }
                            };
                            tempImage.src = currentImage;
                            utils.setCSSAttr(tempImage, {
                                'position': 'fixed',
                                'opacity': '0'
                            });
                            (function (tempImage, ag, currentImage) {
                                tempImage.onload = function () {
                                    ag.addFrame(tempImage, currentImage, options);
                                    utils.removeElement(tempImage);
                                    loadedImages += 1;
                                    if (loadedImages === imagesLength) {
                                        gifshot._getBase64GIF(ag, callback);
                                    }
                                };
                            }(tempImage, ag, currentImage));
                            document.body.appendChild(tempImage);
                        }
                    }
                } else if (existingVideo) {
                    skipObj = {
                        'getUserMedia': true,
                        'window.URL': true
                    };
                    errorObj = error.validate(skipObj);
                    if (errorObj.error) {
                        return callback(errorObj);
                    }
                    if (utils.isElement(existingVideo) && existingVideo.src) {
                        videoSrc = existingVideo.src;
                        videoType = utils.getExtension(videoSrc);
                        if (!utils.isSupported.videoCodecs[videoType]) {
                            return callback(error.messages.videoCodecs);
                        }
                    } else if (utils.isArray(existingVideo)) {
                        utils.each(existingVideo, function (iterator, videoSrc) {
                            videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);
                            if (utils.isSupported.videoCodecs[videoType]) {
                                existingVideo = videoSrc;
                                return false;
                            }
                        });
                    }
                    videoStream.startStreaming({
                        'completed': function (obj) {
                            gifshot._createAndGetGIF(obj, callback);
                        },
                        'existingVideo': existingVideo
                    });
                } else {
                    if (!gifshot.isWebCamGIFSupported()) {
                        return callback(error.validate());
                    }
                    if (options.savedRenderingContexts.length) {
                        screenShot.getWebcamGif(options, function (obj) {
                            callback(obj);
                        });
                        return;
                    }
                    videoStream.startVideoStreaming(function (obj) {
                        gifshot._createAndGetGIF(obj, callback);
                    }, {
                        'lastCameraStream': lastCameraStream,
                        'callback': callback,
                        'webcamVideoElement': webcamVideoElement
                    });
                }
            },
            '_getBase64GIF': function (animatedGifInstance, callback) {
                // This is asynchronous, rendered with WebWorkers
                animatedGifInstance.getBase64GIF(function (image) {
                    callback({
                        'error': false,
                        'errorCode': '',
                        'errorMsg': '',
                        'image': image
                    });
                });
            },
            'takeSnapShot': function (obj, callback) {
                var defaultOptions = utils.mergeOptions(gifshot._defaultOptions, obj), options = utils.mergeOptions(defaultOptions, {
                        'interval': 0.1,
                        'numFrames': 1
                    });
                this.createGIF(options, callback);
            },
            'stopVideoStreaming': function (obj) {
                obj = utils.isObject(obj) ? obj : {};
                var options = utils.isObject(gifshot._options) ? gifshot._options : {}, cameraStream = obj.cameraStream, videoElement = obj.videoElement, webcamVideoElement = obj.webcamVideoElement;
                videoStream.stopVideoStreaming({
                    'cameraStream': cameraStream,
                    'videoElement': videoElement,
                    'keepCameraOn': options.keepCameraOn,
                    'webcamVideoElement': webcamVideoElement
                });
            },
            'isWebCamGIFSupported': function () {
                return error.isValid();
            },
            'isExistingVideoGIFSupported': function (codecs) {
                var isSupported = false, hasValidCodec = false;
                if (utils.isArray(codecs) && codecs.length) {
                    utils.each(codecs, function (indece, currentCodec) {
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
                return error.isValid({ 'getUserMedia': true });
            },
            'isExistingImagesGIFSupported': function () {
                return error.isValid({ 'getUserMedia': true });
            },
            '_createAndGetGIF': function (obj, callback) {
                var options = gifshot._options, numFrames = options.numFrames, interval = options.interval, wait = options.video ? 0 : interval * 10000, cameraStream = obj.cameraStream, videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight, gifWidth = options.gifWidth, gifHeight = options.gifHeight, cropDimensions = screenShot.getCropDimensions({
                        'videoWidth': videoWidth,
                        'videoHeight': videoHeight,
                        'gifHeight': gifHeight,
                        'gifWidth': gifWidth
                    }), completeCallback = callback;
                options.crop = cropDimensions;
                options.videoElement = videoElement;
                options.videoWidth = videoWidth;
                options.videoHeight = videoHeight;
                options.cameraStream = cameraStream;
                if (!utils.isElement(videoElement)) {
                    return;
                }
                videoElement.width = gifWidth + cropDimensions.width;
                videoElement.height = gifHeight + cropDimensions.height;
                if (!options.webcamVideoElement) {
                    utils.setCSSAttr(videoElement, {
                        'position': 'fixed',
                        'opacity': '0'
                    });
                    document.body.appendChild(videoElement);
                }
                // Firefox doesn't seem to obey autoplay if the element is not in the DOM when the content
                // is loaded, so we must manually trigger play after adding it, or the video will be frozen
                videoElement.play();
                setTimeout(function () {
                    screenShot.getWebcamGif(options, function (obj) {
                        gifshot.stopVideoStreaming(obj);
                        completeCallback(obj);
                    });
                }, wait);
            }
        }, publicApi = function (api) {
            var method, currentMethod, publicApi = {};
            for (method in api) {
                currentMethod = api[method];
                if (method.charAt(0) !== '_') {
                    publicApi[method] = api[method];
                }
            }
            return publicApi;
        };
    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js, and plain browser loading
    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return publicApi(gifshot);
        });
    } else if (typeof exports !== 'undefined') {
        module.exports = publicApi(gifshot);
    } else {
        window.gifshot = publicApi(gifshot);
    }
}(_utils_, animatedGif, _error_));
}(window, window.navigator, document));