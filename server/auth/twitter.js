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
    //if(this.type === "post" || this.status !== 404) {
    var auth = {};
    if(!!this.accept.headers['content-type']) {
        auth = yield parse(this);
      }

    //var auth = this.response.body || {}; // yield parse(this);
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
      var response = yield request.post(requestTokenUrl, { oauth: requestTokenOauth });
      var oauthToken = qs.parse(response.body);

      // Step 2. Send OAuth token back to open the authorization screen.
      //return this.response.body = oauthToken;
      this.body = JSON.stringify(oauthToken);
      //var auth = yield parse(this);
      //console.log(oauthToken);
    }else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      var accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: auth.oauth_token,
        verifier: auth.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      var response = yield request.post(accessTokenUrl, { oauth: accessTokenOauth });
      var accessToken = qs.parse(response.body);

      var profileOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      response = yield request.get(profileUrl + accessToken.screen_name, { oauth: profileOauth, json: true });
      var profile = response.body;

      // Step 5a. Link user accounts.
      if (this.headers.authorization) {
        var existingUser = yield User.findOne({ twitter: profile.id });

        if (existingUser) {
          this.status = 409;
          return this.body = { error: true, message: 'There is already a Twitter account that belongs to you' };
        }

        var token = this.headers.authorization.split(' ')[1];
        var payload = jwt.decode(token, config.TOKEN_SECRET);

        var user = yield User.findById(payload.sub);
        if (!user) {
          this.status = 400;
          return this.body = { error: true, message: 'User not found' };
        }
        user.twitter = profile.id;
        user.displayName = user.displayName || profile.name;
        user.picture = user.picture || profile.profile_image_url.replace('_normal', '');

        var outputUser = yield User.save(user);
        var token = authUtils.createJWT(outputUser);
        return this.body = JSON.stringify({ token: token });
      }else {
        // Step 5b. Create a new user account or return an existing one.
        var existingUser = yield User.findOne({ twitter: profile.id });
        if (existingUser) {
          var token = authUtils.createJWT(existingUser);
          return this.body = JSON.stringify({ token: token });
        }

        var user = {
          //email: profile.email, // twitter doesn't provide email
          twitter: profile.id,
          picture: profile.profile_image_url.replace('_normal', ''),
          displayName: profile.name
        };

        var updatedUser = yield User.save(user);
        var token = authUtils.createJWT(updatedUser);
        return this.body = JSON.stringify({ token: token });
      }
    }
  } catch(e) {
    return this.throw(500, e.message);
  }
}
