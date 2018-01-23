const config = require("./config");
const {series, crossEnv, concurrent, open, rimraf} = require('nps-utils');
const WEB_UI_PORT = config.webUiPort;
const DEFAULT_PACKAGER = config.packager; // you can use 'npm or 'yarn'

module.exports = {
  scripts: {
    default: concurrent({
      frontend: 'nps frontend',
      openBrowser: 'nps browseWhenReady',
    }) + ' --kill-others-on-fail --success first',
    backend: {
      default: series(
        'nps backend.install',
        'nps backend.start'
      ),
      install: `cd server && ${DEFAULT_PACKAGER} install`,
      start: `cd server && ${DEFAULT_PACKAGER} run watch-server`,
      build: {
        before: rimraf('server/dist/*'),
        default: series(
          'nps backend.build.before',
          `cd server && ${DEFAULT_PACKAGER} run build-server`
        )
      },
    },
    frontend: {
      default: series(
        'nps frontend.install',
        'nps frontend.start'
      ),
      install: `cd client-ts-wp && ${DEFAULT_PACKAGER} install`,
      start: `cd client-ts-wp && ${DEFAULT_PACKAGER} start`,
      build: {
        before: rimraf('client-ts-wp/dist/*'),
        default: 'nps frontend.build.production',
        development: {
          default: series(
            'nps frontend.build.before',
            `cd client-ts-wp && ${DEFAULT_PACKAGER} start nps webpack.build.development`
          )
        },
        production: {
          default: series(
            'nps frontend.build.before',
            `cd client-ts-wp && ${DEFAULT_PACKAGER} start nps webpack.build.production`
          )
        }
      }
    },
    browseWhenReady: series(
      `wait-on --timeout 120000 http-get://localhost:${WEB_UI_PORT}/index.html`,
      // open(`http://localhost:${WEB_UI_PORT}`),
    ),
    withBackend: {
      default: concurrent({
        backend: 'nps backend',
        frontend: 'nps frontend',
        openBrowser: 'nps browseWhenReady',
      }) + ' --kill-others-on-fail --success first'
    }
  },
}
