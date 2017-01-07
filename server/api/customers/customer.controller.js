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
exports.index = function* () {
  try{
    var result = yield r.table(config.tableCustomer);
    this.body = JSON.stringify(result);
  } catch(e) {
      this.status = 500;
      this.body = e.message || http.STATUS_CODES[this.status];
  }
};

// Get a single item
exports.show = function* (next) {
    try{
        var id = this.params.id;
        var result = yield r.table(config.tableCustomer).get(id);
        this.body = JSON.stringify(result);
      } catch(e) {
          this.status = 500;
          this.body = e.message || http.STATUS_CODES[this.status];
      }
}

// Creates a new item in the DB.
exports.create = function* () {
    try{
        var customer = yield parse(this);
        var result = yield r.table(config.tableCustomer).insert(
            r.expr(customer).merge({
                createdAt: r.now(),
                updatedAt: r.now(),
            }),
            {returnChanges: true}
        );

        result = (result.changes.length > 0) ? result.changes[0].new_val : {}; // customer now contains the previous customer + a field `id` and `createdAt`
        this.body = JSON.stringify(result);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Updates an existing item in the DB.
exports.update = function* () {
    try{
        var customer = yield parse(this);
        var id = customer.id;

        var result = yield r.table(config.tableCustomer)
          .get(id)
          .update(r.expr(customer).merge({
              updatedAt: r.now(),
          }), {returnChanges: true});

        result = (result.changes.length > 0) ? result.changes[0].new_val : {};
        this.body = JSON.stringify(result);
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}

// Deletes an item from the DB.
exports.destroy = function* (next) {
    try{
        var id = this.params.id;
        var result = yield r.table(config.tableCustomer).get(id).delete();
        this.body = JSON.stringify({ id: id });
        yield next;
    }
    catch(e) {
        this.status = 500;
        this.body = e.message || http.STATUS_CODES[this.status];
    }
}
