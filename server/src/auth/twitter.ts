import { createJWT } from './authUtils';
import * as parse from 'co-body';
import { config } from '../../config';
import { decode, encode } from 'jwt-simple';
import * as Router from 'koa-router';
import { request } from './../utils/koa2-request';
import * as qs from 'querystring';
import * as userDbInstance from './userRethinkdb';

interface TwitterOauth {
  oauth_verifier?: string;
  oauth_token?: string;
}

export const authenticate = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  let token = '';

  try {
    let auth: TwitterOauth;
    if (!!ctx.headers['content-type']) {
      auth = await parse(ctx);
    }

    const requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    const accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    const profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

    // Part 1 of 2: Initial request from Satellizer.
    if (!auth.oauth_token || !auth.oauth_verifier) {
      const requestTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        callback: config.TWITTER_CALLBACK
      };

      // Step 1. Obtain request token for the authorization popup.
      const obtainResponse = await request(requestTokenUrl, { method: 'POST', oauth: requestTokenOauth });
      const oauthToken = qs.parse(obtainResponse.body);

      // Step 2. Send OAuth token back to open the authorization screen.
      ctx.body = JSON.stringify(oauthToken);
    } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      const accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: auth.oauth_token,
        verifier: auth.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      const exchangeResponse = await request(accessTokenUrl, { method: 'POST', oauth: accessTokenOauth });
      const accessToken = qs.parse(exchangeResponse.body);

      const profileOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        oauth_token: accessToken.oauth_token
      };

      // Step 4. Retrieve profile information about the current user.
      const response = await request(profileUrl + accessToken.screen_name, { method: 'GET', oauth: profileOauth, json: true });
      const profile = response.body;

      // Step 5a. Link user accounts.
      if (ctx.headers.authorization) {
        const existingUser = await userDbInstance.findOne({ twitter: profile.id });

        if (existingUser) {
          ctx.status = 409;
          return ctx.body = { error: true, message: 'There is already a Twitter account that belongs to you' };
        }

        token = ctx.headers.authorization.split(' ')[1];
        const payload = decode(token, config.TOKEN_SECRET);

        const user = await userDbInstance.findById(payload.sub);
        if (!user) {
          ctx.status = 400;
          return ctx.body = { error: true, message: 'User not found' };
        }
        user.twitter = profile.id;
        user.displayName = user.displayName || profile.name;
        user.picture = user.picture || profile.profile_image_url.replace('_normal', '');

        const outputUser = await userDbInstance.save(user);
        token = createJWT(outputUser);
        return ctx.body = JSON.stringify({ token });
      } else {
        // Step 5b. Create a new user account or return an existing one.
        const existingUser = await userDbInstance.findOne({ twitter: profile.id });
        if (existingUser) {
          token = createJWT(existingUser);
          return ctx.body = JSON.stringify({ token });
        }

        const user = {
          // email: profile.email, // twitter doesn't provide email
          twitter: profile.id,
          picture: profile.profile_image_url.replace('_normal', ''),
          displayName: profile.name
        };

        const updatedUser = await userDbInstance.save(user);
        token = createJWT(updatedUser);
        return ctx.body = JSON.stringify({ token });
      }
    }
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
