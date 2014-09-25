// animatedGIF.js
// ==============

// Inspired from https://github.com/sole/Animated_GIF/blob/master/src/Animated_GIF.js

/* Copyright  2014 Yahoo Inc.
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */

define([
  'core/utils',
  'core/processFrameWorker',
  'dependencies/NeuQuant',
  'dependencies/gifWriter'
], function(utils, frameWorkerCode, NeuQuant, GifWriter) {
  var AnimatedGIF = function(options) {
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
    'initializeWebWorkers': function(options) {
      var processFrameWorkerCode = NeuQuant.toString() + '(' + frameWorkerCode.toString() + '());',
        webWorkerObj,
        objectUrl,
        webWorker,
        numWorkers,
        x = -1,
        workerError = '';

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
          utils.webWorkerError = !!(webWorkerObj);
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
    'getWorker': function() {
      return this.availableWorkers.pop();
    },
    // Restores a worker to the pool
    'freeWorker': function(worker) {
      this.availableWorkers.push(worker);
    },
    'byteMap': (function() {
      var byteMap = [];
      for (var i = 0; i < 256; i++) {
        byteMap[i] = String.fromCharCode(i);
      }
      return byteMap;
    }()),
    'bufferToString': function(buffer) {
      var numberValues = buffer.length,
        str = '',
        x = -1;

      while (++x < numberValues) {
        str += this.byteMap[buffer[x]];
      }

      return str;
    },
    'onFrameFinished': function() {
      // The GIF is not written until we're done with all the frames
      // because they might not be processed in the same order
      var self = this,
        frames = this.frames,
        allDone = frames.every(function(frame) {
          return !frame.beingProcessed && frame.done;
        });

      this.numRenderedFrames++;
      this.onRenderProgressCallback(this.numRenderedFrames * 0.75 / frames.length);

      if (allDone) {
        if (!this.generatingGIF) {
          this.generateGIF(frames, this.onRenderCompleteCallback);
        }
      } else {
        setTimeout(function() {
          self.processNextFrame();
        }, 1);
      }

    },
    'processFrame': function(position) {
      var AnimatedGifContext = this,
        options = this.options,
        sampleInterval = options.sampleInterval,
        frames = this.frames,
        frame,
        worker,
        done = function(ev) {
          var data = ev.data;

          // Delete original data, and free memory
          delete(frame.data);

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
      frame.gifshot = true;

      worker = this.getWorker();

      if (worker) {
        // Process the frame in a web worker
        worker.onmessage = done;
        worker.postMessage(frame);
      } else {
        // Process the frame in the current thread
        done({
          'data': AnimatedGifContext.workerMethods.run(frame)
        });
      }
    },
    'startRendering': function(completeCallback) {
      this.onRenderCompleteCallback = completeCallback;

      for (var i = 0; i < this.options.numWorkers && i < this.frames.length; i++) {
        this.processFrame(i);
      }
    },
    'processNextFrame': function() {
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
    'generateGIF': function(frames, callback) {
      // TODO: Weird: using a simple JS array instead of a typed array,
      // the files are WAY smaller o_o. Patches/explanations welcome!
      var buffer = [], // new Uint8Array(width * height * frames.length * 5);
        gifOptions = {
          'loop': this.repeat
        },
        options = this.options,
        height = options.height,
        width = options.width,
        gifWriter = new GifWriter(buffer, width, height, gifOptions),
        onRenderProgressCallback = this.onRenderProgressCallback,
        delay = options.delay,
        bufferToString,
        gif;

      this.generatingGIF = true;

      utils.each(frames, function(iterator, frame) {
        var framePalette = frame.palette;

        onRenderProgressCallback(0.75 + 0.25 * frame.position * 1.0 / frames.length);

        gifWriter.addFrame(0, 0, width, height, frame.pixels, {
          palette: framePalette,
          delay: delay
        });
      });

      gifWriter.end();

      onRenderProgressCallback(1.0);

      this.frames = [];

      this.generatingGIF = false;

      if (utils.isFunction(callback)) {
        bufferToString = this.bufferToString(buffer);
        gif = 'data:image/gif;base64,' + utils.btoa(bufferToString);
        callback(gif);
      }
    },
    // From GIF: 0 = loop forever, null = not looping, n > 0 = loop n times and stop
    'setRepeat': function(r) {
      this.repeat = r;
    },
    'addFrame': function(element, src, gifshotOptions) {
      gifshotOptions = utils.isObject(gifshotOptions) ? gifshotOptions : {};

      var self = this,
        ctx = this.ctx,
        options = this.options,
        width = options.width,
        height = options.height,
        imageData,
        gifHeight = gifshotOptions.gifHeight,
        gifWidth = gifshotOptions.gifWidth,
        text = gifshotOptions.text,
        fontWeight = gifshotOptions.fontWeight,
        fontSize = utils.getFontSize(gifshotOptions.text, gifshotOptions.gifWidth, 22, 10), //gifshotOptions.fontSize,
        fontFamily = gifshotOptions.fontFamily,
        fontColor = gifshotOptions.fontColor,
        textAlign = gifshotOptions.textAlign,
        textBaseline = gifshotOptions.textBaseline,
        textXCoordinate = gifshotOptions.textXCoordinate ? gifshotOptions.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? width : width / 2,
        textYCoordinate = gifshotOptions.textYCoordinate ? gifshotOptions.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? height / 2 : height,
        font = fontWeight + ' ' + fontSize + ' ' + fontFamily;

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
    'addFrameImageData': function(imageData) {
      var frames = this.frames,
        imageDataArray = imageData.data;

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
    'onRenderProgress': function(callback) {
      this.onRenderProgressCallback = callback;
    },
    'isRendering': function() {
      return this.generatingGIF;
    },
    'getBase64GIF': function(completeCallback) {
      var self = this,
        onRenderComplete = function(gif) {
          self.destroyWorkers();
          setTimeout(function() {
            completeCallback(gif);
          }, 0);
        };

      this.startRendering(onRenderComplete);
    },
    'destroyWorkers': function() {
      if (this.workerError) {
        return;
      }

      var workers = this.workers;

      // Explicitly ask web workers to die so they are explicitly GC'ed
      utils.each(workers, function(iterator, workerObj) {
        var worker = workerObj.worker,
          objectUrl = workerObj.objectUrl;

        worker.terminate();
        utils.URL.revokeObjectURL(objectUrl);
      });
    }
  };
  return AnimatedGIF;
});