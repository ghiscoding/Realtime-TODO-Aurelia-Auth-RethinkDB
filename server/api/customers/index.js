'use strict';

const authUtils = require('../../auth/authUtils');
const controller = require('./customer.controller');
const Router = require('koa-router');
const router = new Router({
  prefix: '/api/customers'
});

router.use(authUtils.ensureAuthenticated); //auth only appied for following paths, not the paths above
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

// export Router
module.exports = router;
