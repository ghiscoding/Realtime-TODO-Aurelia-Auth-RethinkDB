import {autoinject, ObserverLocator} from 'aurelia-framework';
import * as _ from 'lodash';
import * as Moment from 'moment';
import {Todo} from './todo';
import {TodoData} from './todoData';
import io from 'socket.io-client';
import { default as swal } from 'sweetalert2';

var socket = io('http://localhost:5000/todo-socket');

// value interface
interface NewTodo {
  title: string,
  dueDate: Date
  dueDateObject: Date
}

@autoinject()
export class List {
  heading: string = 'Todo management';
  editedTodo: Todo;
  allChecked: boolean = false;
  includeArchived: boolean = false;
  observerLocator: ObserverLocator;
  dataService: TodoData;
  newTodo: NewTodo;
  currentPage: number = 0;
  itemDoneCount: number = 0;
  items: Todo[];
  originalTodo: Todo;

  constructor(dataService: TodoData, observerLocator: ObserverLocator) {
    this.dataService = dataService;
    this.observerLocator = observerLocator;

    this.observerLocator.getObserver(this, 'includeArchived')
      .subscribe(() => this.getData());
  }

  activate(): Promise<void> {
    return this.getData();
  }

  async addItem() {
    try {
      let description = this.newTodo.title;
      if (!description) { return; }

      let newItem: Todo = new Todo();
      newItem.title = description.trim();
      newItem.completed = false;
      newItem.dueDate = this.newTodo.dueDateObject;

      const item = await this.dataService.create(newItem);

      // only add the post if we don't have it already in the posts list to avoid dupes
      if (!_.some(this.items, function (p) {
        return p.id === item.id;
      })) {
        this.items.unshift(item);
      }
      // blank todo input
      this.newTodo.title = '';
    } catch(error) {
      alert('Failed to save the new TODO');
    }
	}

  async getData(): Promise<void> {
    try {
      //implement spinner
      this.currentPage++;

      this.items = await this.dataService.getAll(this.includeArchived);
      this.subscribeSockets();
      this.itemDoneCount = this.items.filter(x => x.completed).length;
    } catch(error) {
      console.error(error.message);
    }
  }

  editTodo(item: Todo) {
		this.editedTodo = item;
		// Clone the original item to restore it on demand.
		this.originalTodo = item;
	}

  get markAllCompleted(): boolean {
    return this.items.filter(x => !x.completed && !x.archived).length === 0;
  }

  set markAllCompleted(newValue: boolean) {
    this.items.filter(x => !x.archived).forEach(x => x.completed = newValue );
    this.dataService.markAllCompleted(!newValue).then(data => {
      //this.itemDoneCount = data.completed ? data.count : 0;
    });
  }

  archiveAllCompleted() {
    this.dataService.archiveAllCompleted().then(data => {
      /*if(data.count > 0) {
          this.itemDoneCount = 0;
      }*/
    });
  }

  async deleteItem(item: Todo) {
    const response = await swal({
      title: `Are you sure you want to delete this TODO?`,
      text: `${item.title}`,
      type: 'question',
      animation: false,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      width: 700
    });

   if (response.value) {
     try {
        const deletedId = await this.dataService.delete(item.id);
        let pos = arrayFindObjectIndex(this.items, 'id', deletedId);
        if(pos >= 0) {
          this.items.splice(pos, 1);
        }
        swal('Deleted!', 'Your item has been deleted.', 'success');
      } catch(e) {
        swal('Oops...', 'Something went wrong!', 'error');
      }
    }
	}

  editBegin(item: Todo) {
    item.isEditing = true;
  }

  editEnd(item: Todo) {
    if(!!item) {
      item.isEditing = false;
      this.updateItem(item);
    }
  }

  dateLowerThan(date: Date): boolean {
    return Moment(date).isBefore(Moment().startOf('day'));
  }

  purge() {
    this.dataService.purgeArchiveItems().then(data => {
      console.log(data);
    }).catch(() => {
        alert('Failed to purge TODOs');
    });
  }

  toggleComplete (item: Todo): boolean {
    if(!!item) {
      item.completed = !item.completed;
      this.updateItem(item);
    }
    return true;
  }

  updateItem(item: Todo) {
    this.dataService.save(item).then(newItem => {
      this.items[this.items.indexOf(item)] = newItem;
    }).catch(() => {
        alert('Failed to update the status of this TODO');
    });
  }

  subscribeSockets() {
    // create item, only add the item if we don't have it already in the items list to avoid dupes
    socket.on('todo_create', data => {
      if (!_.some(this.items, (p) => {
        return p.id === data.id;
      })) {
        this.items.unshift(data);
      }
    });

    // update item
    socket.on('todo_update', data => {
      console.log('socket.io-client, todo update');
      let pos = arrayFindObjectIndex(this.items, 'id', data.id);
      if(pos >= 0) {
        this.items.splice(pos, 1, data);
        this.itemDoneCount = this.items.filter(x => x.completed).length;
      }
    });

    // delete item, only delete item if found in items list
    socket.on('todo_delete', data => {
      let pos = arrayFindObjectIndex(this.items, 'id', data.id);
      if(pos >= 0) {
        this.items.splice(pos, 1);
      }
    });
  }
}

/** Quick function to find an object inside an array by it's given field name and value, return the index position found or -1
 * @param Array sourceArray
 * @param string searchId: search property id
 * @param string searchValue: value to search
 * @return int index position found
 */
function arrayFindObjectIndex(sourceArray: any[], searchId: string, searchValue: any): any {
  if (!!sourceArray) {
    for (var i = 0; i < sourceArray.length; i++) {
      if (sourceArray[i][searchId] === searchValue) {
        return i;
      }
    }
  }

  return -1;
}
