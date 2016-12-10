'use strict';

// Middlewares
const parse = require('co-body');
var parseBool = require("parsebool");

// Load config for RethinkDB and koa
const config = require('../../config');

// Import rethinkdbdash
const r = require('rethinkdbdash')(config.rethinkdb);

// Retrieve all todo items
exports.getAll = function* () {
    try {
        var result = yield r.table(config.tableTodo).orderBy({index: r.desc("createdAt")}).filter({ userId: this.request.userId });
        this.body = JSON.stringify(result);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Retrieve all todo items
exports.getAllNonArchived = function* () {
    try {
        var result = yield r.table(config.tableTodo).orderBy({index: r.desc("createdAt")}).filter({ archived: false, userId: this.request.userId });
        this.body = JSON.stringify(result);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Create a new todo item
exports.createItem = function* () {
    try{
        var todo = yield parse(this);
        var result = yield r.table(config.tableTodo).insert(
            r.expr(todo).merge({
                userId: this.request.userId,
                archived: false,
                createdAt: r.now() // The date r.now(0 gets computed on the server -- new Date() would have work fine too
            }),
            {returnChanges: true}
        );

        todo = (result.changes.length > 0) ? result.changes[0].new_val : {}; // todo now contains the previous todo + a field `id` and `createdAt`
        this.body = JSON.stringify(todo);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Delete a todo item
exports.deleteItem = function* (next) {
    try{
        var id = this.params.id;
        var result = yield r.table(config.tableTodo).get(id).delete();
        this.body = JSON.stringify({ id: id });
        yield next;
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Update a todo item
exports.updateItem = function* () {
    try{
        var todo = yield parse(this);

        //delete todo._saving;
        var id = todo.id;

        var result = yield r.table(config.tableTodo).get(id).update(
            {title: todo.title, completed: todo.completed, archived: false, userId: this.request.userId},
            {returnChanges: true}
        );

        result = (result.changes.length > 0) ? result.changes[0].new_val : {};
        this.body = JSON.stringify(result);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Archive all the todo items
exports.archiveAllCompleted = function* () {
    try{
        var result = yield r.table(config.tableTodo).filter({ completed: true, archived: false, userId: this.request.userId }).update(
            { archived: true }
        );
        this.body = JSON.stringify({ archived: true, count: result.replaced });
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Purge all the archived items
exports.purgeArchiveItems = function* () {
    try{
        var result = yield r.table(config.tableTodo).filter({ archived: true, userId: this.request.userId }).delete();
        this.body = JSON.stringify({ purged: true, count: result.deleted });
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Toggle all the todo items to complete
exports.toggleAllItemToComplete = function* () {
    try{
        var flag = parseBool(this.params.flag);
        var result = yield r.table(config.tableTodo).filter({ completed: flag, userId: this.request.userId }).update(
            {completed: !flag} // toggle the inverse flag
        );
        this.body = JSON.stringify({ completed: !flag, count: result.replaced });
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}
