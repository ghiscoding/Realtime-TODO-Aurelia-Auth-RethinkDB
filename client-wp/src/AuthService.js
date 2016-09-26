import config from './config';
import {inject, Aurelia} from 'aurelia-framework';
import {HttpClient} from "aurelia-http-client";

@inject(Aurelia, HttpClient)
export default class AuthService {
  session = null;

  constructor(Aurelia, HttpClient) {

    HttpClient.configure(http => {
      http.withHeader('Content-Type', 'application/json');
      http.withBaseUrl(config.apiBaseUrl);
    });

    this.http = HttpClient;
    this.app = Aurelia;

    this.session = JSON.parse(localStorage[config.tokenName] || null);
  }

  /**
   * The login function needs to abstract away all of the details about how we track and expose
   * login information. A more advanced app might want the login function to pass back a promise
   * so it can perform additional tasks on login, but we keep things simple here.
   */
  login(username, password) {
    this.http
        .post(config.loginUrl, { username, password })
        .then((response) => response.content)
        .then((session) => {
          localStorage[config.tokenName] = JSON.stringify(session);
          this.session = session;
          this.app.setRoot('app');
        });
  }

  /**
   * The logout function reverses the actions of the login function.
   * It is less common for the logout to be async, but logout could also return a promise if there were a need.
   */
  logout() {
    console.log('logout()');
    localStorage[config.tokenName] = null;
    this.session = null;
    this.app.setRoot('login');
  }

  /**
   * A basic method for exposing information to other modules
   */
  isAuthenticated() {
    return this.session !== null;
  }

  can(permission) {
    return true; // why not?
  }
}
