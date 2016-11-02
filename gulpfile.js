const gulp = require('gulp')
const del = require('del')
const sass = require('gulp-ruby-sass')
const rename = require('gulp-rename')
const cleanCss = require('gulp-clean-css')
const concat = require('gulp-concat')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')

gulp.task('clean', cb => {
  return del(['dist'], cb)
})

gulp.task('sass', () => {
  return sass('src/*.scss', {
    style: 'expanded'
  })
  .on('error', sass.logError)
  .pipe(autoprefixer({
    browsers: ['> 1%', 'iOS >= 7', 'Android >= 4.1']
  }))
  .pipe(gulp.dest('dist'))
  .pipe(cleanCss())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist'))
})

gulp.task('script', () => {
  return gulp.src([
    'src/util.js',
    // 'src/backdrop.js',
    'src/dropwizard.js'
  ])
  .pipe(babel())
  .pipe(gulp.dest('dist'))
  .pipe(uglify())
  .pipe(rename({ suffix: '.min' }))
  .pipe(gulp.dest('dist'))
})

gulp.task('watch', () => {
  gulp.watch('src/*.scss', ['sass'])
  gulp.watch('src/*.js', ['script'])
})

gulp.task('default', ['sass', 'script'])
