import {inject} from "aurelia-framework";
import {HttpClient, json} from 'aurelia-fetch-client';

let baseUrl = "api/customers";

@inject(HttpClient)
export class CustomerData {
  constructor(httpClient) {
    this.http = httpClient;
  }

  getById(id) {
    return this.http.fetch(`${baseUrl}/${id}`)
      .then(response =>  response.json());
  }

  getAll() {
    return this.http.fetch(baseUrl)
      .then(response => response.json());
  }

  getPage(pageNumber) {
    return this.http.fetch(`${baseUrl}/${pageNumber}`)
      .then(response => response.json());
  }

  delete(customer) {
    return this.http.fetch(`${baseUrl}/${customer.id}`, {
      method: 'delete'
    })
    .then(response => response.json());
  }

  save(customer) {
    if (customer.id) {
      return this.http.fetch(`${baseUrl}/${customer.id}`, {
        method: 'put',
        body: json(customer)
      })
      .then(response => response.json());
    }
    else {
      return this.http.fetch(`${baseUrl}`, {
        method: 'post',
        body: json(customer)
      })
      .then(response => response.json());
    }
  }
}
