import gulp from 'gulp';
import browserSync from 'browser-sync';
import historyApiFallback from 'connect-history-api-fallback/lib';
import project from '../aurelia.json';
import build from './build';
import {CLIOptions} from 'aurelia-cli';
import url from 'url';
import loadPlugin from 'gulp-load-plugins';
import proxy from 'proxy-middleware';
import nodemon from 'gulp-nodemon';

var portBackEnd = 5000;
var portFrontEnd = 4000;
var plugin = new loadPlugin({lazy: true});

var proxyOptionsAccessControl = function(req,res, next){
      res.setHeader('Access-Control-Allow-Origin', '*');
      next();
};

var proxyOptionsApiRoute = url.parse(`http://localhost:${portBackEnd}/api`);
    proxyOptionsApiRoute.route = '/api';

var proxyOptionsAuthRoute = url.parse(`http://localhost:${portBackEnd}/auth`);
    proxyOptionsAuthRoute.route = '/auth';

function log(msg) {
    plugin.util.log(plugin.util.colors.cyan(msg));
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
      port: portFrontEnd,
      notify: true,
      logLevel: 'silent',
      server: {
        baseDir: ['.'],
        middleware: [
          proxyOptionsAccessControl,
          proxy(proxyOptionsApiRoute),
          proxy(proxyOptionsAuthRoute)
        ]
      },
      socket: {
        namespace: `http://localhost:${portFrontEnd}/bs`
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

let node = function() {
    var nodeOptions = {
      execMap: {
        "js": "node --inspect --harmony"
      },
      script: './../server/app.js',
      delayTime: 1,
      watch: ["./../server/**/*", "**/*"]
    };

    nodemon(nodeOptions)
        .on('change', function () {
            log('nodemon detected change...!')
        })
        .on('restart', function () {
            log('node application is restarted!')
        })
        .on('restart', function(ev) {
            log('*** nodemon restarted');
            log('files changed on restart:\n' + ev);
            setTimeout(function() {
                browserSync.notify('reloading now ...');
                browserSync.reload({stream: false});
            }, 1000);
        })
};

let watch = function() {
  gulp.watch(project.transpiler.source, refresh).on('change', onChange);
  gulp.watch(project.markupProcessor.source, refresh).on('change', onChange);
  gulp.watch(project.cssProcessor.source, refresh).on('change', onChange);
};

let run;

if (CLIOptions.hasFlag('node') && CLIOptions.hasFlag('watch')) {
  run = gulp.series(
    serve,
    node,
    watch
  );
} else if (CLIOptions.hasFlag('node')) {
  run = gulp.series(
    node,
    serve
  );
} else if (CLIOptions.hasFlag('watch')) {
  run = gulp.series(
    serve,
    watch
  );
} else {
  run = serve;
}

export default run;
