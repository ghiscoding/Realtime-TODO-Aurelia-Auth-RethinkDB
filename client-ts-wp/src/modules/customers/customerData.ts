import {autoinject} from 'aurelia-framework';
import {Customer} from './customer';
import {HttpClient, json} from 'aurelia-fetch-client';

let baseUrl: string = 'api/customers';

@autoinject()
export class CustomerData {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getById(id: number): Promise<Customer> {
    return this.http.fetch(`${baseUrl}/${id}`)
      .then(response =>  response.json());
  }

  getAll(): Promise<Customer[]> {
    return this.http.fetch(baseUrl)
      .then(response => response.json());
  }

  getPage(pageNumber: number): Promise<Customer> {
    return this.http.fetch(`${baseUrl}/${pageNumber}`)
      .then(response => response.json());
  }

  delete(customer: Customer): Promise<Customer> {
    return this.http.fetch(`${baseUrl}/${customer.id}`, {
      method: 'delete'
    })
    .then(response => response.json());
  }

  save(customer: Customer): Promise<Customer> {
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
