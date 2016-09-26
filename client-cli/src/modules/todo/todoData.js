import {inject} from "aurelia-framework";
import {HttpClient} from "aurelia-http-client";

let baseUrl = "/api/todos";

@inject(HttpClient)
export class TodoData {

  constructor(HttpClient) {
    //let headers = {Authorization: 'Bearer ' + sessionService.getCurrentToken()};
    let headers = {};
    headers['Accepts'] = 'application/json';
    headers['Content-Type'] = 'application/x-www-form-urlencoded';

    HttpClient.configure(http => {
        http.withHeader('Content-Type', 'application/json');
        http.withBaseUrl(baseUrl);
    });

    this.headers = headers;
    this.http = HttpClient;
  }

  getById(id) {
    return this.http.get(`${id}`)
      .then(response => {
        return response.content;
      });
  }

  getAll(includeArchived) {
    let url = (!!includeArchived) ? '' : 'archived';
    return this.http.get(url, {headers: this.headers})
      .then(response => {
        return response.content;
      });
  }

  create(todo) {
    var request = this.http.createRequest();
    request.asPost()
      //TODO check if withHeader still necessary
      .withHeader("Accept", "application/json")
      .withHeader("Content-Type", "application/json")
      .withContent(todo);

    return request.send().then(response => response.content);
  }

  delete(id) {
      return this.http.createRequest(`${id}`).asDelete().send().then(response => id);
  }

  save(todo) {
    var request = this.http.createRequest();
    if (todo.id) {
      request.asPut()
        .withUrl(`${todo.id}`)
        //TODO check if withHeader still necessary
        .withHeader("Accept", "application/json")
        .withHeader("Content-Type", "application/json")
        .withContent(todo);
    }
    else {
      request.asPost()
        //TODO check if withHeader still necessary
        .withHeader("Accept", "application/json")
        .withHeader("Content-Type", "application/json")
        .withContent(todo);
    }

    return request.send().then(response => response.content);
  }

  archiveAllCompleted() {
    var request = this.http.createRequest();
    request.asPost()
      .withUrl(`archive-all-completed`)
      //TODO check if withHeader still necessary
      .withHeader("Accept", "application/json")
      .withHeader("Content-Type", "application/json");

    return request.send().then(response => response.content);
  }

  purgeArchiveItems() {
    var request = this.http.createRequest();
    request.asPost()
      .withUrl(`purge-archived-items`)
      //TODO check if withHeader still necessary
      .withHeader("Accept", "application/json")
      .withHeader("Content-Type", "application/json");

    return request.send().then(response => response.content);
  }

  markAllCompleted(flag) {
    var request = this.http.createRequest();
    request.asPost()
      .withUrl(`mark-all-completed/${flag}`)
      //TODO check if withHeader still necessary
      .withHeader("Accept", "application/json")
      .withHeader("Content-Type", "application/json");

    return request.send().then(response => response.content);
  }

}
