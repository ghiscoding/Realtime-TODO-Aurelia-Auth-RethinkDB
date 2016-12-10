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
    var accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
    var params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.WINDOWS_LIVE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    var response = yield request.post(accessTokenUrl, { json: true, form: params });
    var accessToken = response.body;

    // Step 2. Retrieve profile information about the current user.
    var profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
    response = yield request.get(profileUrl, { json: true });
    var profile = response.body;

    // Step 3a. Link user accounts.
    if (this.headers.authorization) {
      var existingUser = yield User.findOne({ live: profile.id });

      if (existingUser && existingUser.length !== 0) {
        this.status = 409;
        return this.body = { error: true, message: 'There is already a Windows Live account that belongs to you' };
      }
      var token = this.headers.authorization.split(' ')[1];
      var payload = jwt.decode(token, config.TOKEN_SECRET);

      var user = yield User.findById(payload.sub);
      if (!user) {
        this.status = 400;
        return this.body = { error: true, message: 'User not found' };
      }

      user.live = profile.id;
      user.picture = user.picture || 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      var outputUser = yield User.save(user);
      var token = authUtils.createJWT(outputUser);
      return this.body = JSON.stringify({ token: token });
    }else {
      // Step 3b. Create a new user account or return an existing one.
      var existingUser = yield User.findOne({ live: profile.id });
      if (existingUser) {
        var token = authUtils.createJWT(existingUser);
        return this.body = JSON.stringify({ token: token });
      }

      var user = {
        email: profile.emails.preferred,
        live: profile.id,
        picture: 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large',
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


/*
exports.authenticate = function (req, res) {
  async.waterfall([
    // Step 1. Exchange authorization code for access token.
    function(done) {
      var accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
      var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: config.WINDOWS_LIVE_SECRET,
        redirect_uri: req.body.redirectUri,
        grant_type: 'authorization_code'
      };
      request.post(accessTokenUrl, { form: params, json: true }, function(err, response, accessToken) {
        done(null, accessToken);
      });
    },
    // Step 2. Retrieve profile information about the current user.
    function(accessToken, done) {
      var profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
      request.get({ url: profileUrl, json: true }, function(err, response, profile) {
        done(err, profile);
      });
    },
    function(profile) {
      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ live: profile.id }, function(err, user) {
          if (user) {
            return res.status(409).send({ message: 'There is already a Windows Live account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, existingUser) {
            if (!existingUser) {
              return res.status(400).send({ message: 'User not found' });
            }
            existingUser.live = profile.id;
            existingUser.displayName = existingUser.displayName || profile.name;
            existingUser.save(function() {
              var token = authUtils.createJWT(existingUser);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user or return an existing account.
        User.findOne({ live: profile.id }, function(err, user) {
          if (user) {
            return res.send({ token: authUtils.createJWT(user) });
          }
          var newUser = new User();
          newUser.live = profile.id;
          newUser.displayName = profile.name;
          newUser.save(function() {
            var token = authUtils.createJWT(newUser);
            res.send({ token: token });
          });
        });
      }
    }
  ]);
}
*/
