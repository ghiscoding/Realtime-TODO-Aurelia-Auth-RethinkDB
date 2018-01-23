import * as parse from 'co-body';
import { createJWT } from './authUtils';
import * as Router from 'koa-router';
import { User } from '../models/user.interface';
import * as userDbInstance from './userRethinkdb';

export const signup = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const auth = await parse(ctx);
    const existingUser = await userDbInstance.findOne({ email: auth.email });
    if (existingUser) {
      ctx.status = 409;
      return ctx.body = { error: true, message: 'Email is already taken' };
    }

    const user = {
      displayName: auth.displayName,
      email: auth.email,
      password: auth.password
    };

    const newUser: User = await userDbInstance.save(user);
    const token = createJWT(newUser);
    return ctx.body = JSON.stringify({ token });
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};

export const login = async (ctx: Router.IRouterContext, next: () => void) => {
  try {
    const auth = await parse(ctx);
    const user: User = await userDbInstance.findOne({ email: auth.email, password: auth.password });
    if (!user) {
      ctx.status = 401;
      return ctx.body = { error: true, message: 'Wrong email and/or password' };
    }
    return ctx.body = JSON.stringify({ token: createJWT(user) });
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
