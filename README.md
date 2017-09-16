A Realtime TODO App with [Aurelia](http://aurelia.io), [Socket.IO](http://socket.io/), [Node.js](http://www.nodejs.org/), [Koa](http://koajs.com/) and [RethinkDB](https://www.rethinkdb.com/).

A summary of tech stack:
* **Client**: [Aurelia](http://aurelia.io/), [Twitter Bootstrap 4 (beta)](http://getbootstrap.com/), [Font-Awesome](http://fontawesome.io/) and [Aurelia-Bootstrap-Plugins](https://github.com/ghiscoding/Aurelia-Bootstrap-Plugins) (my creation :smile:).
* **Server**: [Koa](http://koajs.com/) for RESTful API serving on [Node.js](https://nodejs.org/).
* **[Socket.IO](http://socket.io/)** along with JSON-RPC is used for real-time client-server communication and browser sync.
* **[RethinkDB](https://rethinkdb.com/)** as the best open-source database for the realtime web.

## Getting Started
Make sure to have [Node.js](https://nodejs.org/) v4.x or higher, and [RethinkDB](https://rethinkdb.com/) v2.3.x or higher installed on your computer.

### Git Clone (downloading)
```bash
git clone https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB
```

### OAuth Authentication with Aurelia-Auth
We will use [Aurelia-Auth](https://github.com/paulvanbladel/aurelia-auth) for OAuth login so that we can use (Google, Facebook, GitHub, LinkedIn, Windows Live or Twitter) to login to our application. The configuration of the OAuth secret keys will be under `server/config/config.development.js`, this file is however excluded from the project (for obvious reason). **Very important step to do, you will need to go under the folder `/server/config` and rename the file from `config.development.template.js` to `config.development.js` and then put in your OAuth secret keys.**

The `Aurelia-Auth`is based on `Satellizer` and uses the same configurations, so you could refer to their [GitHub Satellizer](https://github.com/sahat/satellizer) repo for more details.

### Database (RethinkDB)
We are using RethinkDB as our favorite NoSQL DB Server, you can use the default port of `28015`.
Also make sure to create a `test` database (if not yet created) with the following tables (`todos`, `users`, `customers`).

### Client (CLI)
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-cli
npm install # or: yarn install
au run --watch
```

The `run` process also has a `node` server option, so if you want, you could run `NodeJS` server directly from the `au run` command by adding the `--node` option (make sure you ran the [Server installation](#server) prior to launching this command)..
```bash
au run --watch --node
```
_Note: The `CLI` installation is built with `SASS` as pre-processor. To create and use any stylesheets, you will need to use the `scss` extension while calling them as `css` in your project (because they are transpiled when bundled, refer to [Aurelia CLI](http://aurelia.io/hub.html#/doc/article/aurelia/framework/latest/the-aurelia-cli) for further information).
With the use of `SASS`, I was then able to try out the new [Bootstrap 4](http://getbootstrap.com/)._

### Client (TypeScript WebPack 3.x)
Please note that the `TypeScript Webpack` with the command line `npm start` will ONLY run the WebUI (Aurelia).

#### Install/Run trough shell
If you want to run both the frontend/backend (WebUI w/Aurelia + WebAPI w/NodeJS), you can do so by calling `npm start -- withBackend` (make sure to follow the [Server installation](#server-nodejs---koa) prior to launching this command).
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-ts-wp
npm install # or: yarn install
npm start -- withBackend # or: yarn start -- withBackend
```

#### Install/Run through VSCode
If you use VSCode (Visual Studio Code) as your main editor, you can load the vscode workspace (requires version `1.16+`, `File -> Open Workspaces`). Once the workspace is loaded, you will then have access to multiple tasks (defined in `client-ts-wp/tasks.json`) which makes it easy to execute the code without even typing any command in the shell (you still have to make sure to `npm install` in both `client-ts-wp` and `server` folder).

### Server (NodeJS - KOA)
**Optional, see the note below**
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/server
npm install # or: yarn install
npm start # or: yarn start
```

_**Note**: running the server here is totally optional, since you might have already started it with the `--node` flag with CLI client or `npm start` with Webpack client._

## Web UI
If everything goes well, your application should now run locally on port `4000`. Open your browser and go at the URL [http://localhost:4000](http://localhost:4000).

## Configuration
### Server
Server configurations are specified in the [/server/config](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/server/config/) directory. When running `npm start` it will load the configuration that is defined in your `process.env.NODE_ENV` (environment variable, if unset it will use `development` by default).

### Default Ports
Default ports for this application are `4000` for the WebUI and `5000` for the API (server) calls.
You can change these ports by going into

#### CLI
You can change the ports by going into [/client-cli/aurelia_project/tasks/run.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-cli/aurelia_project/tasks/run.js) via the variables `portBackEnd` and `portFrontEnd`.

#### WebPack with TypeScript
You can change the ports by editing the file [/client-ts-wp/config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-ts-wp/config.js), the `webpack.config.js` and `package-scripts.js` were modifed to use the `config.js` configured ports.

## Contributions
Contributions are welcome. I use this project as a placeholder to help (and be helped by) people, which is all about the open community. So please feel free to make any PR (Pull Request).

## License
MIT
