'use strict';

// Middlewares
const parse = require('co-body');
const parseBool = require("parsebool");

// Load config for RethinkDB and koa
const config = require('../../config');

// Import rethinkdbdash
const r = require('rethinkdbdash')(config.rethinkdb);

// Retrieve all todo items
exports.getAll = async function (ctx, next) {
  try {
    let result = await r.table(config.tableTodo).orderBy({ index: r.desc("createdAt") }).filter({ userId: ctx.request.userId });
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Retrieve all todo items
exports.getAllNonArchived = async function (ctx, next) {
  try {
    let result = await r.table(config.tableTodo).orderBy({ index: r.desc("createdAt") }).filter({ archived: false, userId: ctx.request.userId });
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Create a new todo item
exports.createItem = async function (ctx, next) {
  try {
    let todo = await parse(ctx);
    let result = await r.table(config.tableTodo).insert(
      r.expr(todo).merge({
        userId: ctx.request.userId,
        archived: false,
        createdAt: r.now() // The date r.now(0 gets computed on the server -- new Date() would have work fine too
      }),
      { returnChanges: true }
    );

    todo = (result.changes.length > 0) ? result.changes[0].new_val : {}; // todo now contains the previous todo + a field `id` and `createdAt`
    ctx.body = JSON.stringify(todo);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Delete a todo item
exports.deleteItem = async function (ctx, next) {
  try {
    let id = ctx.params.id;
    let result = await r.table(config.tableTodo).get(id).delete();
    ctx.body = JSON.stringify({ id: id });
    await next;
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Update a todo item
exports.updateItem = async function (ctx, next) {
  try {
    let todo = await parse(ctx);

    //delete todo._saving;
    let id = todo.id;

    let result = await r.table(config.tableTodo).get(id).update(
      { title: todo.title, completed: todo.completed, archived: false, userId: ctx.request.userId },
      { returnChanges: true }
    );

    result = (result.changes.length > 0) ? result.changes[0].new_val : {};
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Archive all the todo items
exports.archiveAllCompleted = async function (ctx, next) {
  try {
    let result = await r.table(config.tableTodo).filter({ completed: true, archived: false, userId: ctx.request.userId }).update(
      { archived: true }
    );
    ctx.body = JSON.stringify({ archived: true, count: result.replaced });
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Purge all the archived items
exports.purgeArchiveItems = async function (ctx, next) {
  try {
    let result = await r.table(config.tableTodo).filter({ archived: true, userId: ctx.request.userId }).delete();
    ctx.body = JSON.stringify({ purged: true, count: result.deleted });
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}

// Toggle all the todo items to complete
exports.toggleAllItemToComplete = async function (ctx, next) {
  try {
    let flag = parseBool(ctx.params.flag);
    let result = await r.table(config.tableTodo).filter({ completed: flag, userId: ctx.request.userId }).update(
      { completed: !flag } // toggle the inverse flag
    );
    ctx.body = JSON.stringify({ completed: !flag, count: result.replaced });
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
}
