import {autoinject, ObserverLocator} from 'aurelia-framework';
import * as _ from 'lodash';
import {Todo} from './todo';
import {TodoData} from './todoData';
import io from 'socket.io-client';
import { default as swal } from 'sweetalert2';

var socket = io('http://localhost:5000/todo-socket');

@autoinject()
export class List {
  heading: string = 'Todo management';
  editedTodo: Todo;
  allChecked: boolean = false;
  includeArchived: boolean = false;
  observerLocator: ObserverLocator;
  dataService: TodoData;
  newTodoDescription: string;
  currentPage: number = 0;
  itemDoneCount: number = 0;
  newTodoTitle: string = '';
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

  addItem(): void {
    let description = this.newTodoDescription;
    if (!description) { return; }

    let newItem: Todo = new Todo();
    newItem.title = description.trim();
    newItem.completed = false;

    this.dataService.create(newItem).then(item => {
      item = (typeof item === 'string') ? JSON.parse(item) : item;

      // only add the post if we don't have it already in the posts list to avoid dupes
      if (!_.some(this.items, function (p) {
        return p.id === item.id;
      })) {
        this.items.unshift(item);
      }
      // blank todo input
      this.newTodoDescription = '';
    }).catch((error) => {
        alert('Failed to save the new TODO');
    });
	}

  getData(): Promise<void> {
    //implement spinner
    this.currentPage++;

    return this.dataService.getAll(this.includeArchived)
      .then(allItems => {
        this.items = (typeof allItems === 'string') ? JSON.parse(allItems) : allItems;
        this.subscribeSockets();
        this.itemDoneCount = this.items.filter(x => x.completed).length;
      })
      .catch(function(err) {
        console.error(err.message);
      });
  }

  editTodo (item: Todo): void {
		this.editedTodo = item;
		// Clone the original item to restore it on demand.
		this.originalTodo = item;
	}

  get markAllCompleted (): boolean {
    return this.items.filter(x => !x.completed && !x.archived).length === 0;
	}
  set markAllCompleted(newValue: boolean) {
    this.items.filter(x => !x.archived).forEach(x => x.completed = newValue );
    this.dataService.markAllCompleted(!newValue).then(data => {
      //this.itemDoneCount = data.completed ? data.count : 0;
    });
  }

  archiveAllCompleted (): void {
    this.dataService.archiveAllCompleted().then(data => {
      /*if(data.count > 0) {
          this.itemDoneCount = 0;
      }*/
    });
  }

  deleteItem (item: Todo): void {
    swal({
      title: `Are you sure you want to delete this TODO?`,
      text: `${item.title}`,
      type: 'question',
      animation: false,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      width: 700
    }).then(() => {
      this.dataService.delete(item.id).then(deletedId => {
        let pos = arrayFindObjectIndex(this.items, 'id', deletedId);
        if(pos >= 0) {
          this.items.splice(pos, 1);
        }
      }).catch(function() {
          swal('Oops...', 'Something went wrong!', 'error');
      });
      swal('Deleted!', 'Your item has been deleted.', 'success');
    });
	}

  editBegin(item: Todo): void {
    item.isEditing = true;
  }

  editEnd(item: Todo): void {
    if(!!item) {
      item.isEditing = false;
      this.updateItem(item);
    }
  }

  purge(): void {
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

  subscribeSockets(): void {
    // create item, only add the item if we don't have it already in the items list to avoid dupes
    socket.on('todo_create', data => {
      if (!_.some(this.items, function (p) {
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
