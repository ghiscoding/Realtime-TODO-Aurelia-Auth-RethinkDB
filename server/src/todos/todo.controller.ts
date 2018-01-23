import * as parse from 'co-body';
import { config } from '../../config';
import * as _ from 'lodash';
import * as Router from 'koa-router';
import * as rethinkdb from 'rethinkdb';
import * as rethinkdbdash from 'rethinkdbdash';

// RethinkDB table & reQl instance
const TABLE_NAME = 'todos';
const r: any = rethinkdbdash(config.rethinkdb);

// Retrieve all todo items
export const getAll = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const userId = ctx.state.userId;
    if (!userId) {
      ctx.throw(400, 'userId required');
    }
    const result = await r.table(TABLE_NAME).filter({ userId }).orderBy('createdAt');
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Retrieve all todo items non-archived
export const getAllNonArchived = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const userId = ctx.state.userId;
    if (!userId) {
      ctx.throw(400, 'userId required');
    }
    const result = await r.table(TABLE_NAME).filter({ archived: false, userId }).orderBy('createdAt');
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Get a single item
export const getItem = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const id = ctx.params.id;
    const result = await r.table(TABLE_NAME).get(id);
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Creates a new item in the DB.
export const createItem = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const todo = await parse(ctx);
    const userId = ctx.state.userId;
    if (!userId || !todo) {
      ctx.throw(400, 'userId and a TODO item are required');
    }
    const result = await r.table(TABLE_NAME).insert(
      r.expr(todo).merge({
        userId,
        archived: false,
        createdAt: r.now(),
        updatedAt: r.now(),
      }),
      { returnChanges: true }
    )
    .run()
    .then((response: any) => {
      return response.changes[0].new_val;
    });
    console.log(result);
    // result = (result.changes.length > 0) ? result.changes[0].new_val : {}; // customer now contains the previous customer + a field `id` and `createdAt`
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message;
  }
};

// Deletes an item from the DB.
export const deleteItem = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const id = ctx.params.id;
    const userId = ctx.state.userId;
    if (!id || !userId) {
      ctx.throw(400, 'userId and TODO id are required');
    }
    const result = await r.table(TABLE_NAME).get(id).delete();
    ctx.body = JSON.stringify({ id });
    await next;
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message;
  }
};

// Updates an existing item in the DB.
export const updateItem = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const todo = await parse(ctx);
    const userId = ctx.state.userId;
    if (!todo || !todo.id || !userId) {
      ctx.throw(400, 'userId and TODO item are required');
    }

    // delete the TODO
    const id = todo.id;
    const reqlResult = await r.table(TABLE_NAME)
      .get(id)
      .update(
        { title: todo.title, completed: todo.completed, archived: false, userId },
        { returnChanges: true }
      );

    const updatedItem = (reqlResult.changes.length > 0) ? reqlResult.changes[0].new_val : {};
    ctx.body = JSON.stringify(updatedItem);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message;
  }
};

// Archive all the todo items
export const archiveAllCompleted = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const userId = ctx.state.userId;
    if (!userId) {
      ctx.throw(400, 'userId required');
    }
    const result = await r.table(TABLE_NAME)
      .filter({ completed: true, archived: false, userId })
      .update(
        { archived: true }
      );

    ctx.body = JSON.stringify({ archived: true, count: result.replaced });
  }
  catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Purge all the archived items
export const purgeArchiveItems = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const userId = ctx.state.userId;
    if (!userId) {
      ctx.throw(400, 'userId required');
    }
    const result = await r.table(TABLE_NAME).filter({ archived: true, userId }).delete();
    ctx.body = JSON.stringify({ purged: true, count: result.deleted });
  }
  catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Toggle all the todo items to complete
export const toggleAllItemToComplete = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const flag = (!!ctx.params.flag || ctx.params.flag === 'true');
    const userId = ctx.state.userId;
    if (!flag || !userId) {
      ctx.throw(400, 'userId required');
    }
    const result = await r.table(TABLE_NAME).filter({ completed: flag, userId }).update(
      { completed: !flag } // toggle the inverse flag
    );
    ctx.body = JSON.stringify({ completed: !flag, count: result.replaced });
  }
  catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};
