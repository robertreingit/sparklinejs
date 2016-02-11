'use strict';

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default',['minify']); 

gulp.task('minify', function() {
  return gulp.src('sparkline.js')
    .pipe(uglify())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch('**.js', ['minify']);
});
