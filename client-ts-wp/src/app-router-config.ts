import {AuthorizeStep} from 'aurelia-auth';
import {autoinject, PLATFORM} from 'aurelia-framework';
import {Router, RouterConfiguration} from 'aurelia-router';

@autoinject()
export default class {
  router: Router;

	constructor(router: Router) {
		this.router = router;
	}

  configure() {
	  let appRouterConfig: any = function(config: RouterConfiguration): void {
	    config.title = 'Aurelia';
			config.addPipelineStep('authorize', AuthorizeStep); // Add a route filter to the authorize extensibility point.

	    config.map([
        { route: ['', 'welcome'], name: 'welcome',      moduleId: PLATFORM.moduleName('./welcome'),                 nav: true,  title: 'Welcome' },
        { route: 'child-router',  name: 'child-router', moduleId: PLATFORM.moduleName('./child-router'),            nav: true,  title: 'Child Router' },
        { route: 'customers',     name: 'customers',    moduleId: PLATFORM.moduleName('./modules/customers/index'), nav: true, 	title:'CRM', 				auth:true },
        { route: 'login',         name: 'login',        moduleId: PLATFORM.moduleName('./modules/auth/login'),      nav: false, title:'Login' },
        { route: 'logout',        name: 'logout',       moduleId: PLATFORM.moduleName('./modules/auth/logout'),     nav: false, title:'Logout' },
        { route: 'profile',       name: 'profile',      moduleId: PLATFORM.moduleName('./modules/auth/profile'),    nav: false, title:'Profile' },
        { route: 'signup',        name: 'signup',       moduleId: PLATFORM.moduleName('./modules/auth/signup'),     nav: false, title:'Signup' },
        { route: 'contacts',      name: 'contacts',     moduleId: PLATFORM.moduleName('./modules/contacts/index'),  nav: true,  title: 'Contacts', 	auth: true },
        { route: 'todo',          name: 'todo',         moduleId: PLATFORM.moduleName('./modules/todo/index'),      nav: true,  title: 'TODO', 			auth:true }
      ]);
	  };

    this.router.configure(appRouterConfig);
	}
}
