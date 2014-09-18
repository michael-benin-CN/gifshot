/*
  gifshot Build File
*/
var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  mocha = require('gulp-mocha'),
  jshint = require('gulp-jshint'),
  requirejs = require('requirejs'),
  amdclean = require('amdclean'),
  fs = require('fs'),
  packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8')),
  licenseText = '/*' + fs.readFileSync('./LICENSE.txt', 'utf8') + '\n*/\n',
  insert = require('gulp-insert');

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
        'aggressiveOptimizations': false,
        'createAnonymousAMDModule': true
      }));
    }
  }, function() {
    // Successfully built
  }, function(err) {
    console.log(err);
  });
});

gulp.task('test', function() {
  return gulp.src('tests/gifshot-tests.js', {
      read: false
    })
    .pipe(mocha({
      reporter: 'nyan'
    }));
});

// The default task (called when you run `gulp`)
gulp.task('default', ['clean', 'lint', 'test', 'minify', 'add-unminified-file-to-build']);

// The watch task
gulp.task('watch', function() {
  gulp.watch('src/modules/**/*.js', function(event) {
    gulp.start('default');
  });
});