'use strict';

module.exports = function (app) {
    app.use(require('./auth').routes());
    app.use(require('./api/customers').routes());
    app.use(require('./api/todo').routes());
};
