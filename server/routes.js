'use strict';

module.exports = function (app) {
    app.use(require('./auth').routes());
    app.use(require('./api/customer').routes());
    app.use(require('./api/todo').routes());
};
