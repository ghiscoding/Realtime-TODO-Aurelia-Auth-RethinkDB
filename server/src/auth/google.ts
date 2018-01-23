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
    const accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    const peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    const params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.GOOGLE_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    const postResponse = await request(accessTokenUrl, { method: 'POST', json: true, form: params });
    const accessToken = postResponse.body.access_token;
    const headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    const getResponse = await request(peopleApiUrl, { method: 'GET', headers, json: true });
    const profile = getResponse.body;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      const existingUser: User = await userDbInstance.findOne({ google: profile.sub });

      if (existingUser) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a Google account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      const payload = decode(token, config.TOKEN_SECRET);

      const user: User = await userDbInstance.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.google = profile.sub;
      user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
      user.displayName = user.displayName || profile.name;

      const outputUser: User = await userDbInstance.save(user);
      token = createJWT(outputUser);
      return ctx.body = JSON.stringify({ token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      const existingUser: User = await userDbInstance.findOne({ google: profile.sub });
      if (existingUser) {
        token = createJWT(existingUser);
        return ctx.body = JSON.stringify({ token });
      }

      const user = {
        email: profile.email,
        google: profile.sub,
        picture: profile.picture.replace('sz=50', 'sz=200'),
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
