/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /items              ->  index
 * POST    /items              ->  create
 * GET     /items/:id          ->  show
 * PUT     /items/:id          ->  update
 * DELETE  /items/:id          ->  destroy
 */

'use strict';

var controller = require('./auth.controller');
var Router = require('koa-router');
var router = new Router();

// routes
router.post('/api/auth', controller.login);

// export Router
module.exports = router;
