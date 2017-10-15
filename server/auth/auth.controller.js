'use strict';

// Middlewares
const parse = require('co-body');
const _ = require('lodash');
const jwt = require('jwt-simple');
const authUtils = require('./authUtils');
const User = require('./userRethink.js');

exports.signup = async function (ctx, next) {
  try {
    let auth = await parse(ctx);
    let existingUser = await User.findOne({ email: auth.email });
    if(existingUser) {
      ctx.status = 409;
      return ctx.body = { error: true, message: 'Email is already taken' };
    }

    let user = {
      displayName: auth.displayName,
      email: auth.email,
      password: auth.password
    };

    let newUser = await User.save(user);
    let token = authUtils.createJWT(newUser);
    return ctx.body = JSON.stringify({ token: token });
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};

exports.login = async function (ctx, next) {
  try{
    let auth = await parse(ctx);
    let user = await User.findOne({ email: auth.email, password: auth.password });
    if(!user) {
      ctx.status = 401;
      return ctx.body = { error: true, message: 'Wrong email and/or password' };
    }
    return ctx.body = JSON.stringify({ token: authUtils.createJWT(user) });
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
