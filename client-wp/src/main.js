import 'bootstrap';
import 'tether';
import authConfig from './modules/auth/authConfig';
import environment from './environment';
import { bootstrap } from 'aurelia-bootstrapper-webpack';

//Configure Bluebird Promises.
//Note: You may want to use environment-specific configuration.
Promise.config({
  warnings: {
    wForgottenReturn: false
  }
});

bootstrap(function(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature('resources')
    .plugin('aurelia-auth', (baseConfig)=> {
    	baseConfig.configure(authConfig);
    });

    if (environment.debug) {
      aurelia.use.developmentLogging();
    }

    if (environment.testing) {
      //aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(() => {
      aurelia.setRoot('app', document.body);
    });
});
