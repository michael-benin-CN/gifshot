/*
  gifshot Build File
*/

var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  jshint = require('gulp-jshint'),
  requirejs = require('requirejs'),
  amdclean = require('amdclean'),
  fs = require('fs'),
  packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
  licenseText = '/*' + fs.readFileSync('./LICENSE.txt', 'utf8') + '\n*/\n',
  insert = require('gulp-insert'),
  modulesToRemove = [],
  customBuild = {
    'webcam': {
      'modulesToRemove': [
        'isExistingImagesGIFSupported',
        'isExistingVideoGIFSupported',
        'existingImages',
        'existingVideo'
      ]
    },
    'image': {
      'modulesToRemove': [
        'isWebCamGIFSupported',
        'isExistingVideoGIFSupported',
        'stopVideoStreaming',
        'existingVideo',
        'existingWebcam'
      ]
    },
    'video': {
      'modulesToRemove': [
        'isExistingImagesGIFSupported',
        'isWebCamGIFSupported',
        'stopVideoStreaming',
        'existingImages',
        'existingWebcam'
      ]
    }
  },
  getCustomBuildModules = function() {
    var args = [];

    process.argv.forEach(function(arg, iterator) {
      if (arg.charAt(0) === '-' && arg.charAt(1) === '-') {
        args.push(arg.substring(2, arg.length));
      }
    });

    return args;
  };

gulp.task('minify', function() {
  gulp.src(['src/gifshot.js'])
    .pipe(uglify())
    .pipe(rename('gifshot.min.js'))
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest('build/'));
});

gulp.task('add-unminified-file-to-build', function() {
  gulp.src(['src/gifshot.js'])
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest('build/'));
});

gulp.task('add-custom-build-to-build', function() {
  gulp.src(['src/gifshot.js'])
    .pipe(rename('gifshot.custom.js'))
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest('build/custom/'))
    .pipe(uglify())
    .pipe(rename('gifshot.custom.min.js'))
    .pipe(gulp.dest('build/custom/'))
});

gulp.task('lint', function() {
  gulp.src('src/gifshot.js')
    .pipe(jshint({
      'loopfunc': true
    }))
    .pipe(jshint.reporter('default'));
});

gulp.task('clean', function() {
  requirejs.optimize({
    'findNestedDependencies': true,
    'baseUrl': 'src/modules/',
    'preserveLicenseComments': false,
    'optimize': 'none',
    'skipModuleInsertion': true,
    'include': ['index'],
    'out': 'src/gifshot.js',
    'onModuleBundleComplete': function(data) {
      var outputFile = data.path;
      fs.writeFileSync(outputFile, amdclean.clean({
        'filePath': outputFile,
        // Will not transform conditional AMD checks - Libraries use this to provide optional AMD support
        'transformAMDChecks': false,
        // Wraps the library in an IIFE (Immediately Invoked Function Expression)
        'wrap': {
          'start': ';(function(window, document, navigator, undefined) {\n',
          'end': '\n}(this || {}, typeof document !== "undefined" ? document : { createElement: function() {} }, this.navigator || {}));'
        },
        'aggressiveOptimizations': true,
        'createAnonymousAMDModule': true,
        'removeModules': modulesToRemove,
        'prefixTransform': function(moduleName) {
          return moduleName.substring(moduleName.indexOf('_') + 1, moduleName.length);
        },
        'escodegen': {
          'comment': false
        }
      }));
    }
  }, function() {
    // Successfully built
  }, function(err) {
    console.log(err);
  });
});

gulp.task('test-clean', function() {
  requirejs.optimize({
    'findNestedDependencies': true,
    'baseUrl': 'src/modules/',
    'preserveLicenseComments': false,
    'optimize': 'none',
    'skipModuleInsertion': true,
    'include': ['index'],
    'out': 'tests/gifshot.js',
    'onModuleBundleComplete': function(data) {
      var outputFile = data.path;
      fs.writeFileSync(outputFile, amdclean.clean({
        'filePath': outputFile,
        // Will not transform conditional AMD checks - Libraries use this to provide optional AMD support
        'transformAMDChecks': false,
        // Wraps the library in an IIFE (Immediately Invoked Function Expression)
        'wrap': {
          'start': ';(function(window, document, navigator, undefined) {\n',
          'end': '\n}(this || {}, typeof document !== "undefined" ? document : { createElement: function() {} }, this.navigator || {}));'
        },
        'aggressiveOptimizations': true,
        'createAnonymousAMDModule': true,
        'removeModules': [
          'gifWriter',
          'NeuQuant',
          'AnimatedGIF',
          'createAndGetGIF',
          'existingImages',
          'existingVideo',
          'getBase64GIF',
          'processFrameWorker',
          'screenShot',
          'videoStream'
        ],
        'prefixTransform': function(moduleName) {
          return moduleName.substring(moduleName.indexOf('_') + 1, moduleName.length);
        },
        'escodegen': {
          'comment': false
        }
      }));
    }
  }, function() {
    // Successfully built
  }, function(err) {
    console.log(err);
  });
});

gulp.task('test', function (cb) {
  gulp.src('tests/gifshot.js')
    .pipe(istanbul()) // Covering files
    .on('finish', function () {
      gulp.src('tests/gifshot-tests.js')
        .pipe(mocha({
          reporter: 'nyan'
        }))
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .on('end', cb);
    });
});

gulp.task('custom-build', function() {
  var customBuildModules = getCustomBuildModules();

  customBuildModules.forEach(function(currentModule) {
    if (customBuild[currentModule] && customBuild[currentModule].modulesToRemove) {
      customBuild[currentModule].modulesToRemove.forEach(function(currentModule) {
        modulesToRemove.push(currentModule);
      });
    } else {
      modulesToRemove.push(currentModule);
    }
  });

  gulp.start('default-custom-build');
});

// The default task (called when you run `gulp`)
gulp.task('default', ['clean', 'test-clean', 'lint', 'test', 'minify', 'add-unminified-file-to-build']);

// The default task for custom builds
gulp.task('default-custom-build', ['clean', 'test-clean', 'minify', 'add-custom-build-to-build']);

// The watch task
gulp.task('watch', function() {
  gulp.watch('src/modules/**/*.js', function(event) {
    gulp.start('default');
  });
});