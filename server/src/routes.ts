
import * as Router from 'koa-router';
import AuthRouter from './auth';
import CustomerRouter from './customers';
import TodoRouter from './todos';

const apiRouter = new Router();
apiRouter.use('/auth', AuthRouter);
apiRouter.use('/api/customers', CustomerRouter);
apiRouter.use('/api/todos', TodoRouter);

export const routes = apiRouter.routes();
