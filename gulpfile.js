'use strict';

const BUILD_OUTPUT_PATH = './build';
const SRC_PATH = './src';

const gulp = require('gulp');
const del = require('del');
const postcss = require('gulp-postcss');
const cssimport = require('gulp-cssimport');
const cssnext = require('postcss-cssnext');
const cssnano = require('cssnano');
const connect = require('gulp-connect');

gulp.task('clean', () => {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del([BUILD_OUTPUT_PATH]);
});

gulp.task('dev-site', () => {
  return gulp.src([
    `!${SRC_PATH}/**/*.css`,
    `${SRC_PATH}/**/*`
  ])
  .pipe(gulp.dest(BUILD_OUTPUT_PATH));
});

gulp.task('watch', () => {
  gulp.watch(SRC_PATH + '/**/*', gulp.series('build'));
});

gulp.task('server', () => {
  connect.server({
    port: 8888,
    root: SRC_PATH
  });
});

gulp.task('css-next', () => {
  const browserSupport = ['last 2 versions'];
  const processors = [
    cssnext({browsers: browserSupport, warnForDuplicates: false}),
    cssnano()
  ];

  return gulp.src(SRC_PATH + '/**/*.css')
  .pipe(cssimport({}))
  .pipe(postcss(processors))
  .pipe(gulp.dest(BUILD_OUTPUT_PATH));
});

gulp.task('build', gulp.series('clean', 'dev-site', 'css-next'));

gulp.task('dev', gulp.series('server', 'watch'));

gulp.task('default', gulp.series('dev'));
