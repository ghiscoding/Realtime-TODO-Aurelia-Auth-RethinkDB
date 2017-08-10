import {autoinject, PLATFORM} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';

@autoinject()
export class Index {
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  configureRouter(config: RouterConfiguration, router: Router): void {
    config.map([
      {route: ['', 'list'], moduleId: PLATFORM.moduleName('./list'), name: 'list'},
      {route: 'edit/:id', moduleId: PLATFORM.moduleName('./edit'), name: 'edit'},
      {route: 'create', moduleId: PLATFORM.moduleName('./edit'), name: 'create'}
    ]);

    this.router = router;
  }
}
