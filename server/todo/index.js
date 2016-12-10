/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /items              ->  index
 * POST    /items              ->  create
 * GET     /items/:id          ->  show
 * PUT     /items/:id          ->  update
 * DELETE  /items/:id          ->  destroy
 */

'use strict';

const controller = require('./todo.controller');
const Router = require('koa-router');
const router = new Router({
  prefix: '/api/todo'
});

// routes
router.get('/archived', controller.getAllNonArchived);
router.get('/', controller.getAll);
router.post('/', controller.createItem);
router.put('/:id', controller.updateItem);
router.post('/archive-all-completed', controller.archiveAllCompleted);
router.post('/purge-archived-items', controller.purgeArchiveItems);
router.post('/mark-all-completed/:flag', controller.toggleAllItemToComplete);
router.delete('/:id', controller.deleteItem);

// export Router
module.exports = router;
