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
    let accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    let graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=id,name,email';
    let params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: auth.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    let getResponse1 = await request(accessTokenUrl, { method: 'GET', qs: params, json: true });
    let accessToken = getResponse1.body.access_token;

    if (getResponse1.statusCode !== 200) {
      ctx.status = 500;
      return ctx.body = { error: true, message: accessToken.error.message };
    }

    // Step 2. Retrieve profile information about the current user.
    let tokenParams = { access_token: accessToken };
    let getResponse2 = await request(graphApiUrl, { method: 'GET', qs: tokenParams, json: true });
    let profile = getResponse2.body;

    if (getResponse2.statusCode !== 200) {
      ctx.status = 500;
      return ctx.body = { error: true, message: profile.error.message };
    }

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      let existingUser = await User.findOne({ facebook: profile.id });

      if (existingUser && existingUser.length !== 0) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Facebook account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      let payload = jwt.decode(token, config.TOKEN_SECRET);

      let user = await User.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.email = profile.email;
      user.facebook = profile.id;
      user.picture = user.picture || 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      let outputUser = await User.save(user);
      token = authUtils.createJWT(outputUser);
      return ctx.body = JSON.stringify({ token: token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      let existingUser = await User.findOne({ facebook: profile.id });
      if (existingUser) {
        token = authUtils.createJWT(existingUser);
        return ctx.body = JSON.stringify({ token: token });
      }

      let user = {
        email: profile.email,
        facebook: profile.id,
        picture: 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large',
        displayName: profile.name
      };

      let updatedUser = await User.save(user);
      token = authUtils.createJWT(updatedUser);
      return ctx.body = JSON.stringify({ token: token });
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
}
