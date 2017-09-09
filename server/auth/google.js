'use strict';

// Middlewares
const parse = require('co-body');
const request = require('async-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');

exports.authenticate = async function (ctx, next) {
  let token = '';

  try {
    let auth = await parse(ctx);
    let accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    let peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    let params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    let postReponse = await request(accessTokenUrl, { method: 'POST', data: params });
    let jsonPostResponse = JSON.parse(postReponse.body);

    let accessToken = jsonPostResponse.access_token;
    let headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    let getResponse = await request(peopleApiUrl, { method: 'GET', headers: headers });
    let jsonGetResponse = JSON.parse(getResponse.body);
    let profile = jsonGetResponse;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      let existingUser = await User.findOne({ google: profile.sub });

      if (existingUser && existingUser.length !== 0) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Google account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      let payload = jwt.decode(token, config.TOKEN_SECRET);

      let user = await User.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.google = profile.sub;
      user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
      user.displayName = user.displayName || profile.name;

      let outputUser = await User.save(user);
      token = authUtils.createJWT(outputUser);
      return ctx.body = JSON.stringify({ token: token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      let existingUser = await User.findOne({ google: profile.sub });
      if (existingUser) {
        token = authUtils.createJWT(existingUser);
        return ctx.body = JSON.stringify({ token: token });
      }

      let user = {
        email: profile.email,
        google: profile.sub,
        picture: profile.picture.replace('sz=50', 'sz=200'),
        displayName: profile.name
      };

      let updatedUser = await User.save(user);
      token = authUtils.createJWT(updatedUser);
      return ctx.body = JSON.stringify({ token: token });
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
