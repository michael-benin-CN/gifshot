/*
  gifshot Build File
*/

// Third-party dependencies
var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  insert = require('gulp-insert'),
  rename = require('gulp-rename'),
  mocha = require('gulp-mocha'),
  istanbul = require('gulp-istanbul'),
  jshint = require('gulp-jshint'),
  rimraf = require('gulp-rimraf'),
  _ = require('lodash'),
  rjs = require('requirejs'),
  amdclean = require('amdclean'),
  // end of Third-party dependencies
  fs = require('fs'),
  // The package.json object
  packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
  // The license text from LICENSE.text
  licenseText = '/*' + fs.readFileSync('./LICENSE.txt', 'utf8') + '\n*/\n',
  // Configurations for different dependencies
  configs = {
    'rjs': {
      'findNestedDependencies': true,
      'baseUrl': 'src/modules/',
      'preserveLicenseComments': false,
      'optimize': 'none',
      'skipModuleInsertion': true,
      'include': ['index']
    },
    'amdclean': {
      // Will not transform conditional AMD checks - Libraries use this to provide optional AMD support
      'transformAMDChecks': false,
      'aggressiveOptimizations': true,
      'createAnonymousAMDModule': true,
      'prefixTransform': function(moduleName) {
        return moduleName.substring(moduleName.indexOf('_') + 1, moduleName.length);
      },
      // Wraps the library in an IIFE (Immediately Invoked Function Expression)
      'wrap': {
        'start': ';(function(window, document, navigator, undefined) {\n',
        'end': '\n}(typeof window !== "undefined" ? window : {}, typeof document !== "undefined" ? document : { createElement: function() {} }, typeof window !== "undefined" ? window.navigator : {}));'
      },
      'escodegen': {
        'comment': false
      }
    },
    'jshint': {
      'loopfunc': true
    }
  },
  // Which gifshot modules to remove for each custom build
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
        'existingWebcam',
        'videoStream'
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
  // Get's all of the command line arguments that start with a --
  getCommandLineArguments = function() {
    var args = [];

    process.argv.forEach(function(arg, iterator) {
      if (arg.charAt(0) === '-' && arg.charAt(1) === '-') {
        args.push(arg.substring(2, arg.length));
      }
    });

    return args;
  };

// Task that uses the Require.js optimizer to concatenate all of the gifshot
// AMD modules into a single source file
gulp.task('concat', function(cb) {
  console.log('is concat called');
  var outputFile = 'src/gifshot.js',
    rjsOptions = _.merge(_.clone(configs.rjs), {
      'out': outputFile
    });

  rjs.optimize(rjsOptions, function() {
    var amdcleanOptions = _.merge(_.clone(configs.amdclean), {
      'filePath': outputFile
    });

    fs.writeFileSync(outputFile, amdclean.clean(amdcleanOptions));
    cb(); // finished task
  }, function(err) {
    return cb(err); // return error
  });
});

// JSHint task that checks src/gifshot.js
gulp.task('lint', ['concat'], function() {
  gulp.src('src/gifshot.js')
    .pipe(jshint({
      'loopfunc': true
    }))
    .pipe(jshint.reporter('default'));
});

// Task that creates a customized gifshot.js file (only including modules that are testable)
// and runs the Mocha unit tests and Instanbul test coverage
gulp.task('test', ['concat', 'lint'], function(cb) {
  var outputFile = 'tests/gifshot.test.js',
    rjsOptions = _.merge(_.clone(configs.rjs), {
      'out': outputFile
    });

  rjs.optimize(rjsOptions, function() {
    var amdcleanOptions = _.merge(_.clone(configs.amdclean), {
      'filePath': outputFile,
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
      ]
    });

    fs.writeFileSync(outputFile, amdclean.clean(amdcleanOptions));

    gulp.src(outputFile)
      .pipe(istanbul()) // Covering files
    .on('finish', function() {
      gulp.src('tests/gifshot-tests.js')
        .pipe(mocha({
          reporter: 'nyan'
        }))
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
      .on('end', cb); // finished task
    });
  }, function(err) {
    return cb(err); // return error
  });
});

// Copies src/gifshot.js to build/gifshot.js and demo/gifshot.js
gulp.task('copy', ['concat', 'lint', 'test'], function() {
  gulp.src(['src/gifshot.js'])
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest('build'))
    .pipe(gulp.dest('demo'))
});

// Uglify.js task that minifies build/gifshot.js and adds gifshot.min.js to the build folder
gulp.task('minify', ['concat', 'lint', 'test', 'copy'], function() {
  gulp.src(['src/gifshot.js'])
    .pipe(uglify())
    .pipe(rename('gifshot.min.js'))
    .pipe(insert.prepend(licenseText))
    .pipe(gulp.dest('build'));
});

// Cleanup task that removes certain temporary files
gulp.task('cleanup', ['concat', 'lint', 'test', 'copy', 'minify'], function() {
  gulp.src(['src/gifshot.js', 'tests/gifshot.test.js'], {
    read: false
  })
    .pipe(rimraf());
});

// Task that creates the custom gifshot build and adds it to the custom/build directory
gulp.task('custom-build', function() {
  var customBuildModules = getCommandLineArguments(),
    modulesToRemove = [],
    outputFile = 'build/custom/gifshot.custom.js',
    rjsOptions;

  // If no custom builds are specified, default to the webcam custom build
  if (!customBuildModules.length) {
    customBuildModules.push('webcam');
  }

  // Find all of the modules to remove
  customBuildModules.forEach(function(currentModule) {
    // If the custom build paramater is an existing custom build, remove all associated files
    if (customBuild[currentModule] && customBuild[currentModule].modulesToRemove) {
      customBuild[currentModule].modulesToRemove.forEach(function(currentModule) {
        modulesToRemove.push(currentModule);
      });
    } else {
      // Removes the associated module
      modulesToRemove.push(currentModule);
    }
  });

  rjsOptions = _.merge(_.clone(configs.rjs), {
    'out': outputFile
  });

  rjs.optimize(rjsOptions, function() {
    var amdcleanOptions = _.merge(_.clone(configs.amdclean), {
      'filePath': outputFile,
      'removeModules': modulesToRemove
    });

    fs.writeFileSync(outputFile, amdclean.clean(amdcleanOptions));

    gulp.src(outputFile)
      .pipe(insert.prepend(licenseText))
      .pipe(gulp.dest('demo'))
      .pipe(uglify())
      .pipe(rename('gifshot.custom.min.js'))
      .pipe(insert.prepend(licenseText))
      .pipe(gulp.dest('build/custom'));

    cb(); // finished task
  }, function(err) {
    return cb(err); // return error
  });
});

// The default build task (called when you run `gulp`)
gulp.task('default', ['concat', 'lint', 'test', 'copy', 'minify', 'cleanup']);

// The watch task that runs the default task on any gifshot module file changes
gulp.task('watch', function() {
  var watcher = gulp.watch('src/modules/**/*.js', ['default']);

  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});