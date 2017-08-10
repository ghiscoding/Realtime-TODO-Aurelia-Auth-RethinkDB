import {inject, bindable, BindingEngine, PropertyObserver} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {AuthService} from 'aurelia-auth';

@inject(AuthService, BindingEngine)
export class NavBar {
  @bindable router: Router;
  _isAuthenticated: boolean = false;
  displayName: string = '';
  subscription: { dispose: () => void };
  auth: AuthService;
  bindingEngine: BindingEngine;

  constructor(auth: AuthService, bindingEnding: BindingEngine) {
    this.auth = auth;
    this.bindingEngine = bindingEnding;
    this._isAuthenticated = this.auth.isAuthenticated();
    this.subscription = this.bindingEngine.propertyObserver(this, 'isAuthenticated')
      .subscribe((newValue, oldValue) => {
        if (this.isAuthenticated) {
          this.auth.getMe().then(data => {
            localStorage.setItem('authProfile', JSON.stringify(data));
            return this.displayName = data.displayName;
          });
        }
      });
  }

  get isAuthenticated(): boolean {
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
