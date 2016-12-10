'use strict';

var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config');

exports.createJWT = function(user) {
    var payload = {
        sub: user.id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
};

exports.ensureAuthenticated = function* (next) {
  try{
    if (!this.headers.authorization) {
      return this.throw(401, 'missing_authorization_header', { message: 'Please make sure your request has an Authorization header' });
    }
    var token = this.headers.authorization.split(' ')[1];
    var payload = null;
    try {
      payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (e) {
      this.status = 401;
      return this.body = { error: true, message: e.message };
    }

    if (payload.exp <= moment().unix()) {
      return this.throw(401, 'expired_token', { message: 'Token has expired' });
    }
    this.request.userId = payload.sub;
    yield next;
  } catch(e) {
      return this.throw(500, e.message);
  }
};
