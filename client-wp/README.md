## Getting Started

### Client install
Please note that the `Webpack` version was modified to run both the frontend/backend with just `npm start`. However if you just want to run the frontend (client), you can do so by calling `npm run start:client-only`.
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-wp
npm install
npm start
```


### Web UI
If everything goes well, your application should now run locally on port `4000`. So, in your browser just go to [http://localhost:4000](http://localhost:4000).

## Configuration

### Default Ports
Default ports for this application are `4000` for the WebUI and `5000` for the API (server) calls.
You can change these ports by going into
#### WebPack
You can change the ports by going into [/client-wp/webpack.config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-wp/webpack.config.babel.js) via the variables `portBackEnd`, however the client/frontend port will have to be updated in the [/client/wp/package.json](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-wp/package.json) file by changing the variable `WEBPACK_PORT=4000` to whichever port you want (you might also want to update `serve-backend:start-when-ready` line).

## License
MIT
