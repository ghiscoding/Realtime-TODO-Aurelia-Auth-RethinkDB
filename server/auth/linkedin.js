'use strict';

// Middlewares
const parse = require('co-body');
const request = require('koa2-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');

exports.authenticate = async function (ctx, next) {
  let token = '';

  try {
    let auth = await parse(ctx);
    let accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    let peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    let params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.LINKEDIN_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    let postResponse = await request(accessTokenUrl, { method: 'POST', form: params, json: true });
    let accessToken = postResponse.body.access_token;
    if (postResponse.statusCode !== 200) {
      ctx.status = postResponse.statusCode;
      return ctx.body = { error: true, message: postResponse.body.error_description };
    }
    let params2 = {
      oauth2_access_token: postResponse.body.access_token,
      format: 'json'
    };

    // Step 2. Retrieve profile information about the current user.
    let getResponse = await request(peopleApiUrl, { method: 'GET', qs: params2, json: true });
    let profile = getResponse.body;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      let existingUser = await User.findOne({ linkedin: profile.id });

      if (existingUser) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a LinkedIn account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      let payload = jwt.decode(token, config.TOKEN_SECRET);

      let user = await User.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.linkedin = profile.id;
      user.picture = user.picture || profile.pictureUrl;
      user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;

      let outputUser = await User.save(user);
      token = authUtils.createJWT(outputUser);

      return ctx.body = JSON.stringify({ token: token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      let existingUser = await User.findOne({ linkedin: profile.id });
      if (existingUser) {
        token = authUtils.createJWT(existingUser);
        return ctx.body = JSON.stringify({ token: token });
      }

      let user = {
        email: profile.emailAddress,
        linkedin: profile.id,
        picture: profile.pictureUrl,
        displayName: profile.firstName + ' ' + profile.lastName
      };

      let updatedUser = await User.save(user);
      token = authUtils.createJWT(updatedUser);
      return ctx.body = JSON.stringify({ token: token });
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
}
