export class App {
  configureRouter(config, router) {
    config.title = 'Aurelia';
    config.map([
      { route: ['', 'welcome'], name: 'home',     moduleId: 'welcome',                nav: true, title: 'Welcome' },
      { route: 'contacts',      name: 'contacts', moduleId: 'modules/contacts/index', nav: true,  title: 'Contacts' },
      { route: 'todo',          name: 'TODO',     moduleId: 'modules/todo/index',     nav: true,  title: 'TODO' }
    ]);

    this.router = router;
  }
}
