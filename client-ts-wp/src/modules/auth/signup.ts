import {autoinject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';
import { default as swal } from 'sweetalert2';

@autoinject()
export class Signup {
	heading: string = 'Sign Up';
	email: string = '';
	password: string = '';
  displayName: string = '';
  
  constructor(private auth: AuthService) {
  }

	signup(): any {
		return this.auth.signup(this.displayName, this.email, this.password)
      .then(response => {
        swal('Success...', `You're signed up`, 'success');
      }).catch(err => {
        swal('Oops...', `signup failure in signup.js => ${err}`, 'error');
      });
	}
}
