A Realtime TODO App with [Aurelia](http://aurelia.io), [Socket.IO](http://socket.io/), [Node.js](http://www.nodejs.org/), [Koa](http://koajs.com/) and [RethinkDB](https://www.rethinkdb.com/).

A summary of tech stack:
* **Client**: [Aurelia](http://aurelia.io/), [Twitter Bootstrap](http://getbootstrap.com/) & [Font-Awesome](http://fontawesome.io/).
* **Server**: [Koa](http://koajs.com/) for RESTful API serving on [Node.js](https://nodejs.org/).
* **[Socket.IO](http://socket.io/)** along with JSON-RPC is used for real-time client-server communication and browser sync.
* **[RethinkDB](https://rethinkdb.com/)** as the best open-source database for the realtime web.

## Getting Started
Make sure to have [Node.js](https://nodejs.org/) v4.x or higher, and [RethinkDB](https://rethinkdb.com/) v2.3.x or higher installed on your computer.

#### Note
The `CLI` was created afterward and it varies a little bit from the `WebPack` version. I wanted to test out the new [Bootstrap 4 alpha](http://v4-alpha.getbootstrap.com/) with `SASS` support and [Aurelia-CLI](https://github.com/aurelia/cli), while the [Aurelia-WebPack](https://github.com/aurelia/skeleton-navigation) version uses the stable [Bootstrap 3](http://getbootstrap.com/). The `WebPack` version however is not up to date, if someone want to update all packages and make with fixes, I would be happy.

### Git Clone (downloading)
```bash
git clone https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB
```

### Client (CLI)
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-cli
npm install
au run --watch
```

The Aurelia run job also has a server option, so you could also run `NodeJS` server directly from the `au run` command by adding the `--node`. 
```bash
au run --watch --node
``` 
_The `CLI` installation is built with `SASS` as pre-processor. To create and use any stylesheets, you will need to use the `scss` extension while calling them as `css` in your project (because they are transpiled when bundled, refer to [Aurelia CLI](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/the-aurelia-cli) for further information).
With the use of `SASS`, I was then able to try out the new [Bootstrap 4](http://v4-alpha.getbootstrap.com/)._

### Client (WebPack)
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-wp
npm install
npm start
```

### Server (NodeJS - KOA)
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/server
npm install
npm start
```

_**Note**: running `npm start` is optional if you already used the `--node` with (Client CLI)_

### Database (RethinkDB)
We are using RethinkDB as our favorite NoSQL DB Server, you can use the default port of 28015.
Also make sure you have a `test` database (if not create it), then a `todos` table will be used for saving all of these TODOs.

## OAuth Authentication with Aurelia-Auth
We will use [Aurelia-Auth](https://github.com/paulvanbladel/aurelia-auth) for OAuth login so that we can use Google, Facebook, and more to login to our application. The configuration of the OAuth secret keys will be `server/config/config.development.js`, this file is however excluded from the project (for obvious reason). Simply go under the folder `/server/config` and rename the file from `config.development.template.js` to `config.development.js` and then put in your OAuth secret keys.

### Web UI
If everything goes well, your application should now run locally on the port `4000`. Open your browser and go to [http://localhost:4000](http://localhost:4000).

### Database (RethinkDB)
You will need to create a `test` database (if not yet created) with a `todos` table. Running the project and adding a new Todo, should in theory, create the table structure.

If you want to use the login credentials, you will need to create a `users` table under the `test` database. The table structure is `{ id, mail, password, username }`. You also need to go in `client-wp/src/main.js` and uncomment the code `let root = auth.isAuthenticated() ? 'app' : 'login';` to activate the logins (make sure to remove the following line `let root = 'app';`).

## Configuration
### Client
Client configurations are specified in the [/client-cli/src/config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-cli/src/config.js) file.

### Server
Server configurations are specified in the [/server/config](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/server/config/) directory. When running `npm start` it will load the configuration that is defined in your `process.env.NODE_ENV` (environment variable, if unset it will use `development` by default).

### Default Ports
Default ports for this application are `4000` for the WebUI and `5000` for the API (server) calls.
You can change these ports by going into
#### CLI
You can change the port by going into [/client-cli/aurelia_project/run.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-cli/aurelia_project/run.js) via the variables `portBackEnd` and `portFrontEnd`.
#### WebPack
You can change the port by going into [/client-wp/webpack.config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-wp/webpack.config.js) via the variables `portBackEnd` and `portFrontEnd`. 

## Contributions
Contributions are welcome, I use this project as a placeholder to help (and be helped by) people. So please feel free to make any PR.

## License
MIT
