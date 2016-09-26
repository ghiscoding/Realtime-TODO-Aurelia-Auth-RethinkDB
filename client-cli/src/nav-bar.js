import {inject, bindable} from 'aurelia-framework';
//import AuthService from './AuthService';

//@inject(AuthService)
export class NavBar {
  @bindable router = null;

  constructor() {
      //this.auth = AuthService;
  }
}
