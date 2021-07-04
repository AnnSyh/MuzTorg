const {task, src, dest, watch, parallel, series} = require('gulp');
const plumber = require(`gulp-plumber`);
const sourcemap = require(`gulp-sourcemaps`);
const sass = require(`gulp-sass`);
const postcss = require(`gulp-postcss`);
const autoprefixer = require(`autoprefixer`);
const server = require(`browser-sync`).create();
const csso = require(`gulp-csso`);
const rename = require(`gulp-rename`);
const imagemin = require(`gulp-imagemin`);
const webp = require(`gulp-webp`);
const svgstore = require(`gulp-svgstore`);
const pug = require(`gulp-pug`);
const del = require(`del`);
const webpackStream = require(`webpack-stream`);
const webpackConfig = require(`./webpack.config.js`);

task(`clean`, function () {
  return del(`build`);
});

task(`copy`, function () {
  return src([
      `source/fonts/**/*.{woff,woff2,ttf}`,
      `source/video/**`,
      `source/favicon/**`,
    ], {
      base: `source`,
    })
    .pipe(dest(`build`));
});

task(`imagemin`, function () {
  return src([
      `source/img/**/*.{png,jpg}`
    ])
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.mozjpeg({
        quality: 75,
        progressive: true
      }),
    ]))
    .pipe(dest(`build/img`));
});

task(`webp`, function () {
  return src(`source/img/content/*.{png,jpg}`)
    .pipe(webp({
      quality: 90
    }))
    .pipe(dest(`build/img/webp`));
});

task(`svgo`, function () {
  return src(`source/img/sprite/*.svg`)
    .pipe(imagemin([
      imagemin.svgo({
        plugins: [{
            removeViewBox: false
          },
          {
            removeRasterImages: true
          },
          {
            removeUselessStrokeAndFill: false
          },
        ]
      }),
    ]))
    .pipe(dest(`build/img/sprite`));
});

task(`sprite`, function () {
  return src(`build/img/sprite/*.svg`)
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename(`sprite.svg`))
    .pipe(dest(`build/img`));
});

task(`pug`, function () {
  return src(`source/pug/pages/*.pug`)
    .pipe(pug({
      pretty: true
    }))
    .pipe(dest(`build`));
});

task(`css`, function () {
  return src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer({
      grid: true,
    })]))
    .pipe(dest(`build/css`))
    .pipe(csso())
    .pipe(rename(`style.min.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(dest(`build/css`))
    .pipe(server.stream());
});

task(`script`, function () {
  return src([`source/js/main.js`])
    .pipe(webpackStream(webpackConfig))
    .pipe(dest(`build/js`));
});

task(`copysvg`, function () {
  return src(`source/img/**/*.svg`, {
      base: `source`
    })
    .pipe(dest(`build`));
});

task(`copypngjpg`, function () {
  return src(`source/img/**/*.{png,jpg,gif}`, {
      base: `source`
    })
    .pipe(dest(`build`));
});

task(`server`, function () {
  server.init({
    server: `build/`,
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  watch(`source/sass/**/*.{scss,sass}`, series(`css`));
  watch(`source/img/**/*.svg`, series(`copysvg`, `sprite`, `pug`, `refresh`));
  watch(`source/img/**/*.{png,jpg}`, series(`copypngjpg`, `pug`, `refresh`));
  watch(`source/pug/**/*.pug`, series(`pug`, `refresh`));
  watch(`source/js/**/*.js`, series(`script`, `refresh`));
});

task(`refresh`, function (done) {
  server.reload();
  done();
});

task(`build`, series(
  `clean`,
  parallel(`copy`, `imagemin`, `webp`, series(`svgo`, `sprite`), `pug`, `css`, `script`)
));

task(`start`, series(`build`, `server`));
