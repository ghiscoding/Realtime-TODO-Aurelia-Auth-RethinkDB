'use strict';

// Middlewares
const parse = require('co-body');
const request = require('koa2-request');
const jwt = require('jwt-simple');
const config = require('../config');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');
const qs = require('querystring');

exports.authenticate = async function (ctx, next) {
  try {
    var auth = {};
    if (!!ctx.accept.headers['content-type']) {
      auth = await parse(ctx);
    }

    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

    // Part 1 of 2: Initial request from Satellizer.
    if (!auth.oauth_token || !auth.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        callback: config.TWITTER_CALLBACK
      };

      // Step 1. Obtain request token for the authorization popup.
      var response = await request(requestTokenUrl, { method: 'POST', oauth: requestTokenOauth });
      var oauthToken = qs.parse(response.body);

      // Step 2. Send OAuth token back to open the authorization screen.
      ctx.body = JSON.stringify(oauthToken);
    } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      var accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: auth.oauth_token,
        verifier: auth.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      var response = await request(accessTokenUrl, { method: 'POST', oauth: accessTokenOauth });
      var accessToken = qs.parse(response.body);

      var profileOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      response = await request(profileUrl + accessToken.screen_name, { method: 'GET', oauth: profileOauth, json: true });
      var profile = response.body;

      // Step 5a. Link user accounts.
      if (ctx.headers.authorization) {
        var existingUser = await User.findOne({ twitter: profile.id });

        if (existingUser) {
          ctx.status = 409;
          return ctx.body = { error: true, message: 'There is already a Twitter account that belongs to you' };
        }

        var token = ctx.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);

        var user = await User.findById(payload.sub);
        if (!user) {
          ctx.status = 400;
          return ctx.body = { error: true, message: 'User not found' };
        }
        user.twitter = profile.id;
        user.displayName = user.displayName || profile.name;
        user.picture = user.picture || profile.profile_image_url.replace('_normal', '');

        var outputUser = await User.save(user);
        var token = authUtils.createJWT(outputUser);
        return ctx.body = JSON.stringify({ token: token });
      } else {
        // Step 5b. Create a new user account or return an existing one.
        var existingUser = await User.findOne({ twitter: profile.id });
        if (existingUser) {
          var token = authUtils.createJWT(existingUser);
          return ctx.body = JSON.stringify({ token: token });
        }

        var user = {
          //email: profile.email, // twitter doesn't provide email
          twitter: profile.id,
          picture: profile.profile_image_url.replace('_normal', ''),
          displayName: profile.name
        };

        var updatedUser = await User.save(user);
        var token = authUtils.createJWT(updatedUser);
        return ctx.body = JSON.stringify({ token: token });
      }
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
}
