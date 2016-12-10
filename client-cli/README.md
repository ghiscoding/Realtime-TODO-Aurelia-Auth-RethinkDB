## Getting Started

#### Note
The `CLI` was created afterward and it varies a little bit from the `WebPack` version. I wanted to test out the new [Bootstrap 4 alpha](http://v4-alpha.getbootstrap.com/) with `SASS` support and [Aurelia-CLI](https://github.com/aurelia/cli), while the [Aurelia-WebPack](https://github.com/aurelia/skeleton-navigation) version uses the stable [Bootstrap 3](http://getbootstrap.com/). The `WebPack` version is however not really up to date, if someone want to update all packages to latest then please make a PR.

### Client install
```html
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

### Web UI
If everything goes well, your application should now run locally on the port `4000`. So, in your browser just go to [http://localhost:4000](http://localhost:4000).

## Configuration
### Client
Client configurations are specified in the [/client-cli/src/config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-cli/src/config.js) file.

### Default Ports
Default ports for this application are `4000` for the WebUI and `5000` for the API (server) calls.
You can change these ports by going into
#### CLI
You can change the port by going into [/client-cli/aurelia_project/run.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-cli/aurelia_project/run.js) via the variables `portBackEnd` and `portFrontEnd`.

## Contributions
Contributions are welcome, I use this project as a placeholder to help (and be helped by) people. So please feel free to make any PR.

## License
MIT
