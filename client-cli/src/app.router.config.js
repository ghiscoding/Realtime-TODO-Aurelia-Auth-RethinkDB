import {AuthorizeStep} from 'aurelia-auth';
import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';

@inject(Router)
export default class{

	constructor(router) {
		this.router = router;
	}

  configure() {
	  var appRouterConfig = function(config) {
	    config.title = 'Aurelia';
			config.addPipelineStep('authorize', AuthorizeStep); // Add a route filter to the authorize extensibility point.

	    config.map([
				{ route: ['','welcome'],  moduleId: './welcome',      				nav: true, 	title:'Welcome' },
	      { route: 'customer',      moduleId: './customer',       			nav: true, 	title:'CRM', 				auth:true },
				{ route: 'customer2',     moduleId: './customer2',      			nav: true, 	title:'CRM Custom', auth:true },
				{ route: 'child-router',  moduleId: './child-router', 				nav: true, 	title:'Child Router' },
	      { route: 'signup',        moduleId: './signup',       				nav: false, title:'Signup' },
				{ route: 'login',         moduleId: './login',       					nav: false, title:'Login' },
				{ route: 'logout',        moduleId: './logout',       				nav: false, title:'Logout' },
				{ route: 'profile',       moduleId: './profile',       				nav: false, title:'Profile' },
	      { route: 'contacts',      moduleId: 'modules/contacts/index', nav: true,  title: 'Contacts', 	auth: true },
	      { route: 'todo',          moduleId: 'modules/todo/index',     nav: true,  title: 'TODO', 			auth:true }
	    ]);
	  };

    this.router.configure(appRouterConfig);
	}
}
