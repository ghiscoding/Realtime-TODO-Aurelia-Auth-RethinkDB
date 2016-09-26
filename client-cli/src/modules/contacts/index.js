import {inject} from 'aurelia-framework';
import {WebAPI} from './web-api';

@inject(WebAPI)
export class Index {
  constructor(api) {
    this.api = api;
  }

  configureRouter(config, router) {
    config.title = 'Contacts';
    config.map([
      { route: '',            moduleId: './no-selection',   title: 'Select'},
      { route: 'detail/:id',  moduleId: './contact-detail', name:'detail' }
    ]);

    this.router = router;
  }

}
