'use strict';

// Middlewares
const parse = require('co-body');
const request = require('koa-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');

exports.authenticate = function* (next) {
  try{
    var auth = yield parse(this);
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=id,name,email';
    var params = {
        code: auth.code,
        client_id: auth.clientId,
        client_secret: config.FACEBOOK_SECRET,
        redirect_uri: auth.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    var response = yield request.get(accessTokenUrl, { qs: params, json: true });
    var accessToken = response.body.access_token;
    if (response.statusCode !== 200) {
        this.status = 500;
        return this.body = { error: true, message: accessToken.error.message };
    }

    // Step 2. Retrieve profile information about the current user.
    var tokenParams = { access_token: accessToken };
    response = yield request.get(graphApiUrl, { qs: tokenParams, json: true });
    var profile = response.body;
    if (response.statusCode !== 200) {
      this.status = 500;
      return this.body = { error: true, message: profile.error.message };
    }

    // Step 3a. Link user accounts.
    if (this.headers.authorization) {
      var existingUser = yield User.findOne({ facebook: profile.id });

      if (existingUser && existingUser.length !== 0) {
        this.status = 409;
        return this.body = { error: true, message: 'There is already a Facebook account that belongs to you' };
      }
      var token = this.headers.authorization.split(' ')[1];
      var payload = jwt.decode(token, config.TOKEN_SECRET);

      var user = yield User.findById(payload.sub);
      if (!user) {
        this.status = 400;
        return this.body = { error: true, message: 'User not found' };
      }
      user.email = profile.email;
      user.facebook = profile.id;
      user.picture = user.picture || 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      var outputUser = yield User.save(user);
      var token = authUtils.createJWT(outputUser);
      return this.body = JSON.stringify({ token: token });
    }else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({ facebook: profile.id });
      if (existingUser) {
        var token = authUtils.createJWT(existingUser);
        return this.body = JSON.stringify({ token: token });
      }

      var user = {
        email: profile.email,
        facebook: profile.id,
        picture: 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large',
        displayName: profile.name
      };

      var updatedUser = yield User.save(user);
      var token = authUtils.createJWT(updatedUser);
      return this.body = JSON.stringify({ token: token });
    }
  } catch(e) {
    return this.throw(500, e.message);
  }
}
