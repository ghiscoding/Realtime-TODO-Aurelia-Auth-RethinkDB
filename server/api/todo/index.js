/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /items              ->  index
 * POST    /items              ->  create
 * GET     /items/:id          ->  show
 * PUT     /items/:id          ->  update
 * DELETE  /items/:id          ->  destroy
 */

'use strict';

var controller = require('./todo.controller');
var Router = require('koa-router');

var router = new Router();

// routes
router.get('/api/todos/archived', controller.getAllNonArchived);
router.get('/api/todos', controller.getAll);
router.post('/api/todos', controller.createItem);
router.put('/api/todos/:id', controller.updateItem);
router.post('/api/todos/archive-all-completed', controller.archiveAllCompleted);
router.post('/api/todos/purge-archived-items', controller.purgeArchiveItems);
router.post('/api/todos/mark-all-completed/:flag', controller.toggleAllItemToComplete);
router.delete('/api/todos/:id', controller.deleteItem);

// export Router
module.exports = router;
