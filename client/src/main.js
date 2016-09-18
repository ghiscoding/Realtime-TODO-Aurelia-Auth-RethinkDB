/*eslint-disable no-var,no-unused-vars*/
var Promise = require('bluebird').config({longStackTraces: false, warnings: false}); // Promise polyfill for IE11

import { bootstrap } from 'aurelia-bootstrapper-webpack';
import AuthService from './AuthService';

import 'bootstrap';

bootstrap(function(aurelia) {
  aurelia.use
    .standardConfiguration()
    .developmentLogging()
    .feature('resources');

    aurelia.start().then(() => {
      var auth = aurelia.container.get(AuthService);
      //let root = auth.isAuthenticated() ? 'app' : 'login';
      let root = 'app'; // to use Login credentials, uncomment previous line of code and make sure to have a valid user
      aurelia.setRoot(root, document.body);
    });
});
