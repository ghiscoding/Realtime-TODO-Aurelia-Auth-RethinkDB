'use strict';

// Middlewares
const parse = require('co-body');

// Load config for RethinkDB and koa
const config = require("../../config.js");

// Import rethinkdbdash
const r = require('rethinkdbdash')(config.rethinkdb);

// Retrieve all todo items
exports.login = function* () {
  try{
      var auth = yield parse(this);

      var username = auth.username;
      var password = auth.password;

      var result = yield r.table(config.tableAuth).filter({username: username, password: password });
      this.body = JSON.stringify({ isAuthenticated: (!!result && result.length > 0) });
  }
  catch(e) {
      this.status = 500;
      this.body = e.message || http.STATUS_CODES[this.status];
  }
}
