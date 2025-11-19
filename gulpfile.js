const { src, dest, watch, series } = require("gulp");
const sass = require("gulp-sass")(require("sass"));

const paths = {
	styles: {
		// які файли компілюємо (тільки "головні", без _*)
		src: ["src/scss/*.scss", "!src/scss/_*.scss"],
		// за якими файлами слідкуємо (і головні, і partial’и)
		watch: "src/scss/**/*.scss",
		dest: "assets/",
	},
};

// Компіляція SCSS → CSS
function compileSass() {
	return src(paths.styles.src)
		.pipe(sass().on("error", sass.logError))
		.pipe(dest(paths.styles.dest));
}

// Вочер
function watchSass() {
	watch(paths.styles.watch, compileSass);
}

exports.build = compileSass;
exports.default = series(compileSass, watchSass);
