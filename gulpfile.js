const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const config = require("./gulp.config.js");

gulp.task("browserify", function() {
	return browserify(config.source + "index.js")
		.transform("babelify", {
			presets: ['es2015'],
			plugins: ['transform-object-rest-spread', 'syntax-async-functions']
		})
		.bundle()
		.pipe(source('genetic.js'))
		.pipe(gulp.dest(config.build))
});

gulp.task("default", ["browserify"]);