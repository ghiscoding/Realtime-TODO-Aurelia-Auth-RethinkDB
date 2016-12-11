import {inject} from 'aurelia-framework';
import {FetchConfig} from 'aurelia-auth';
import {Router} from 'aurelia-router';
import AppRouterConfig from './app.router.config';

@inject(Router, FetchConfig, AppRouterConfig)
export class App {
    constructor(router, fetchConfig, appRouterConfig) {
        this.router = router;
        this.appRouterConfig = appRouterConfig;
        this.fetchConfig = fetchConfig;
    }

    activate() {
        this.appRouterConfig.configure();
        this.fetchConfig.configure();
    }
}
