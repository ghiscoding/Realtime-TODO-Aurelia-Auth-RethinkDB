import {Aurelia, autoinject, PLATFORM} from 'aurelia-framework';
import {AuthorizeStep, FetchConfig} from 'aurelia-auth';
import {Router, RouterConfiguration} from 'aurelia-router';
import AppRouterConfig from './app-router-config';

@autoinject()
export class App {
  fetchConfig: FetchConfig;
  router: Router;
  appRouterConfig: AppRouterConfig;

  constructor(appRouterConfig: AppRouterConfig, router: Router, fetchConfig: FetchConfig) {
    this.appRouterConfig = appRouterConfig;
    this.router = router;
    this.fetchConfig = fetchConfig;
  }

  activate() {
    this.appRouterConfig.configure();
    this.fetchConfig.configure();
  }
}
