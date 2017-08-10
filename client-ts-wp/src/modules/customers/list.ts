import * as _ from 'lodash';
import {autoinject} from 'aurelia-framework';
import {Customer} from './customer';
import {CustomerData} from './customerData';
import {Router} from 'aurelia-router';

@autoinject()
export class List {
  heading: string = 'Customer management';
  customers: Customer[];
  service: CustomerData;
  currentPage: number = 0;
  router: Router;

  constructor(customerData: CustomerData, router: Router) {
    this.service = customerData;
    this.router = router;
  }

  activate(): void {
    this.getData();
  }

  gotoCustomer(customer: Customer): void {
    this.router.navigateToRoute('edit', { id: customer.id })
  };

  new(): void {
    this.router.navigateToRoute('create');
  };

  getData(): Promise<Customer[]> {
    this.currentPage++;
    return this.service.getAll()
      .then(customers => this.customers = customers );

  }
}
