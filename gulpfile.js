const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const config = require("./gulp.config.js");

gulp.task("browserify", function() {
	return browserify(config.source + "index.js")
		.transform("babelify", {
			presets: ['es2015'],
			plugins: ['syntax-async-functions']
		})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulp.dest(config.build))
});

gulp.task("default", ["browserify"]);