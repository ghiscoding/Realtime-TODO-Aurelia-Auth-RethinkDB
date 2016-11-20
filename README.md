A Realtime TODO App with [Aurelia](http://aurelia.io), [Socket.IO](http://socket.io/), [Node.js](http://www.nodejs.org/), [Koa](http://koajs.com/) and [RethinkDB](https://www.rethinkdb.com/).

A summary of tech stack:
* **Client**: [Aurelia](http://aurelia.io/), [Twitter Bootstrap](http://getbootstrap.com/) & [Font-Awesome](http://fontawesome.io/).
* **Server**: [Koa](http://koajs.com/) for RESTful API serving on [Node.js](https://nodejs.org/).
* **[Socket.IO](http://socket.io/)** along with JSON-RPC is used for real-time client-server communication and browser sync.
* **[RethinkDB](https://rethinkdb.com/)** as the best open-source database for the realtime web.

## Getting Started
Make sure to have [Node.js](https://nodejs.org/) v4.x or higher, and [RethinkDB](https://rethinkdb.com/) v2.3.x or higher installed on your computer.

**Note:** Since I recently added the `CLI` bundle, it varies a little bit from the `WebPack` version. I wanted to test out the new [Bootstrap 4 alpha](http://v4-alpha.getbootstrap.com/) with `SASS` support and [Aurelia-CLI](https://github.com/aurelia/cli), while the [Aurelia-WebPack](https://github.com/aurelia/skeleton-navigation) version uses the stable [Bootstrap 3](http://getbootstrap.com/).

#### Git Clone (downloading)
```html
git clone https://github.com/ghiscoding/Realtime-TODO-Aurelia-RethinkDB
```
#### Server (NodeJS - KOA)
```html
cd Realtime-TODO-Aurelia-RethinkDB/server
npm install
npm start
```

#### Client (CLI)
```html
cd Realtime-TODO-Aurelia-RethinkDB/client-cli
npm install
au run --watch
```
_The `CLI` installation is built with `SASS` as pre-processor. To create and use any stylesheets, you will need to use the `scss` extension while calling them as `css` in your project (because they are transpiled when bundled, refer to [Aurelia CLI](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/the-aurelia-cli) for further information).
With the use of `SASS`, I was then able to try out the new [Bootstrap 4](http://v4-alpha.getbootstrap.com/)._

#### Client (WebPack)
```html
cd Realtime-TODO-Aurelia-RethinkDB/client-wp
npm install
npm start
```

#### Database (RethinkDB)
We are using RethinkDB as our favorite NoSQL DB Server, you can use the default port of 28015.
Also make sure you have a `test` database (if not create it), then a `todos` table will be used for saving all of these TODOs.

#### Web UI
If everything goes well, your application should now run locally on the port `4080`. So, in your browser just go to [http://localhost:4080](http://localhost:4080).

### Database (RethinkDB)
You will need to create a `test` database (if not yet created) with a `todos` table. Running the project and adding a new Todo, should in theory, create the table structure.

If you want to use the login credentials, you will need to create a `users` table under the `test` database. The table structure is `{ id, mail, password, username }`. You also need to go in `client-wp/src/main.js` and uncomment the code `let root = auth.isAuthenticated() ? 'app' : 'login';` to activate the logins (make sure to remove the following line `let root = 'app';`).

## Configuration
#### Client
Client configurations are specified in the [/client-cli/src/config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-RethinkDB/blob/master/client-cli/src/config.js) file.

#### Server
Server configurations are specified in the [/server/config](https://github.com/ghiscoding/Realtime-TODO-Aurelia-RethinkDB/blob/master/server/config/) directory. When running `npm start` it will load the configuration that is defined in your `process.env.NODE_ENV` (environment variable, if unset it will use `development` by default).

### Default Ports
Default ports for this application are `4080` for the WebUI and `4081` for the API (server) calls.
You can change these ports by going into
##### CLI
You can change the port by going into [/client-cli/aurelia_project/run.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-RethinkDB/blob/master/client-cli/aurelia_project/run.js) via the variables `portApi` and `portWeb`.
##### WebPack
You can change the port by going into [/client-wp/webpack.config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-RethinkDB/blob/master/client-wp/webpack.config.js) via the variables `portApi` and `portWeb`.

## Contributions
Contributions are welcome, I use this project as placeholder to help (and be helped by) people. So please feel free to make any PR.

## License
MIT
