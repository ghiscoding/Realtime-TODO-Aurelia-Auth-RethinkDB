'use strict';

const authUtils = require('./authUtils');
const meController = require('./me.controller');
const github = require('./github');
const google = require('./google');
const facebook = require('./facebook');
const linkedin = require('./linkedin');
const live = require('./live');
const twitter = require('./twitter');
const Router = require('koa-router');
const router = new Router({
  prefix: '/auth'
});

// // routes
router.post('/github', github.authenticate);
router.post('/google', google.authenticate);
router.post('/facebook', facebook.authenticate);
router.post('/linkedin', linkedin.authenticate);
router.post('/live', live.authenticate);
router.post('/twitter', twitter.authenticate);

// //auth only applied for following routes, not the routes above
router.use(['/me', '/unlink'], authUtils.ensureAuthenticated);
router.get('/me', meController.getMe );
router.put('/me', meController.updateMe );
router.get('/unlink/:provider', meController.unlink);

// export Router
module.exports = router;
