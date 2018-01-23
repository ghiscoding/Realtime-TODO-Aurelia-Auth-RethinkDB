import { ensureAuthenticated } from '../auth/authUtils';
import * as Router from 'koa-router';
import * as controller from './todo.controller';

const router = new Router();

// routes
router.use(['/', '/archived'], ensureAuthenticated);
router.get('/archived', controller.getAllNonArchived);
router.get('/', controller.getAll);
router.post('/', controller.createItem);
router.put('/:id', controller.updateItem);
router.post('/archive-all-completed', controller.archiveAllCompleted);
router.post('/purge-archived-items', controller.purgeArchiveItems);
router.post('/mark-all-completed/:flag', controller.toggleAllItemToComplete);
router.delete('/:id', controller.deleteItem);

export default router.routes();
