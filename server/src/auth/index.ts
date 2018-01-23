import { ensureAuthenticated } from './authUtils';
import * as Router from 'koa-router';
import * as authController from './auth.controller';
import * as meController from './me.controller';
import * as github from './github';
import * as google from './google';
import * as facebook from './facebook';
import * as linkedin from './linkedin';
import * as live from './live';
import * as twitter from './twitter';

const router = new Router();

// routes
router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/github', github.authenticate);
router.post('/google', google.authenticate);
router.post('/facebook', facebook.authenticate);
router.post('/linkedin', linkedin.authenticate);
router.post('/live', live.authenticate);
router.post('/twitter', twitter.authenticate);

// auth only applied for following routes, not the routes above
router.use(['/me', '/unlink'], ensureAuthenticated);
router.get('/me', meController.getMe );
router.put('/me', meController.updateMe );
router.get('/unlink/:provider', meController.unlink);

export default router.routes();
