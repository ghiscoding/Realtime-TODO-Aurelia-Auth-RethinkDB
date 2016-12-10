import {inject, ObserverLocator} from 'aurelia-framework';
import _ from 'lodash';
import {TodoData} from "./todoData";
import io from 'socket.io-client';

var socket = io('http://localhost:5000/todo-socket');

@inject(TodoData, ObserverLocator)
export class List {
  heading = 'Todo management';
  editedTodo = {};
  allChecked = false;
  items = [];

  constructor(data, observerLocator) {
    this.service = data;
    this.currentPage = 0;
    this.itemDoneCount = 0;
    this.newTodoTitle = '';
    this.items = [];

    this.includeArchived = false;
    observerLocator.getObserver(this, 'includeArchived')
      .subscribe(() => this.getData());
  }

  activate() {
    return this.getData();
  }

  addItem () {
    var description = this.newTodoDescription;
    if (!description) { return; }

		let newItem = {
        title: description.trim(),
        completed: false
    };

    this.service.create(newItem).then(item => {
      item = (typeof item === "string") ? JSON.parse(item) : item;

      // only add the post if we don't have it already in the posts list to avoid dupes
      if (!_.some(this.items, function (p) {
        return p.id === item.id;
      })) {
        this.items.unshift(data);
      }
      // blank todo input
      this.newTodoDescription = '';
    }).catch((error) => {
        alert("Failed to save the new TODO");
    });
	}

  getData() {
    //implement spinner
    this.currentPage++;

    return this.service.getAll(this.includeArchived)
      .then(allItems => {
        this.items = (typeof allItems === "string") ? JSON.parse(allItems) : allItems;
        this.subscribeSockets();
        this.itemDoneCount = this.items.filter(x => x.completed).length;
      })
      .catch(function(err) {
        console.error(err.message);
      });
  }

  editTodo (item) {
		this.editedTodo = item;
		// Clone the original item to restore it on demand.
		this.originalTodo = item;
	}

  get markAllCompleted () {
    return this.items.filter(x => !x.completed && !x.archived).length === 0;
	}
  set markAllCompleted(newValue) {
    this.items.filter(x => !x.archived).forEach(x => x.completed = newValue );
    this.service.markAllCompleted(!newValue).then(data => {
      this.itemDoneCount = data.completed ? data.count : 0;
    });
  }

  archiveAllCompleted () {
    this.service.archiveAllCompleted().then(data => {
      if(data.count > 0) {
          this.itemDoneCount = 0;
      }
    });
  }

  deleteItem (item) {
	    this.service.delete(item.id).then(data => {
        let pos = arrayFindObjectIndex(this.items, 'id', data.id);
        if(pos >= 0) {
          this.items.splice(pos, 1);
        }
      }).catch(function() {
          alert("Failed to delete this TODO");
      });
	}

  editBegin(item) {
    item.isEditing = true;
  }

  editEnd(item) {
    if(!!item) {
      item.isEditing = false;
      this.updateItem(item);
    }
  }

  purge() {
    this.service.purgeArchiveItems().then(data => {
      console.log(data);
    }).catch(() => {
        alert("Failed to purge TODOs");
    });
  }

  toggleComplete (item) {
    if(!!item) {
      item.completed = !item.completed;
      this.updateItem(item);
    }
    return true;
  }

  updateItem(item) {
    this.service.save(item).then(newItem => {
      this.items[this.items.indexOf(item)] = newItem;
    }).catch(() => {
        alert("Failed to update the status of this TODO");
    });
  }

  subscribeSockets() {
    // create item, only add the item if we don't have it already in the items list to avoid dupes
    socket.on("todo_create", data => {
      if (!_.some(this.items, function (p) {
        return p.id === data.id;
      })) {
        this.items.unshift(data);
      }
    });

    // update item
    socket.on("todo_update", data => {
      let pos = arrayFindObjectIndex(this.items, 'id', data.id);
      if(pos >= 0) {
        this.items.splice(pos, 1, data);
        this.itemDoneCount = this.items.filter(x => x.completed).length;
      }
    });

    // delete item, only delete item if found in items list
    socket.on("todo_delete", data => {
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
function arrayFindObjectIndex(sourceArray, searchId, searchValue) {
  if (!!sourceArray) {
    for (var i = 0; i < sourceArray.length; i++) {
      if (sourceArray[i][searchId] === searchValue) {
        return i;
      }
    }
  }

  return -1;
}
