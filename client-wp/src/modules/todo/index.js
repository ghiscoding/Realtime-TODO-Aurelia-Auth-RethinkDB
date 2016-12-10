export class Index {
  configureRouter(config, router) {
    config.map([
      {route: ['', 'list'], moduleId: './list', name: 'list'},
      {route: 'create', moduleId: './edit', name: 'create'}
    ]);

    this.router = router;
  }

}
