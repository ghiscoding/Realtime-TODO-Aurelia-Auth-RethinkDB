import {inject} from "aurelia-framework";
import {CustomerData} from "./customerData";
import {Router} from "aurelia-router";
import { default as swal } from 'sweetalert2';
//import {Validation} from "aurelia-validation";

@inject(CustomerData, Router)
export class Edit {

  constructor(data, router) {
    this.data = data;
    this.router = router;
    this.isEditing = false;
  }

  cancel() {
    return this._loadCustomer(this.customer.id);
  }

  goBack() {
    window.history.back();
  }

  activate(params) {
    this.original = {};
    this.customer = {};

    if (params.id) {
      this.isEditing = true;
      return this._loadCustomer(params.id);
    }
  }

  _loadCustomer(id) {
    return this.data.getById(id)
        .then(customer => this.customer = customer);
  };

  get isUnchanged() {
    return this.areEqual(this.customer, this.original);
  }

  save() {
    this.data.save(this.customer)
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
      self.data.delete(self.customer)
        .then(customer => {
          self.original = customer;
          self.router.navigate("list");
        }).catch(function() {
          swal('Oops...', 'Something went wrong!', 'error');
      });
      swal('Deleted!', 'Your customer has been deleted.', 'success');
    });
  };

  areEqual(obj1, obj2) {
    return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key) && (obj1[key] === obj2[key]));
  }
}
