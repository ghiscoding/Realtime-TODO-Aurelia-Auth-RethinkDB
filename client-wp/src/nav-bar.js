import {bindable } from 'aurelia-framework';
import {inject} from 'aurelia-framework';
import {AuthService} from 'aurelia-auth';
import {BindingEngine} from 'aurelia-framework';

@inject(AuthService, BindingEngine)
export class NavBar {
    _isAuthenticated = false;
    displayName = "";
    @bindable router = null;
    subscription = {};
    constructor(auth, bindingEngine) {
        this.auth = auth;
        this.bindingEngine = bindingEngine;
        this._isAuthenticated = this.auth.isAuthenticated();
        this.subscription = bindingEngine.propertyObserver(this, 'isAuthenticated')
            .subscribe((newValue, oldValue) => {
                if (this.isAuthenticated) {
                    this.auth.getMe().then(data => {
                      localStorage.setItem('authProfile', JSON.stringify(data));
                      return this.displayName = data.displayName;
                    });
                }
            });
    }

    get isAuthenticated() {
        if(this.auth.isAuthenticated()) {
          let authProfile = localStorage.getItem('authProfile');
          this.displayName = (typeof authProfile === "string") ? JSON.parse(authProfile).displayName : "";
        }
        return this.auth.isAuthenticated();
    }

    deactivate() {
        this.subscription.dispose();
    }

}
