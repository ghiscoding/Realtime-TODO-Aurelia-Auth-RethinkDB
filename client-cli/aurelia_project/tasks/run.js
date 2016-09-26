import gulp from 'gulp';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback/lib';
import project from '../aurelia.json';
import build from './build';
import {CLIOptions} from 'aurelia-cli';
import url from 'url';
import proxy from 'proxy-middleware';

var portApi = 4081;
var portWeb = 4080;

var proxyOptions = url.parse(`http://localhost:${portApi}/api`);
    proxyOptions.route = '/api';

function log(message) {
  console.log(message); //eslint-disable-line no-console
}

function onChange(path) {
  log(`File Changed: ${path}`);
}

function reload(done) {
  browserSync.reload();
  done();
}

let serve = gulp.series(
  build,
  done => {
    browserSync({
      online: false,
      open: false,
      port: portWeb,
      notify: true,
      logLevel: 'silent',
      server: {
        baseDir: ['.'],
        middleware: [
          proxy(proxyOptions), function(req, res, next) {
          next();
        },
        historyApiFallback(), function(req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }
      ]
      }
    }, function(err, bs) {
      let urls = bs.options.get('urls').toJS();
      log(`Application Available At: ${urls.local}`);
      log(`BrowserSync Available At: ${urls.ui}`);
      done();
    });
  }
);

let refresh = gulp.series(
  build,
  reload
);

let watch = function() {
  gulp.watch(project.transpiler.source, refresh).on('change', onChange);
  gulp.watch(project.markupProcessor.source, refresh).on('change', onChange);
  gulp.watch(project.cssProcessor.source, refresh).on('change', onChange);
};

let run;

if (CLIOptions.hasFlag('watch')) {
  run = gulp.series(
    serve,
    watch
  );
} else {
  run = serve;
}

export default run;
