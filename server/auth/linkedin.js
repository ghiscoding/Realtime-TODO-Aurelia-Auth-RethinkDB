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
    var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    var params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.LINKEDIN_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    var response = yield request.post(accessTokenUrl, { form: params, json: true });
    var accessToken = response.body.access_token;
    if (response.statusCode !== 200) {
        this.status = response.statusCode;
        return this.body = { error: true, message: body.error_description };
    }
    var params = {
      oauth2_access_token: response.body.access_token,
      format: 'json'
    };

    // Step 2. Retrieve profile information about the current user.
    response = yield request.get({ url: peopleApiUrl, qs: params, json: true });
    var profile = response.body;

    // Step 3a. Link user accounts.
    if (this.headers.authorization) {
      var existingUser = yield User.findOne({ linkedin: profile.id });

      if (existingUser) {
        this.status = 409;
        return this.body = { error: true, message: 'There is already a LinkedIn account that belongs to you' };
      }
      var token = this.headers.authorization.split(' ')[1];
      var payload = jwt.decode(token, config.TOKEN_SECRET);

      var user = yield User.findById(payload.sub);
      if (!user) {
        this.status = 400;
        return this.body = { error: true, message: 'User not found' };
      }
      user.linkedin = profile.id;
      user.picture = user.picture || profile.pictureUrl;
      user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;

      var outputUser = yield User.save(user);
      var token = authUtils.createJWT(outputUser);
      return this.body = JSON.stringify({ token: token });
    }else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({ linkedin: profile.id });
      if (existingUser) {
        var token = authUtils.createJWT(existingUser);
        return this.body = JSON.stringify({ token: token });
      }

      var user = {
        email: profile.emailAddress,
        linkedin: profile.id,
        picture: profile.pictureUrl,
        displayName: profile.firstName + ' ' + profile.lastName
      };

      var updatedUser = yield User.save(user);
      var token = authUtils.createJWT(updatedUser);
      return this.body = JSON.stringify({ token: token });
    }
  } catch(e) {
    return this.throw(500, e.message);
  }
}
