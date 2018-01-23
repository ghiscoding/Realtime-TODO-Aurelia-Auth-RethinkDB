import { createJWT } from './authUtils';
import { decode, encode } from 'jwt-simple';
import * as parse from 'co-body';
import * as Router from 'koa-router';
import { User } from '../models/user.interface';
import * as userDbInstance from './userRethinkdb';

export const getMe = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  try {
    const user: User = await userDbInstance.findById(ctx.state.userId);
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

export const updateMe = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  try {
    const user: User = await userDbInstance.findById(ctx.user);

    if (!user) {
      ctx.status = 400;
      return ctx.body = { error: true, message: 'User not found' };
    }
    user.displayName = ctx.body.displayName || user.displayName;
    user.email = ctx.body.email || user.email;

    const updatedUser: User = await userDbInstance.save(user);
    if (updatedUser) {
      ctx.status = 200;
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};

export const unlink = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  try {
    const provider = ctx.params.provider;
    const providers = ['facebook', 'foursquare', 'google', 'github', 'linkedin', 'live', 'twitter', 'yahoo', 'identSrv'];

    if (providers.indexOf(provider) === -1) {
      ctx.status = 404;
      return ctx.body = { error: true, message: 'Unknown provider' };
    }

    const user: User = await userDbInstance.findById(ctx.state.userId);
    if (!user) {
      ctx.status = 404;
      return ctx.body = { error: true, message: 'User not found' };
    }

    // make the provider null in DB
    user[provider] = null;

    const updatedUser: User = await userDbInstance.save(user);
    if (updatedUser) {
      ctx.status = 200;
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
