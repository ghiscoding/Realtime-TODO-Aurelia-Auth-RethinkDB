import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed} from './messages';

@inject(WebAPI, EventAggregator)
export class ContactList {
  constructor(api, ea){
    this.api = api;
    this.contacts = [];

    ea.subscribe(ContactViewed, msg => {
      this.select(msg.contact)
    });
    ea.subscribe(ContactUpdated, msg => {
      let id = msg.contact.id;
      let found = this.contacts.find(x => x.id == id);
      Object.assign(found, msg.contact);
    });
  }

  created(){
    this.api.getContactList().then(contacts => this.contacts = contacts).catch(err => console.log(err));
  }

  select(contact){
    this.selectedId = contact.id;
    return true;
  }
}
