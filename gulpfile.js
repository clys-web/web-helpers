const {src, dest, series} = require('gulp');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const through2 = require('through2');
const del = require('del');
const {spawn} = require('child_process');
const fs = require('fs');
const isWin = process.platform === 'win32';
const spawnOptions = {};
if (isWin) {
  spawnOptions.shell = true;
}

const runCmd = (cmd, param, options = {}) => {
  return new Promise((resolve, reject) => {
    let cmdProcess = spawn(cmd, param, {...spawnOptions, ...options});
    cmdProcess.stdout.on('data', function (data) {
      process.stdout.write(data)
    });
    cmdProcess.stderr.on('data', function (data) {
      process.stderr.write(data)
    });

    cmdProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  })
};

const types = () =>
  src(['src/types/**'])
    // .pipe(babel({
    //   presets: ['@babel/env'],
    //   plugins: ['@babel/plugin-proposal-class-properties']
    // }))
    // .pipe(uglify())
    .pipe(dest('dist/types'));

const compile = () =>
  src(['src/**', '!src/types/**'])
    .pipe(babel({
      presets: ['@babel/env'],
      plugins: ['@babel/plugin-proposal-class-properties']
    }))
    // .pipe(uglify())
    .pipe(dest('dist'));

const webpack = async (cb) => {
  await runCmd('npx', ['webpack', "--mode=production"]);
  cb();
};

const package_js_ver = (cb) => {
  let json = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  let ver = json.version.split('.');
  let f = Number(ver.pop()) + 1;
  json.version = `${ver.join('.')}.${f}`;
  fs.writeFileSync('package.json', JSON.stringify(json, null, 2));
  cb();
};

const package_js = () =>
  src('package.json')
    .pipe(through2.obj(function (file, _, cb) {
      if (file.isBuffer()) {
        let packageJson = JSON.parse(file.contents.toString());
        let pushOption = packageJson['pushOption'] || {};
        const getVal = (k) => pushOption[k] || packageJson[k];
        let keywords = (getVal('keywords') || []);
        let json = {
          name: getVal('name'),
          description: getVal('description') || "",
          version: getVal('version') || "1.0.0",
          license: getVal('license') || "UNLICENSED",
          main: getVal('main'),
          typings: getVal('typings'),
          dependencies: getVal('dependencies'),
          keywords
        };
        const publishConfig = getVal('publishConfig');
        if (publishConfig) {
          json.publishConfig = publishConfig;
        }
        file.contents = Buffer.from(JSON.stringify(json, null, 2))
      }
      cb(null, file);
    }))
    .pipe(dest('dist'));

const del_dist = (cb) => del(['dist'], cb);

const publish = async (cb) => {
  await runCmd('npm', ['publish'], {cwd: './dist'});
  cb();
};

const build = series(del_dist, package_js_ver, package_js, compile, types);

exports.publish = series(build, publish);
exports.build = build;
exports.default = build;
