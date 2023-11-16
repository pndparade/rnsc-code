import gulp from 'gulp';

import { deleteAsync } from 'del';

import fileinclude from 'gulp-file-include';

import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import globImporter from 'node-sass-glob-importer';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cleanCSS from 'gulp-clean-css';
import rename from 'gulp-rename';

import terser from 'gulp-terser';

import imagemin from 'gulp-imagemin';

import bs from 'browser-sync';

const sass = gulpSass(dartSass);

// clean output folder
function clean() {
  return deleteAsync('build/');
}

// html
function html() {
  return gulp.src('src/pages/*.html')
    .pipe(fileinclude())
    .pipe(gulp.dest('build/'));
}

// sass to css
function styles() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass({
      includePaths: [
        'node_modules'
      ],
      importer: [
        globImporter()
      ]
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer({
        cascade: false
      })
    ]))
    .pipe(cleanCSS({
      debug: true,
      compatibility: '*'
    }, details => {
      console.log(`${details.name}: Original size:${details.stats.originalSize} - Minified size: ${details.stats.minifiedSize}`)
    }))
  .pipe(rename({suffix:'.min'}))
  .pipe(gulp.dest('build/assets/css/'));
}

// scripts
function script() {
  return gulp.src('src/js/*.js')
    .pipe(terser())
    .pipe(rename({suffix:'.min'}))
    .pipe(gulp.dest('build/assets/js/'));
}

// images
function images() {
  return gulp.src('src/images/**/*')
    .pipe(imagemin())
    .pipe(gulp.dest('build/assets/images/'));
}

// server
function runServer(done) {
  bs.init({
    server: {
      baseDir: "build",
      index: "index.html"
    },
    port: 8080,
    ui: { port: 8081 },
    open: true,
    notify: false,
    logPrefix: 'frontend_dev'
  });
  console.log('Сервер работает по адресу http://localhost:8080');
  done();
}

function reload(done) {
  bs.reload();
  done();
}

// watch files
function watchFiles() {
  gulp.watch(['src/pages/*.html', 'src/blocks/**/*.html'], gulp.series(html, reload));
  gulp.watch(['src/styles/**/*.scss', 'src/blocks/**/*.scss'], gulp.series(styles, reload));
  gulp.watch('src/images/**/*', gulp.series(images, reload));
  gulp.watch('src/js/*.js', gulp.series(script, reload));
}

// build
const build = gulp.series(
  clean,
  gulp.parallel(
    html,
    styles,
    script,
    images
  )
);

// dev
const dev = gulp.series(
  build,
  runServer,
  watchFiles
);

export { clean };
export { build };
export default dev;