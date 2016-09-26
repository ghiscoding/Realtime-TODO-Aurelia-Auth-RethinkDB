var config = require('./config.global');

module.exports = {
  env: "production",
  rethinkdb: {
      host: "127.0.0.1",
      port: 28015,
      authKey: "",
      db: "test"
  },
  tableTodo: "todos",
  tableAuth: "users",
  koa: {
      port: 4081
  }
}
