import { config } from '../../config';
import * as moment from 'moment';
import { decode, encode } from 'jwt-simple';
import * as Router from 'koa-router';

export const createJWT = (user: any): string => {
  const payload = {
    sub: user.id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return encode(payload, config.TOKEN_SECRET);
};

export const ensureAuthenticated = async (ctx: Router.IRouterContext, next: (arg: any) => void) => {
  try {
    if (!ctx.headers.authorization) {
      return ctx.throw(401, 'missing_authorization_header', { message: 'Please make sure your request has an Authorization header' });
    }
    const token = ctx.headers.authorization.split(' ')[1];
    let payload = null;
    try {
      payload = decode(token, config.TOKEN_SECRET);
    }
    catch (e) {
      ctx.status = 401;
      return ctx.body = { error: true, message: e.message };
    }

    if (payload.exp <= moment().unix()) {
      return ctx.throw(401, 'expired_token', { message: 'Token has expired' });
    }

    // pass userId to the next middleware
    ctx.state.userId = payload.sub;
    await next(payload.sub);
  } catch (e) {
    return ctx.throw(500, e.message);
  }
};
