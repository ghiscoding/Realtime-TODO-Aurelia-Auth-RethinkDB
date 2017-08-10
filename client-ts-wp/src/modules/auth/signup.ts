import {autoinject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';

@autoinject()
export class Signup {
  auth: AuthService;
	heading: string = 'Sign Up';
	email: string = '';
	password: string = '';
	displayName: string = '';

	signup(): any {
		return this.auth.signup(this.displayName, this.email, this.password)
      .then(response => {
        console.log('signed up');
      }).catch(err=>{
        console.log(`signup failure in signup.js => ${err}`);
      });
	}
}
