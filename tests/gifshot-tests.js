var chai = require('chai'),
  expect = chai.expect,
  gifshot = require('./gifshot.test'),
  gifshotUtils = gifshot.utils;

describe('gifshot', function() {

  describe('#utils', function() {

    it('should check gifshotUtils is an object', function() {
      expect(gifshotUtils).not.to.equal(undefined);
    });

    it('should check URL is undefined', function() {
      expect(gifshotUtils.URL).to.equal(undefined);
    });

    it('should check getUserMedia is undefined', function() {
      expect(gifshotUtils.getUserMedia).to.equal(undefined);
    });

    it('should check Blob is undefined', function() {
      expect(gifshotUtils.Blob).to.equal(undefined);
    });

    it('should check btoa is a function', function() {
      expect(gifshotUtils.isFunction(gifshotUtils.btoa)).to.equal(true);
    });

    it('should correctly detect objects', function() {
      var obj = {
          'test': true
        },
        func = function() {},
        arr = [],
        str = new String('test'),
        str1 = 'test',
        num = new Number(1),
        num1 = 1;


      expect(gifshotUtils.isObject(obj)).to.equal(true);
      expect(gifshotUtils.isObject(func)).to.equal(false);
      expect(gifshotUtils.isObject(arr)).to.equal(false);
      expect(gifshotUtils.isObject(str)).to.equal(false);
      expect(gifshotUtils.isObject(str1)).to.equal(false);
      expect(gifshotUtils.isObject(num)).to.equal(false);
      expect(gifshotUtils.isObject(num1)).to.equal(false);
    });

    it('should correctly detect empty objects', function() {
      var obj = {
          'test': true
        },
        obj1 = {},
        func = function() {},
        arr = [],
        str = new String('test'),
        str1 = 'test',
        num = new Number(1),
        num1 = 1;

      expect(gifshotUtils.isEmptyObject(obj1)).to.equal(true);
      expect(gifshotUtils.isEmptyObject(obj)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(func)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(arr)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(str)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(str1)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(num)).to.equal(false);
      expect(gifshotUtils.isEmptyObject(num1)).to.equal(false);
    });

    it('should correctly detect arrays', function() {
      var obj = {
          'test': true
        },
        func = function() {},
        arr = [],
        str = new String('test'),
        str1 = 'test',
        num = new Number(1),
        num1 = 1;

      expect(gifshotUtils.isArray(arr)).to.equal(true);
      expect(gifshotUtils.isArray(obj)).to.equal(false);
      expect(gifshotUtils.isArray(func)).to.equal(false);
      expect(gifshotUtils.isArray(str)).to.equal(false);
      expect(gifshotUtils.isArray(str1)).to.equal(false);
      expect(gifshotUtils.isArray(num)).to.equal(false);
      expect(gifshotUtils.isArray(num1)).to.equal(false);
    });

    it('should correctly detect functions', function() {
      var obj = {
          'test': true
        },
        func = function() {},
        arr = [],
        str = new String('test'),
        str1 = 'test',
        num = new Number(1),
        num1 = 1;

      expect(gifshotUtils.isFunction(func)).to.equal(true);
      expect(gifshotUtils.isFunction(arr)).to.equal(false);
      expect(gifshotUtils.isFunction(obj)).to.equal(false);
      expect(gifshotUtils.isFunction(str)).to.equal(false);
      expect(gifshotUtils.isFunction(str1)).to.equal(false);
      expect(gifshotUtils.isFunction(num)).to.equal(false);
      expect(gifshotUtils.isFunction(num1)).to.equal(false);
    });

    it('should correctly detect strings', function() {
      expect(gifshotUtils.isElement({})).to.equal(false);
    });

    it('should correctly detect strings', function() {
      var obj = {
          'test': true
        },
        func = function() {},
        arr = [],
        str = new String('test'),
        str1 = 'test',
        num = new Number(1),
        num1 = 1;

      expect(gifshotUtils.isString(str)).to.equal(true);
      expect(gifshotUtils.isString(str1)).to.equal(true);
      expect(gifshotUtils.isString(func)).to.equal(false);
      expect(gifshotUtils.isString(arr)).to.equal(false);
      expect(gifshotUtils.isString(obj)).to.equal(false);
      expect(gifshotUtils.isString(num)).to.equal(false);
      expect(gifshotUtils.isString(num1)).to.equal(false);
    });

    it('should have a check for canvas support', function() {
      expect(gifshotUtils.isSupported.canvas).not.to.equal(undefined);
    });

    it('should have a check for web workers support', function() {
      expect(gifshotUtils.isSupported.webworkers).not.to.equal(undefined);
    });

    it('should have a check for Blob support', function() {
      expect(gifshotUtils.isSupported.blob).not.to.equal(undefined);
    });

    it('should have a check for 8-int Typed Arrays support', function() {
      expect(gifshotUtils.isSupported.Uint8Array).not.to.equal(undefined);
      expect(gifshotUtils.isSupported.Uint8Array()).to.equal(undefined);
    });

    it('should have a check for 32-int Typed Arrays support', function() {
      expect(gifshotUtils.isSupported.Uint32Array).not.to.equal(undefined);
      expect(gifshotUtils.isSupported.Uint32Array()).to.equal(undefined);
    });

    it('should have a check for videoCodecs support', function() {
      expect(gifshotUtils.isSupported.videoCodecs).not.to.equal(undefined);
    });

    it('should return an empty function for noop', function() {
      expect(gifshotUtils.isFunction(gifshotUtils.noop)).to.equal(true);
    });

    it('should correctly iterate arrays and objects with the each method', function() {
      var arr = ['test', 'testing'],
        arrCount = 0,
        obj = {
          'test': 'hmm',
          'testing': 'check'
        },
        objCount = 0;

      gifshotUtils.each(arr, function() {
        arrCount += 1;
      });

      gifshotUtils.each(obj, function() {
        objCount += 1;
      });

      expect(arrCount).to.equal(2);
      expect(objCount).to.equal(2);
    });

    it('should correctly merge objects together', function() {
      var defaultOptions = {
          'test': 'testing',
          'nestedTest': {
            'test': 'blah'
          }
        },
        userOptions = {
          'nestedTest': {
            'test': 'this is a test'
          }
        },
        mergedOptions = gifshotUtils.mergeOptions(defaultOptions, userOptions);

      expect(mergedOptions.test).to.equal('testing');
      expect(mergedOptions.nestedTest.test).to.equal('this is a test');
    });

    it('should test the progress callback', function() {
      expect(gifshot.defaultOptions.progressCallback()).to.equal(undefined);
      expect(gifshot.defaultOptions.completeCallback()).to.equal(undefined);
    });

    it('should set css attributes', function() {
      expect(gifshotUtils.setCSSAttr()).to.equal(undefined);
    });

    it('should remove an element', function() {
      expect(gifshotUtils.removeElement()).to.equal(undefined);
    });

    it('should create a web worker', function() {
      expect(gifshotUtils.isEmptyObject(gifshotUtils.createWebWorker())).to.equal(true);
    });

    it('should get file extension', function() {
      expect(gifshotUtils.getExtension("test.gif")).to.equal("gif");
    });

    it('should resize text', function() {
      expect(gifshotUtils.getFontSize("test", 200, 18, 20)).to.equal(undefined);
    });


  });

  describe('#apiMethods', function() {

    describe('#createGIF', function() {
      it('should have a createGIF method', function() {
        expect(gifshot.createGIF).not.to.equal(undefined);
      });

      it('should correctly return the provided callback function', function() {
        gifshot.createGIF({}, function(obj) {
          expect(gifshotUtils.isObject(obj)).to.equal(true);
          expect(obj.error).to.equal(true);
        });
      });

    });

    describe('#takeSnapShot', function() {
      it('should have a takeSnapShot method', function() {
        expect(gifshot.takeSnapShot).not.to.equal(undefined);
      });

      it('should correctly return the provided callback function', function() {
        gifshot.takeSnapShot({}, function(obj) {
          expect(gifshotUtils.isObject(obj)).to.equal(true);
          expect(obj.error).to.equal(true);
        });
      });

    });

    describe('#stopVideoStreaming', function() {
      it('should have a stopVideoStreaming method', function() {
        expect(gifshot.stopVideoStreaming).not.to.equal(undefined);
      });
    });

    describe('#isSupported', function() {
      it('should have an isSupported method', function() {
        expect(gifshot.isSupported).not.to.equal(undefined);
      });

      it('should call isSupported', function() {
        expect(gifshot.isSupported()).not.to.equal(undefined);
      });

    });

    describe('#isWebCamGIFSupported', function() {
      it('should have an isWebCamGIFSupported method', function() {
        expect(gifshot.isWebCamGIFSupported).not.to.equal(undefined);
      });

      it('should call isWebCamGIFSupported', function() {
        expect(gifshot.isWebCamGIFSupported()).not.to.equal(undefined);
      });
    });

    describe('#isExistingVideoGIFSupported', function() {
      it('should have an isExistingVideoGIFSupported method', function() {
        expect(gifshot.isExistingVideoGIFSupported).not.to.equal(undefined);
      });

      it('should call isExistingVideoGIFSupported', function() {
        expect(gifshot.isExistingVideoGIFSupported()).not.to.equal(undefined);
      });

    });


    describe('#isExistingImagesGIFSupported', function() {
      it('should have an isExistingImagesGIFSupported method', function() {
        expect(gifshot.isExistingImagesGIFSupported).not.to.equal(undefined);
      });

      it('should call isExistingImagesGIFSupported', function() {
        expect(gifshot.isExistingImagesGIFSupported()).not.to.equal(undefined);
      });
    });

  });

  describe('#error', function() {
    var error = gifshot.error;

    it('should check the error object', function() {
      expect(gifshotUtils.isObject(error.validate())).to.equal(true);
    });

    it('should check is valid', function() {
      expect(error.isValid()).to.equal(false);
    });

    it('should check is valid', function() {
      expect(error.isValid({
        'getUserMedia': true,
        'canvas': true
      })).to.equal(false);
    });

  });

});