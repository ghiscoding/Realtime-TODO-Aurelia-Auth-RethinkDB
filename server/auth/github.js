'use strict';
// Middlewares
const parse = require('co-body');
const request = require('koa-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');
const qs = require('querystring');

exports.authenticate = function* (next) {
  try{
    var auth = yield parse(this);
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.GITHUB_SECRET,
      redirect_uri: auth.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    var response = yield request.get({ url: accessTokenUrl, qs: params });
    var accessToken = qs.parse(response.body);
    var headers = { 'User-Agent': 'Aurelia' };

    // Step 2. Retrieve profile information about the current user.
    response = yield request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true });
    var profile = response.body;
    if (response.statusCode !== 200) {
      this.status = 500;
      return this.body = { error: true, message: profile.error.message };
    }

    // Step 3a. Link user accounts.
    if (this.headers.authorization) {
      var existingUser = yield User.findOne({ github: profile.id });

      if (existingUser) {
        this.status = 409;
        return this.body = { error: true, message: 'There is already a Github account that belongs to you' };
      }
      var token = this.headers.authorization.split(' ')[1];
      var payload = jwt.decode(token, config.TOKEN_SECRET);

      var user = yield User.findById(payload.sub);
      if (!user) {
        this.status = 400;
        return this.body = { error: true, message: 'User not found' };
      }
      user.email = profile.email;
      user.github = profile.id;
      user.picture = user.picture || profile.avatar_url + "&size=200";
      user.displayName = user.displayName || profile.name;

      var outputUser = yield User.save(user);
      var token = authUtils.createJWT(outputUser);
      return this.body = JSON.stringify({ token: token });
    }else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({ github: profile.id });
      if (existingUser) {
        var token = authUtils.createJWT(existingUser);
        return this.body = JSON.stringify({ token: token });
      }

      var user = {
        email: profile.email,
        github: profile.id,
        picture: profile.avatar_url + "&size=200",
        displayName: profile.name
      };

      var updatedUser = yield User.save(user);
      var token = authUtils.createJWT(updatedUser);
      return this.body = JSON.stringify({ token: token });
    }
  } catch(e) {
    return this.throw(500, e.message || e);
  }
};
