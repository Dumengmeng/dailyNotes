const gulp = require('gulp'),
    connect = require('gulp-connect')

gulp.task('webserver', function() {
    connect.server({
        livereload: true,
        host: '192.168.1.102',
        port: 3333
    })
})

gulp.task('default', ['webserver'])