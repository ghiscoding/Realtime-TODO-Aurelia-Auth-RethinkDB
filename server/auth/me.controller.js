'use strict';

// Middlewares
const parse = require('co-body');
const _ = require('lodash');
const jwt = require('jwt-simple');
const User = require('./userRethink.js');

exports.getMe = async function (ctx, next) {
  try {
    let user = await User.findById(ctx.state.userId);
    if (!user) {
      ctx.status = 404;
      return ctx.body = { error: true, message: 'User not found' };
    }
    ctx.body = user;
    return ctx;
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};

exports.updateMe = async function (ctx, next) {
  try {
    let user = await User.findById(ctx.user);

    if (!user) {
      ctx.status = 400;
      return ctx.body = { error: true, message: 'User not found' };
    }
    user.displayName = ctx.body.displayName || user.displayName;
    user.email = ctx.body.email || user.email;

    let updatedUser = await User.save(user);
    if (updatedUser) {
      ctx.status = 200;
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};

exports.unlink = async function (ctx, next) {
  try {
    let provider = ctx.params.provider;
    let providers = ['facebook', 'foursquare', 'google', 'github', 'linkedin', 'live', 'twitter', 'yahoo', 'identSrv'];

    if (providers.indexOf(provider) === -1) {
      ctx.status = 404;
      return ctx.body = { error: true, message: 'Unknown provider' };
    }

    let user = await User.findById(ctx.state.userId);
    if (!user) {
      ctx.status = 404;
      return ctx.body = { error: true, message: 'User not found' };
    }

    // make the provider null in DB
    user[provider] = null;

    let updatedUser = await User.save(user);
    if (updatedUser) {
      ctx.status = 200;
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
