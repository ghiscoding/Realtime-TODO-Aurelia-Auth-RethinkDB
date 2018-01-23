import * as parse from 'co-body';
import { config } from '../../config';
import * as _ from 'lodash';
import * as Router from 'koa-router';
import * as rethinkdb from 'rethinkdb';
import * as rethinkdbdash from 'rethinkdbdash';

// RethinkDB table & reQl instance
const TABLE_NAME = 'customers';
const r: any = rethinkdbdash(config.rethinkdb);

// Get list of items
export const getAll = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const result = await r.table(TABLE_NAME);
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
};

// Get a single item
export const get = async (ctx: Router.IRouterContext, next: () => void) => {
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
export const create = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const customer = await parse(ctx);
    const result = await r.table(TABLE_NAME).insert(
      r.expr(customer).merge({
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

// Updates an existing item in the DB.
export const update = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const customer = await parse(ctx);
    const id = customer.id;

    const result = await r.table(TABLE_NAME)
      .get(id)
      .update(r.object(customer).merge({
        updatedAt: r.now(),
      }), { returnChanges: true })
      .run()
      .then((response: any) => {
        return response.changes[0].new_val;
      });

    // result = (result.changes.length > 0) ? result.changes[0].new_val : {};
    // ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message;
  }
};

// Deletes an item from the DB.
export const destroy = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const id = ctx.params.id;
    const result = await r.table(TABLE_NAME).get(id).delete();
    ctx.body = JSON.stringify({ id });
    await next;
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message;
  }
};
