var chai = require('chai'),
  expect = chai.expect,
  gifshot = require('../src/gifshot'),
  gifshotUtils = gifshot.utils;

describe('gifshot', function() {
  describe('#utils', function() {
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

    it('should have a check for window.console support', function() {
      expect(gifshotUtils.isSupported.console).not.to.equal(undefined);
    });

    it('should have a check for web workers support', function() {
      expect(gifshotUtils.isSupported.webworkers).not.to.equal(undefined);
    });

    it('should have a check for Blob support', function() {
      expect(gifshotUtils.isSupported.blob).not.to.equal(undefined);
    });

    it('should have a check for 8-int Typed Arrays support', function() {
      expect(gifshotUtils.isSupported.Uint8Array).not.to.equal(undefined);
    });

    it('should have a check for 32-int Typed Arrays support', function() {
      expect(gifshotUtils.isSupported.Uint32Array).not.to.equal(undefined);
    });

    it('should have a check for videoCodecs support', function() {
      expect(gifshotUtils.isSupported.videoCodecs).not.to.equal(undefined);
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
  });

  describe('#apiMethods', function() {
    it('should have a createGIF method', function() {
      expect(gifshot.createGIF).not.to.equal(undefined);
    });

    it('should have a takeSnapShot method', function() {
      expect(gifshot.takeSnapShot).not.to.equal(undefined);
    });

    it('should have a stopVideoStreaming method', function() {
      expect(gifshot.stopVideoStreaming).not.to.equal(undefined);
    });

    it('should have an isSupported method', function() {
      expect(gifshot.isSupported).not.to.equal(undefined);
    });

    it('should have an isWebCamGIFSupported method', function() {
      expect(gifshot.isWebCamGIFSupported).not.to.equal(undefined);
    });

    it('should have an isExistingVideoGIFSupported method', function() {
      expect(gifshot.isExistingVideoGIFSupported).not.to.equal(undefined);
    });

    it('should have an isExistingImagesGIFSupported method', function() {
      expect(gifshot.isExistingImagesGIFSupported).not.to.equal(undefined);
    });
  });
});