import { createJWT } from './authUtils';
import * as parse from 'co-body';
import { config } from '../../config';
import { decode, encode } from 'jwt-simple';
import * as Router from 'koa-router';
import { request } from './../utils/koa2-request';
import { User } from '../models/user.interface';
import * as userDbInstance from './userRethinkdb';

export const authenticate = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  let token = '';

  try {
    const auth = await parse(ctx);
    const accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
    const params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.WINDOWS_LIVE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    const postReponse = await request(accessTokenUrl, { method: 'POST', json: true, form: params });
    const accessToken = postReponse.body;

    // Step 2. Retrieve profile information about the current user.
    const profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
    const getResponse = await request(profileUrl, { method: 'GET', json: true });
    const profile = getResponse.body;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      const existingUser: User = await userDbInstance.findOne({ live: profile.id });

      if (existingUser) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Windows Live account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      const payload = decode(token, config.TOKEN_SECRET);

      const user: User = await userDbInstance.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }

      user.live = profile.id;
      user.picture = user.picture || 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large';
      user.displayName = user.displayName || profile.name;

      const outputUser: User = await userDbInstance.save(user);
      token = createJWT(outputUser);
      return ctx.body = JSON.stringify({ token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      const existingUser: User = await userDbInstance.findOne({ live: profile.id });
      if (existingUser) {
        token = createJWT(existingUser);
        return ctx.body = JSON.stringify({ token });
      }

      const user = {
        email: profile.emails.preferred,
        live: profile.id,
        picture: 'https://apis.live.net/v5.0/' + profile.id + '/picture?type=large',
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
