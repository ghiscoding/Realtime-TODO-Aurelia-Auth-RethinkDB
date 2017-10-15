import {inject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';
import { default as swal } from 'sweetalert2';

@inject(AuthService)
export class Login {
	heading: string = 'Login';
	email: string = '';
  password: string = '';

  constructor(private auth: AuthService) {
  }

	login(): Promise<void> {
    let creds: string = `grant_type=password&email=${this.email}&password=${this.password}`;

    return this.auth.login(this.email, this.password)
      //return this.auth.login(creds)
      .then(response => {
        console.log(`success logged ${response}`);
      })
      .catch(err => {
        err.json().then(e => {
          swal('Oops...', e.message, 'error');
        });
      });
	};

	authenticate(name: string): Promise<void> {
		return this.auth.authenticate(name, false, null)
      .then(response => {
        //console.log(response);
      }).catch(err => {
        swal('Oops...', `authenticate failure in login.js => ${err}`, 'error');
      });
	}
}
