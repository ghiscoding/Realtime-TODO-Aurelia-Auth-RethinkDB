## Client TypeScript Webpack

### Client installation
Start by cloning the repo and then install it (with `npm` or [yarn](https://yarnpkg.com/))
```bash
cd Realtime-TODO-Aurelia-Auth-RethinkDB/client-ts-wp
npm install # or: yarn install
```

### Running the App
The simplest way of running the App is by typing the command (note: this will only start the WebUI)
```bash
npm start # or: yarn start
```
What if you want to run both WebUI and WebAPI (`node` server) with 1 command?
Easy, just use this command instead:
```bash
npm start -- backend.node # or: yarn start -- backend.node
```
**Note:** a final note when using the `backend.node`, it will use `nodemon` with 2 flags `--watch` and `--inspect`. If you do not want to start with any flags, you may use `backend.node.noflag`

### Web UI
If everything goes well, your application should now run locally on port `4000`. So, in your browser just go to [http://localhost:4000](http://localhost:4000).

## Configuration

### Default Ports
Default ports for this application are `4000` for the WebUI and `5000` for the WebAPI (server) calls.
You can change these ports by going into

#### TypeScript WebPack
You can change the ports by editing the file [/client-ts-wp/config.js](https://github.com/ghiscoding/Realtime-TODO-Aurelia-Auth-RethinkDB/blob/master/client-ts-wp/config.js), the `webpack.config.js` and `package-scripts.js` were modifed to use the `config.js` configured ports.

## License
MIT

## NOTE
This TODO Realtime App was based on the official `aurelia-skeleton-webpack`, you can run any of the regular commands that were provided with the skeleton. See below for the official [aurelia-skeleton-webpack - README](https://github.com/aurelia/skeleton-navigation/tree/master/skeleton-typescript-webpack).

# aurelia-skeleton-webpack

## Getting started

Before you start, make sure you have a recent version of [NodeJS](http://nodejs.org/) environment *>=6.0* with NPM 3 or Yarn.

From the project folder, execute the following commands:

```shell
npm install # or: yarn install
```

This will install all required dependencies, including a local version of Webpack that is going to
build and bundle the app. There is no need to install Webpack globally.

To run the app execute the following command:

```shell
npm start # or: yarn start
```

This command starts the webpack development server that serves the build bundles.
You can now browse the skeleton app at http://localhost:8080 (or the next available port, notice the output of the command). Changes in the code
will automatically build and reload the app.

### Running with Hot Module Reload

If you wish to try out the experimental Hot Module Reload, you may run your application with the following command:

```shell
npm start -- webpack.server.hmr
```

## Feature configuration

Most of the configuration will happen in the `webpack.config.js` file.
There, you may configure advanced loader features or add direct SASS or LESS loading support.

## Bundling

To build an optimized, minified production bundle (output to /dist) execute:

```shell
npm start -- build
```

To build

To test either the development or production build execute:

```shell
npm start -- serve
```

The production bundle includes all files that are required for deployment.

## Running The Tests

This skeleton provides three frameworks for running tests.

You can choose one or two and remove the other, or even use all of them for different types of tests.

By default, both Jest and Karma are configured to run the same tests with Jest's matchers (see Jest documentation for more information).

If you wish to only run certain tests under one of the runners, wrap them in an `if`, like this:

```js
if (jest) {
  // since only jest supports creating snapshot:
  it('should render correctly', () => {
    expect(document.body.outerHTML).toMatchSnapshot();
  });
}
```

### Jest + Jasmine 2

Jest is a powerful unit testing runner and framework.
It runs really fast, however the tests are run under NodeJS, not the browser.
This means there might be some cases where something you'd expect works in reality, but fails in a test. One of those things will be SVG, which isn't supported under NodeJS. However, the framework is perfect for doing unit tests of pure functions, and works pretty well in combination with `aurelia-testing`.

To create new Jest tests, create files with the extension `.spec.ts`, either in the `src` directory or in the `test/unit` directory.

To run the Jest unit tests, run:

```shell
npm test
```

To run the Jest watcher (re-runs tests on changes), run:

```shell
npm start -- test.jest.watch
```

### Karma + Jasmine 2

Karma is also a powerful test runner, which by default runs in the browser. This means that whatever works in real browsers, should also work the same way in the unit tests. But it also means the framework is heavier to execute and not as lean to work with.

To ease transitioning between Jest and Karma, Jasmine 2 is configured with Jest's matchers.

To create new Karma tests, create files with the extension `.spec.ts`, either in the `src` directory or in the `test/unit` directory.

To run the Karma unit tests, run:

```shell
npm start -- test.karma
```

To run the Karma watcher (re-runs tests on changes), run:

```shell
npm start -- test.karma.watch
```

### Protractor (E2E / integration tests)

Integration tests can be performed with [Protractor](http://angular.github.io/protractor/#/).

1. Place your E2E-Tests into the folder ```test/e2e``` and name them with the extension `.e2e.ts`.

2. Run the tests by invoking

```shell
npm start -- e2e
```

## Running all test suites

To run all the unit test suites and the E2E tests, you may simply run:

```shell
npm start -- test.all
```
