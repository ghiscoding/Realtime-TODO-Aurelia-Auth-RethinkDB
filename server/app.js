// Middlewares
const app = require('koa')();
const serve = require('koa-static');
const api = require('koa-router')();
const assertTimeout = require('co-assert-timeout');
const http = require('http');
const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

// Load config for RethinkDB and koa
const config = require("./config");

// Import rethinkdbdash
const r = require('rethinkdbdash')(config.rethinkdb);

// attach a RethinkDB changefeeds to watch any changes & enut any changes through Socket.IO
io.sockets.on("connection", function(socket) {
  console.log('A new WebSocket client connected with ID: ' + socket.client.id);

  return r.table(config.tableTodo)
    .changes()
    .run()
    .then(function(cursor) {
      return cursor.each(function(err, item) {
        if(item == null) {
          return null;
        }
        if (!!item.new_val && item.old_val == null) {
          socket.emit("todo_create", item.new_val);
        }else if (!!item.new_val && !!item.old_val) {
          socket.emit("todo_update", item.new_val);
        }else if(item.new_val == null && !!item.old_val) {
          socket.emit("todo_delete", item.old_val);
        }
        return null;
      });
    })
    .error(function(err){
    	console.log("Changefeeds Failure: ", err);
      return null;
    });

    socket.on('disconnect', function(data) {
      console.log('A WebSocket client disconnnected with ID: ' + socket.client.id);
      return null;
    });
});

app.use(function* (next) {
    // Each request has 5 seconds to return
    yield assertTimeout(next, '5 seconds')
});

//app.use(api.routes());
//app.use(api.allowedMethods());

// load external routes
require('./routes')(app);

// Start koa
server.listen(config.koa.port);
console.log('listening on port ' + config.koa.port);
