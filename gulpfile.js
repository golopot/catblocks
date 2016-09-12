var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var files = require('./loads.js')
var changed  = require( 'gulp-changed')

gulp.task('concat', function() {
  return gulp.src( files )
    .pipe(sourcemaps.init())
      .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
});

gulp.task('copy-assets', function(){
	return gulp.src( ['src/assets/*'] )
		.pipe(gulp.dest('./dist/assets'))
})

gulp.task('copy-html', function(){
	return gulp.src( 'src/*.html' )
		.pipe(gulp.dest('./dist'))
})

gulp.task('copy-lib', function(){
	return gulp.src( 'lib/*' )
		.pipe( changed('./dist') )
		.pipe( gulp.dest('./dist') )
})


gulp.task('default', ['concat', 'copy-assets', 'copy-html', 'copy-lib'] )

