export class AuthenticatedFilterValueConverter {
  toView(routes, isAuthenticated) {
    console.log(routes);
    if(!routes) return;
    return routes.filter(r => r.config.auth === undefined || r.config.auth === isAuthenticated);
  }
}
