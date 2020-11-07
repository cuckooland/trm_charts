const { src, dest, series, parallel, watch } = require("gulp");
const del = require("del");
const ts = require("gulp-typescript");
const tsProject = ts.createProject("src/Typescript/tsconfig.json");
const sourcemaps = require("gulp-sourcemaps");
const eslint = require("gulp-eslint");
const mocha = require("gulp-mocha");

/** 
 * Clean generated files.
 **/
const clean = series(cleanCssFiles, cleanHtmlFiles, cleanJsFiles);
clean.description = "Clean generated files.";

/** 
 * Clean generated JS files.
 **/
function cleanJsFiles() {
    return del([
        "dist/maps",
        "dist/**/*.js",
        "src/Typescript/transpiled/**/*.js",
        "!dist/js/vendor/**/*.js",
    ]);
}
cleanJsFiles.description = "Clean generated JS files.";
  
/** 
 * Clean generated CSS files.
 **/
function cleanCssFiles() {
    return del([
        "dist/**/*.css"
    ]);
}
cleanCssFiles.description = "Clean generated CSS files.";
  
/** 
 * Clean vendor lib files.
 **/
function cleanLibFiles() {
    return del([
        "dist/vendor/**/*.css"
    ]);
}
cleanLibFiles.description = "Clean vendor lib files.";
  
/** 
 * Clean generated html files.
 **/
function cleanHtmlFiles() {
    return del([
        "dist/**/*.html"
    ]);
}
cleanHtmlFiles.description = "Clean generated html files.";
  
/** 
 * Run eslint on 'src/Typescript/' files.
 **/
function tslint() {
    return src(["./src/Typescript/**/*.ts"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}
tslint.description = "Run eslint on 'src/Typescript/' files.";

/** 
 * Copy css files to 'dist/css' directory.
 **/
const processCssFiles = series(cleanCssFiles, function copyCssFiles() {
    return src(["./src/css/**/*.css"])
        .pipe(dest("dist/css"))
});
processCssFiles.description = "Copy css files to 'dist/css' directory.";

/** 
 * Copy lib files to 'dist/js/vendor' directory.
 **/
const processLibFiles = series(cleanLibFiles, function copyLibFiles() {
    return src(["./lib/**/*.js"])
        .pipe(dest("dist/js/vendor"))
});
processLibFiles.description = "Copy lib files to 'dist/js/vendor' directory.";

/** 
 * Copy html files to 'dist' directory.
 **/
const processHtmlFiles = series(cleanHtmlFiles, function copyHtmlFiles() {
    return src(["./src/web-files/**/*"])
        .pipe(dest("dist"))
});
processHtmlFiles.description = "Copy html files to 'dist' directory.";

/** 
 * Run Mocha unit testing.
 **/
function unitTesting(done) {
    src("test/mocha/*.js", {read: false})
        .pipe(mocha({reporter: "nyan"}));
    done();
}
unitTesting.description = "Run Mocha unit testing.";

/** 
 * Transpil 'src/Typescript/' files and generate sourcemaps; destination is 'dist/js'.
 **/
function transpilTsFiles() {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write("./maps", {includeContent: false, sourceRoot: "."}))
        .pipe(dest("dist/js"));
}
transpilTsFiles.description = "Transpil 'src/Typescript/' files and generate sourcemaps; destination is 'dist/js'.";

/** 
 * Transpil 'src/Typescript/' files.
 **/
const processTsFiles = series(cleanJsFiles, tslint, transpilTsFiles);
processTsFiles.description = "Transpil 'src/Typescript/' files.";

/** 
 * Call 'processTsFiles' when the content of 'src/Typescript/' is changed.
 **/
function watchTsFiles() {
    watch([
        "src/Typescript/**"
    ], 
    processTsFiles);
}
watchTsFiles.description = "Call 'processTsFiles' when the content of 'src/Typescript/' is changed.";

/** 
 * Call 'processCssFiles' when the content of 'src/css/' is changed.
 **/
function watchCssFiles() {
    watch([
        "src/css/**"
    ], 
    processCssFiles);
}
watchCssFiles.description = "Call 'processCssFiles' when the content of 'src/css/' is changed.";

/** 
 * Call 'processLibFiles' when the content of 'lib/' is changed.
 **/
function watchLibFiles() {
    watch([
        "lib/**"
    ], 
    processLibFiles);
}
watchLibFiles.description = "Call 'processLibFiles' when the content of 'src/css/' is changed.";

/** 
 * Call 'processHtmlFiles' when the content of 'lib/' is changed.
 **/
function watchHtmlFiles() {
    watch([
        "src/web-files/**"
    ], 
    processHtmlFiles);
}
watchLibFiles.description = "Call 'processHtmlFiles' when the content of 'src/web-files/' is changed.";

/** 
 * Run ts linter, generate 'dist' directory, and run Mocha unit testing.
 **/
const buildRtmInTransition = series(processTsFiles, processCssFiles, processLibFiles, processHtmlFiles, unitTesting);
buildRtmInTransition.description = "Run ts linter, generate 'dist' directory, and run Mocha unit.";

exports.clean = clean;
exports.tslint = tslint;
exports.transpilTsFiles = transpilTsFiles;
exports.processTsFiles = processTsFiles;
exports.watchSrcFiles = parallel(watchCssFiles, watchLibFiles, watchHtmlFiles, watchTsFiles);
exports.unitTesting = unitTesting;
exports.buildRtmInTransition = buildRtmInTransition;
