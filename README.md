A real-time TODO App with [Aurelia](http://aurelia.io), [Socket.IO](http://socket.io/), [Node.js](http://www.nodejs.org/), [Koa](http://koajs.com/) and [RethinkDB](https://www.rethinkdb.com/) and [WebSockets](https://developer.mozilla.org/en/docs/WebSockets). A summary of tech stack:
* **Client**: Aurelia and Twitter Bootstrap.
* **Server**: Koa for RESTful API serving on Node.js.
* Socket.IO along with JSON-RPC is used for real-time client-server communication and browser sync.
* RethinkDB for database.

## Getting Started
Make sure that you have Node.js v4 or higher, and RethinkDB v3 or higher (running on the default port 28015) installed on your computer. To get started, do following:

(Server)
```bash
cd yourProject
npm install
npm start
```

Your application should run on the 4081 port so in your browser just go to [http://localhost:4081](http://localhost:4081).

## Database (RethinkDB)
You will need to create a `Test` database with a `todos` table. Running the project and adding a new Todo, should in theory, create the table structure.

If you want to use the login credentials, you will need to create a `users` table under the `test` database. The structure is `{ id, mail, password, username }`. Also go in the `client/main.js` and uncomment the code `let root = auth.isAuthenticated() ? 'app' : 'login';` to activate the logins.

## Configuration (Client)
All configuration is specified in the [/client/src/config](/client/src/config/) directory, particularly the [config.js](/client/src/config/config.js) file.

## Configuration (Server)
All configuration is specified in the [/server/config](/server/config/) directory, particularly the [config.js](/server/config/config.js) file.

## License
MIT
