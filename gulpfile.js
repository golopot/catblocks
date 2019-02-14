const gulp = require('gulp')
const merge = require('merge-stream')
const zip = require('gulp-zip')

gulp.task('assets', () => merge(
  gulp
    .src(['src/images/*'])
    .pipe(gulp.dest('./dist/images')),
  gulp
    .src(['src/assets/*.jpg', 'src/assets/*.obj'])
    .pipe(zip('assets.zip'))
    .pipe(gulp.dest('./dist/assets'))
))

gulp.task('html', () => gulp.src('src/*.html')
  .pipe(gulp.dest('./dist')))


gulp.task('default', ['assets', 'html'])

gulp.task('watch', ['assets', 'html'], () => {
  gulp.watch('./src/**/*', ['assets', 'html'])
})
