import {autoinject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';

@autoinject()
export class Logout {
  authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService
  }

  activate(): void {
    this.authService.logout("#/login")
      .then(response=>{
        console.log(`ok logged out on  logout.js`);
      })
      .catch(err=>{
        console.log(`error logged out logout.js => ${err}`);
      });
	}
}
