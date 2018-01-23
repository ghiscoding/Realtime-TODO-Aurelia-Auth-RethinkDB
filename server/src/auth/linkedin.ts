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
    const accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    const peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    const params = {
      code: auth.code,
      client_id: auth.clientId,
      client_secret: config.LINKEDIN_SECRET,
      redirect_uri: auth.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    const postResponse = await request(accessTokenUrl, { method: 'POST', form: params, json: true });
    const accessToken = postResponse.body.access_token;
    if (postResponse.statusCode !== 200) {
      ctx.status = postResponse.statusCode;
      return ctx.body = { error: true, message: postResponse.body.error_description };
    }
    const params2 = {
      oauth2_access_token: postResponse.body.access_token,
      format: 'json'
    };

    // Step 2. Retrieve profile information about the current user.
    const getResponse = await request(peopleApiUrl, { method: 'GET', qs: params2, json: true });
    const profile = getResponse.body;

    // Step 3a. Link user accounts.
    if (ctx.headers.authorization) {
      const existingUser: User = await userDbInstance.findOne({ linkedin: profile.id });

      if (existingUser) {
        ctx.status = 409;
        return ctx.body = { error: true, message: 'There is already a LinkedIn account that belongs to you' };
      }
      token = ctx.headers.authorization.split(' ')[1];
      const payload = decode(token, config.TOKEN_SECRET);

      const user: User = await userDbInstance.findById(payload.sub);
      if (!user) {
        ctx.status = 400;
        return ctx.body = { error: true, message: 'User not found' };
      }
      user.linkedin = profile.id;
      user.picture = user.picture || profile.pictureUrl;
      user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;

      const outputUser: User = await userDbInstance.save(user);
      token = createJWT(outputUser);

      return ctx.body = JSON.stringify({ token });
    } else {
      // Step 3b. Create a new user account or return an existing one.
      const existingUser: User = await userDbInstance.findOne({ linkedin: profile.id });
      if (existingUser) {
        token = createJWT(existingUser);
        return ctx.body = JSON.stringify({ token });
      }

      const user = {
        email: profile.emailAddress,
        linkedin: profile.id,
        picture: profile.pictureUrl,
        displayName: profile.firstName + ' ' + profile.lastName
      };

      const updatedUser: User = await userDbInstance.save(user);
      token = createJWT(updatedUser);
      return ctx.body = JSON.stringify({ token });
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
