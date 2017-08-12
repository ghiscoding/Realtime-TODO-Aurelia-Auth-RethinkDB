/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
//import '../static/styles.css';
import 'font-awesome/css/font-awesome.css';
import 'nprogress/nprogress.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-social/bootstrap-social.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'styles/styles.scss';
import 'styles/bootstrap.scss';
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import authConfig from './modules/auth/authConfig';
const BACKEND_SERVER_PORT: number = 5000;

// Bootstrap 4 requires Popper.js, and because of what the create of Popper.js wrote:
// "You have to manually assign Popper to window.Popper since Bootstrap isn't importing the dependency but just checking for its existence in window"
// more info here: https://stackoverflow.com/questions/45645971/bootstrap-4-beta-importing-popper-js-with-webpack-3-x-throws-popper-is-not-a-con
import Popper from 'popper.js';
(<any>window).Popper = Popper;
require('bootstrap'); // has to be a require for Bootstrap to see window.Popper

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
//Bluebird.config({ warnings: { wForgottenReturn: false } });
Bluebird.config({ warnings: false });

export async function configure(aurelia: Aurelia) {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .developmentLogging();

    aurelia.use.plugin(PLATFORM.moduleName('aurelia-auth/auth-filter'));
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-auth'), baseConfig => {
    	baseConfig.configure(authConfig);
    });

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  await aurelia.start();
  await aurelia.setRoot(PLATFORM.moduleName('app'));
}
