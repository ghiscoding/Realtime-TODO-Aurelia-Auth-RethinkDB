'use strict';

// Middlewares
const parse = require('co-body');
const request = require('koa-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');

exports.authenticate = function* (next) {
  try {
    var auth = yield parse(this);
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    var response = yield request.post(accessTokenUrl, { json: true, form: params });
    var accessToken = response.body.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    response = yield request.get(peopleApiUrl, { headers: headers, json: true });
    var profile = response.body;

    // Step 3a. Link user accounts.
    if (this.headers.authorization) {
      var existingUser = yield User.findOne({ google: profile.sub });

      if (existingUser && existingUser.length !== 0) {
        this.status = 409;
        return this.body = { error: true, message: 'There is already a Google account that belongs to you' };
      }
      var token = this.headers.authorization.split(' ')[1];
      var payload = jwt.decode(token, config.TOKEN_SECRET);

      var user = yield User.findById(payload.sub);
      if (!user) {
        this.status = 400;
        return this.body = { error: true, message: 'User not found' };
      }
      user.google = profile.sub;
      user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
      user.displayName = user.displayName || profile.name;

      var outputUser = yield User.save(user);
      var token = authUtils.createJWT(outputUser);
      return this.body = JSON.stringify({ token: token });
    }else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({ google: profile.sub });
      if (existingUser) {
        var token = authUtils.createJWT(existingUser);
        return this.body = JSON.stringify({ token: token });
      }

      var user = {
        email: profile.email,
        google: profile.sub,
        picture: profile.picture.replace('sz=50', 'sz=200'),
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
