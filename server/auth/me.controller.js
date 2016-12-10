'use strict';

// Middlewares
const parse = require('co-body');
var _ = require('lodash');
var jwt = require('jwt-simple');
var User = require('./userRethink.js');

exports.getMe = function* () {
  try{
    var user = yield User.findById(this.request.userId);
    if(!user) {
      this.status = 404;
      return this.body = { error: true, message: 'User not found' };
    }
    this.body = user;
    return this;
  } catch(e) {
      return this.throw(500, e.message);
  }
};

exports.updateMe = function* (next) {
  try {
    var user = yield User.findById(this.user);

    if (!user) {
      this.status = 400;
      return this.body = { error: true, message: 'User not found' };
    }
    user.displayName = this.body.displayName || user.displayName;
    user.email = this.body.email || user.email;

    var updatedUser = yield User.save(user);
    if(updatedUser) {
      this.status = 200;
    }
  } catch(e) {
    return this.throw(500, e.message);
  }
};

exports.unlink = function* (next){
  try {
    var provider = this.params.provider;
    var providers = ['facebook', 'foursquare', 'google', 'github', 'linkedin', 'live', 'twitter', 'yahoo','identSrv'];

    if (providers.indexOf(provider) === -1) {
      this.status = 404;
      return this.body = { error: true, message: 'Unknown provider' };
    }

    var user = yield User.findById(this.request.userId);
    if(!user) {
      this.status = 404;
      return this.body = { error: true, message: 'User not found' };
    }

    // make the provider null in DB
    user[provider] = null;

    var updatedUser = yield User.save(user);
    if(updatedUser) {
      this.status = 200;
    }
  } catch(e) {
    return this.throw(500, e.message);
  }
};
