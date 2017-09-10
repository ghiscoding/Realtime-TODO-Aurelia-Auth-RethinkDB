/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /items              ->  index
 * POST    /items              ->  create
 * GET     /items/:id          ->  show
 * PUT     /items/:id          ->  update
 * DELETE  /items/:id          ->  destroy
 */

'use strict';

// Middlewares
const _ = require('lodash');
const parse = require('co-body');
var parseBool = require("parsebool");

// Load config for RethinkDB and koa
const config = require('../../config');

// Import rethinkdbdash
const r = require('rethinkdbdash')(config.rethinkdb);

// Get list of items
exports.index = async function (ctx, next) {
  try {
    var result = await r.table(config.tableCustomer);
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
};

// Get a single item
exports.show = async function (ctx, next) {
  try {
    var id = ctx.params.id;
    var result = await r.table(config.tableCustomer).get(id);
    ctx.body = JSON.stringify(result);
  } catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
};

// Creates a new item in the DB.
exports.create = async function (ctx, next) {
  try {
    var customer = await parse(ctx);
    var result = await r.table(config.tableCustomer).insert(
      r.expr(customer).merge({
        createdAt: r.now(),
        updatedAt: r.now(),
      }),
      { returnChanges: true }
    );

    result = (result.changes.length > 0) ? result.changes[0].new_val : {}; // customer now contains the previous customer + a field `id` and `createdAt`
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
};

// Updates an existing item in the DB.
exports.update = async function (ctx, next) {
  try {
    var customer = await parse(ctx);
    var id = customer.id;

    var result = await r.table(config.tableCustomer)
      .get(id)
      .update(r.expr(customer).merge({
        updatedAt: r.now(),
      }), { returnChanges: true });

    result = (result.changes.length > 0) ? result.changes[0].new_val : {};
    ctx.body = JSON.stringify(result);
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
};

// Deletes an item from the DB.
exports.destroy = async function (ctx, next) {
  try {
    var id = ctx.params.id;
    var result = await r.table(config.tableCustomer).get(id).delete();
    ctx.body = JSON.stringify({ id: id });
    await next;
  }
  catch (e) {
    ctx.status = 500;
    ctx.body = e.message || http.STATUS_CODES[ctx.status];
  }
};
