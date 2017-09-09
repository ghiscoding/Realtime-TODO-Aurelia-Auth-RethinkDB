import {autoinject} from 'aurelia-framework';
import {Customer} from './customer';
import {CustomerData} from './customerData';
import {Router} from 'aurelia-router';
import { default as swal } from 'sweetalert2';

@autoinject()
export class Edit {
  dataService: CustomerData;
  router: Router;
  customer: Customer;
  original: Customer;
  isEditing: boolean = false;

  constructor(dataService: CustomerData, router: Router) {
    this.dataService = dataService;
    this.router = router;
  }

  cancel(): Promise<Customer> {
    return this._loadCustomer(this.customer.id);
  }

  goBack(): void {
    window.history.back();
  }

  activate(params: any) {
    this.original = null;
    this.customer = null;

    if (params.id) {
      this.isEditing = true;
      return this._loadCustomer(params.id);
    }
  }

  _loadCustomer(id: number) {
    return this.dataService.getById(id)
        .then(customer => this.customer = customer);
  };

  get isUnchanged() {
    return this.areEqual(this.customer, this.original);
  }

  save() {
    this.dataService.save(this.customer)
      .then(customer => {
        this.original = customer;
        this.router.navigate("list");
      });
  };

  delete() {
    let self = this;

    swal({
      title: `Are you sure you want to delete this customer?`,
      text: `${this.customer.firstName} ${this.customer.lastName}`,
      type: 'question',
      animation: false,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      width: 750
    }).then(function () {
      self.dataService.delete(self.customer)
        .then(customer => {
          self.original = customer;
          self.router.navigate("list");
        }).catch(function() {
          swal('Oops...', 'Something went wrong!', 'error');
      });
      swal('Deleted!', 'Your customer has been deleted.', 'success');
    });
  };

  areEqual(obj1: object | null, obj2: object | null): boolean {
    if(obj1 && !obj2) {
      return false;
    } else if(!obj1 && !obj2) {
      return true;
    }
    return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && (obj1[key] === obj2[key]));
  }
}
