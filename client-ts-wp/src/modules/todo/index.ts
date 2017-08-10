import {autoinject, PLATFORM} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';
import './todo.scss';

@autoinject()
export class Index {
  router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.map([
      {route: ['', 'list'], moduleId: PLATFORM.moduleName('./list'), name: 'list'},
      //{route: 'create', moduleId: PLATFORM.moduleName('./edit'), name: 'create'}
    ]);

    this.router = router;
  }
}
