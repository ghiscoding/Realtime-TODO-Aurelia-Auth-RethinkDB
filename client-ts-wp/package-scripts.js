const config = require("./config")
const {series, crossEnv, concurrent, rimraf} = require('nps-utils')
const {config: {port: E2E_PORT}} = require('./test/protractor.conf')
const WEB_UI_PORT = config.webUiPort;

module.exports = {
  scripts: {
    default: 'nps webpack',
    test: {
      default: 'nps test.jest',
      jest: {
        default: series(
          rimraf('test/coverage-jest'),
          'jest'
        ),
        accept: 'jest -u',
        watch: 'jest --watch',
      },
      karma: {
        default: series(
          rimraf('test/coverage-karma'),
          'karma start test/karma.conf.js'
        ),
        watch: 'karma start test/karma.conf.js --auto-watch --no-single-run',
        debug: 'karma start test/karma.conf.js --auto-watch --no-single-run --debug',
      },
      all: concurrent({
        browser: series.nps('test.karma', 'e2e'),
        jest: 'nps test.jest',
      })
    },
    e2e: {
      default: concurrent({
        webpack: `webpack-dev-server --inline --port=${E2E_PORT}`,
        protractor: 'nps e2e.whenReady',
      }) + ' --kill-others --success first',
      protractor: {
        install: 'webdriver-manager update',
        default: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js'
        ),
        debug: series(
          'nps e2e.protractor.install',
          'protractor test/protractor.conf.js --elementExplorer'
        ),
      },
      whenReady: series(
        `wait-on --timeout 120000 http-get://localhost:${E2E_PORT}/index.html`,
        'nps e2e.protractor'
      ),
    },
    build: 'nps webpack.build',
    backend: {
      default: {
        default: 'nodemon --watch ../server --inspect ../server/app.js',
      },
      noflag: 'nodemon ../server ../server/app.js'
    },
    withBackend: {
      default: concurrent({
        webpack: `nps webpack.server`,
        node: 'nps withBackend.whenReady',
      }) + ' --kill-others --success first',
      noflag: concurrent({
        webpack: `nps webpack.server`,
        node: 'nps withBackend.whenReadyNoFlag',
      }) + ' --kill-others --success first',
      whenReady: series(
        `wait-on --timeout 120000 http-get://localhost:${WEB_UI_PORT}/index.html`,
        `opn http://localhost:${WEB_UI_PORT}`,
        'nps backend'
      ),
      whenReadyNoFlag: series(
        `wait-on --timeout 120000 http-get://localhost:${WEB_UI_PORT}/index.html`,
        `opn http://localhost:${WEB_UI_PORT}`,
        'nps backend.noflag'
      ),
    },
    webpack: {
      default: 'nps webpack.server',
      build: {
        before: rimraf('dist'),
        default: 'nps webpack.build.production',
        development: {
          default: series(
            'nps webpack.build.before',
            'webpack --progress -d'
          ),
          extractCss: series(
            'nps webpack.build.before',
            'webpack --progress -d --env.extractCss'
          ),
          serve: series.nps(
            'webpack.build.development',
            'serve'
          ),
        },
        production: {
          inlineCss: series(
            'nps webpack.build.before',
            'webpack --progress -p --env.production'
          ),
          default: series(
            'nps webpack.build.before',
            'webpack --progress -p --env.production --env.extractCss'
          ),
          serve: series.nps(
            'webpack.build.production',
            'serve'
          ),
        }
      },
      server: {
        default: `webpack-dev-server -d --port=${WEB_UI_PORT} --inline --env.server`,
        extractCss: `webpack-dev-server -d --port=${WEB_UI_PORT} --inline --env.server --env.extractCss`,
        hmr: `webpack-dev-server -d --port=${WEB_UI_PORT} --inline --hot --env.server`
      },
    },
    serve: 'http-server dist --cors',
  },
}
