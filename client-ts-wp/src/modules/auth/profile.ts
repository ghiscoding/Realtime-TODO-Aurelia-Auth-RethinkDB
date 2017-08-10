import {autoinject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';

@autoinject()
export class Profile {
  auth: AuthService;
  email: string = '';
  password: string = '';
  heading: string = 'Profile';
  profile: any;

  constructor(auth: AuthService) {
    this.auth = auth;
  }

	activate(): any {
    console.log('active me')
		return this.auth.getMe()
      .then(data => {
        this.profile = data;
      }).catch(err=>{
        console.log(`activate failure in profile.js => ${err}`);
      });
	}

	link(provider): any {
    return this.auth.authenticate(provider, true, null)
      /*.then((response)=>{
      console.log("auth response " + response);
      return this.auth.getMe();
      })*/
      .then(() => this.auth.getMe())
      .then(data => {
        this.profile = data;
      }).catch(err=>{
        console.log(`link failure in profile.js => ${err}`);
      });
	}
	unlink(provider): any {
		return this.auth.unlink(provider)
      /*.then((response)=>{
        console.log(`auth response ${response}`);
        return this.auth.getMe();
      })*/
      .then(() => this.auth.getMe())
      .then(data => {
        this.profile = data;
      }).catch(err=>{
        console.log(`unlink failure in profile.js => ${err}`);
      });
	}

}
