import {inject} from "aurelia-framework";
import {HttpClient, json} from 'aurelia-fetch-client';

let baseUrl = "/api/todo";

@inject(HttpClient)
export class TodoData {
  baseUrl = 'api/todo';

  constructor(httpClient) {
    this.http = httpClient;
  }

  getById(id) {
    return this.http.fetch(`${this.baseUrl}/${id}`)
      .then(response =>  response.json());
  }

  getAll(includeArchived) {
    let url = (!!includeArchived) ? '' : 'archived';
    return this.http.fetch(`${this.baseUrl}/${url}`)
      .then(response =>  response.json());
  }

  create(todo) {
    return this.http.fetch(`${this.baseUrl}`, {
      method: 'post',
      body: json(todo)
    })
    .then(response => response.json());
  }

  delete(id) {
    return this.http.fetch(`${this.baseUrl}/${id}`, {
      method: 'delete'
    })
    .then(response => id);
  }

  save(todo) {
    if (todo.id) {
      return this.http.fetch(`${this.baseUrl}/${todo.id}`, {
        method: 'put',
        body: json(todo)
      })
      .then(response => response.json());
    }
    else {
      return this.http.fetch(`${this.baseUrl}`, {
        method: 'post',
        body: json(todo)
      })
      .then(response => response.json());
    }
  }

  archiveAllCompleted() {
    return this.http.fetch(`${this.baseUrl}/archive-all-completed`, {
      method: 'post',
      body: json(todo)
    })
    .then(response => response.json());
  }

  purgeArchiveItems() {
    return this.http.fetch(`${this.baseUrl}/purge-archived-items`, {
      method: 'post',
      body: json(todo)
    })
    .then(response => response.json());
  }

  markAllCompleted(flag) {
    return this.http.fetch(`${this.baseUrl}/mark-all-completed/${flag}`, {
      method: 'post',
      body: json(todo)
    })
    .then(response => response.json());
  }

}
