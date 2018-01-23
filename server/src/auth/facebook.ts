import { createJWT } from './authUtils';
import * as parse from 'co-body';
import { config } from '../../config';
import { decode, encode } from 'jwt-simple';
import * as Router from 'koa-router';
import { request } from './../utils/koa2-request';
import * as qs from 'querystring';
import { User } from '../models/user.interface';
import * as userDbInstance from './userRethinkdb';

export const authenticate = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  let token = '';

  try {
    const auth = await parse(ctx);
    const accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    const graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=id,name,email';
    const params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.FACEBOOK_SECRET,
      redirect_uri: auth.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    const getResponse1 = await request(accessTokenUrl, { method: 'GET', qs: params, json: true });
    const accessToken = getResponse1.body.access_token;

    if (getResponse1.statusCode !== 200) {
      ctx.status = 500;
      return ctx.body = { error: true, message: accessToken.error.message };
    }

    // Step 2. Retrieve profile information about the current user.
    const tokenParams = { access_token: accessToken };
    const getResponse2 = await request(graphApiUrl, { method: 'GET', qs: tokenParams, json: true });
    const profile = getResponse2.body;

    if (getResponse2.statusCode !== 200) {
      ctx.status = 500;
      return ctx.body = { error: true, message: profile.error.message };
    }

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      const existingUser: User = await userDbInstance.findOne({ facebook: profile.id });

      if (existingUser) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Facebook account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      const payload = decode(token, config.TOKEN_SECRET);

      const user: User = await userDbInstance.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.email = profile.email;
      user.facebook = profile.id;
      user.picture = user.picture || 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      const outputUser: User = await userDbInstance.save(user);
      token = createJWT(outputUser);
      return ctx.body = JSON.stringify({ token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      const existingUser: User = await userDbInstance.findOne({ facebook: profile.id });
      if (existingUser) {
        token = createJWT(existingUser);
        return ctx.body = JSON.stringify({ token });
      }

      const user = {
        email: profile.email,
        facebook: profile.id,
        picture: 'https://graph.facebook.com/v2.5/' + profile.id + '/picture?type=large',
        displayName: profile.name
      };

      const updatedUser: User = await userDbInstance.save(user);
      token = createJWT(updatedUser);
      return ctx.body = JSON.stringify({ token });
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
