'use strict';

module.exports = function (app) {
    app.use(require('./api/auth').routes());
    app.use(require('./api/todo').routes());
};
