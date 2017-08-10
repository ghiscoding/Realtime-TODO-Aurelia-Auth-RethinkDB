import {autoinject} from 'aurelia-framework';
import {Todo} from './todo';
import {HttpClient, json} from 'aurelia-fetch-client';

let baseUrl = "/api/todo";

@autoinject()
export class TodoData {
  baseUrl = 'api/todo';
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getById(id: number): Promise<Todo> {
    return this.http.fetch(`${this.baseUrl}/${id}`)
      .then(response =>  response.json());
  }

  getAll(includeArchived: boolean): Promise<Todo[]> {
    let url = (!!includeArchived) ? '' : 'archived';
    return this.http.fetch(`${this.baseUrl}/${url}`)
      .then(response =>  response.json());
  }

  create(todo: Todo): Promise<Todo> {
    return this.http.fetch(`${this.baseUrl}`, {
      method: 'post',
      body: json(todo)
    })
    .then(response => response.json());
  }

  delete(id: number): Promise<number> {
    return this.http.fetch(`${this.baseUrl}/${id}`, {
      method: 'delete'
    })
    .then(response => id);
  }

  save(todo: Todo): Promise<Todo> {
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

  archiveAllCompleted(): Promise<Todo[]> {
    return this.http.fetch(`${this.baseUrl}/archive-all-completed`, {
      method: 'post',
      body: null
    })
    .then(response => response.json());
  }

  purgeArchiveItems(): Promise<Todo[]> {
    return this.http.fetch(`${this.baseUrl}/purge-archived-items`, {
      method: 'post',
      body: null
    })
    .then(response => response.json());
  }

  markAllCompleted(flag: boolean): Promise<Todo[]> {
    return this.http.fetch(`${this.baseUrl}/mark-all-completed/${flag}`, {
      method: 'post',
      body: null
    })
    .then(response => response.json());
  }

}
