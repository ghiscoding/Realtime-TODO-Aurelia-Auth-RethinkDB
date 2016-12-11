import {AuthService} from 'aurelia-auth';
import {inject} from 'aurelia-framework';
@inject(AuthService)

export class Profile {
	constructor(auth) {
		this.auth = auth;
		this.profile = null;
	};
	activate() {
		return this.auth.getMe()
			.then(data=>{
				this.profile = data;
			});
	}
	heading = 'Profile';

	link(provider) {
		return this.auth.authenticate(provider, true, null)
			.then(()=> this.auth.getMe())
			.then(data=>{
				this.profile = data;
			})
        .catch(err=>{
			console.log("profile failure");
		});
	}
	unlink(provider) {
		return this.auth.unlink(provider)
			.then(()=> this.auth.getMe())
			.then(data=>{
				this.profile = data;
			});
	}
	email='';
	password='';

}
