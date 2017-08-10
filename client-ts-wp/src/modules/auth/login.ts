import {inject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';

@inject(AuthService)
export class Login {
	auth: AuthService;
	heading: string = 'Login';
	email: string = '';
  password: string = '';

  constructor(auth: AuthService) {
    this.auth = auth;
  }

	login(): Promise<void> {
    let creds: string = `grant_type=password&email=${this.email}&password=${this.password}`;

    return this.auth.login(this.email, this.password)
      //return this.auth.login(creds)
      .then(response => {
        console.log(`success logged ${response}`);
      })
      .catch(err => {
        err.json().then(function(e){
          console.log(`login failure : ${e.message}`);
        });
      });
	};

	authenticate(name: string): Promise<void> {
		return this.auth.authenticate(name, false, null)
      .then(response => {
        //console.log(response);
      }).catch(err=>{
        console.log(`authenticate failure in login.js => ${err}`);
      });
	}
}
