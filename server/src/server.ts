import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as rethinkdb from 'rethinkdb';
import * as rethinkdbdash from 'rethinkdbdash';
import * as http from 'http';
import * as socketIo from 'socket.io';
import { config } from '../config';
import { logger } from './logging';
import { routes } from './routes';

const app = new Koa();
const server = http.createServer(app.callback());
const io = socketIo(server);

// Import rethinkdbdash
const r: any = rethinkdbdash(config.rethinkdb);

// attach a RethinkDB changefeeds to watch any changes through Socket.IO
const todoSocket = io.of('/todo-socket');
todoSocket.on('connection', (socket) => {
  console.log('A new WebSocket client connected with ID: ' + socket.client.id);

  socket.on('disconnect', (data) => {
    console.log('A WebSocket client disconnnected with ID: ' + socket.client.id);
    return null;
  });

  return r.table('todos')
    .changes()
    .run()
    .then((cursor: any) => {
      return cursor.each((err: Error, item: any): any => {
        if (item == null) {
          return null;
        }

        if (!!item.new_val && item.old_val == null) {
          socket.emit('todo_create', item.new_val);
        }else if (!!item.new_val && !!item.old_val) {
          socket.emit('todo_update', item.new_val);
        }else if (item.new_val == null && !!item.old_val) {
          socket.emit('todo_delete', item.old_val);
        }
        return null;
      });
    })
    .error((err: Error): any => {
      console.log('RethinkDB Changefeeds Failure: ', err);
      return null;
    });
});

// app.use(logger);
app.use(routes);

server.listen(config.koa.port);

console.log(`Server running on port ${config.koa.port}`);
