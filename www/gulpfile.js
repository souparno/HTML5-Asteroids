var fs = require('fs');
var args = require('minimist')(process.argv.slice(2));
var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var wrap = require('gulp-wrap');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var gutil = require('gulp-util');

gulp.task('build', [ 'web']);
gulp.task('web', dist([ './platform/web' ], 'web'));

function dist(files, file, nomin) {
  return function() {
    var task = browserify({
      entries : files,
      standalone : 'Stage'
    });
    task = task.transform({
      fromString : true,
      compress : false,
      mangle : false,
      output : {
        beautify : true,
        comments : /^((?!@license)[\s\S])*$/i
      }
    }, 'uglifyify');
    task = task.bundle();
    task.on('error', function(err) {
      console.log(gutil.colors.red(err.message));
      this.emit('end');
    });
    task = task.pipe(source('stage.' + file + '.js')).pipe(buffer()); // vinylify
    task = task.pipe(wrap({
      src : 'template/dist.js'
    }, {
      version : pkg.version
    }));
    task = task.pipe(gulp.dest('dist'));
    if (!nomin) {
      task = task.pipe(rename('stage.' + file + '.min.js'));
      task = task.pipe(uglify({
        output : {
          comments : /@license/i
        }
      }));
      task = task.pipe(gulp.dest('dist'));
    }
    return task;
  };
}
