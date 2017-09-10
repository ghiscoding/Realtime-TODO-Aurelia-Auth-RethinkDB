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
    let accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
    let params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.WINDOWS_LIVE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    let postReponse = await request(accessTokenUrl, { method: 'POST', json: true, form: params });
    let accessToken = postReponse.body;

    // Step 2. Retrieve profile information about the current user.
    let profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
    let getResponse = await request(profileUrl, { method: 'GET', json: true });
    let profile = getResponse.body;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      let existingUser = await User.findOne({ live: profile.id });

      if (existingUser && existingUser.length !== 0) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Windows Live account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      let payload = jwt.decode(token, config.TOKEN_SECRET);

      let user = await User.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }

      user.live = profile.id;
      user.picture = user.picture || 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      let outputUser = await User.save(user);
      token = authUtils.createJWT(outputUser);
      return ctx.body = JSON.stringify({ token: token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      let existingUser = await User.findOne({ live: profile.id });
      if (existingUser) {
        token = authUtils.createJWT(existingUser);
        return ctx.body = JSON.stringify({ token: token });
      }

      let user = {
        email: profile.emails.preferred,
        live: profile.id,
        picture: 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large',
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
