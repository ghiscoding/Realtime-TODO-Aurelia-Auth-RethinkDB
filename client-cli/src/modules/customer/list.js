import _ from 'lodash';
import {inject} from 'aurelia-framework';
import {CustomerData} from "./customerData";
import {Router} from "aurelia-router";

@inject(CustomerData, Router)
export class List {
  heading = 'Customer management';

  customers = [];

  constructor(data, router) {
    this.service = data;
    this.currentPage = 0;
    this.router = router;
  };

  activate() {
    this.getData();
  }

  gotoCustomer(customer){
    this.router.navigateToRoute('edit', { id: customer.id })
  };

  new() {
    this.router.navigateToRoute('create');
  };

  getData() {
    this.currentPage++;
    return this.service.getAll()
      .then(customers => this.customers = customers );

  }
}
