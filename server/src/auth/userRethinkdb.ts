import { compare } from 'bcryptjs';
import { config } from '../../config';
import * as Router from 'koa-router';
import * as rethinkdb from 'rethinkdb';
import * as rethinkdbdash from 'rethinkdbdash';
import { User } from '../models/user.interface';

// RethinkDB table & reQl instance
const TABLE_NAME = 'users';
const r: any = rethinkdbdash(config.rethinkdb);

export const comparePassword = (firstPassword: string, secondPassword: string, callback: (err: Error, success: boolean) => void) => {
  compare(firstPassword, secondPassword, (err: Error, success: boolean) => callback(err, success));
};

export const createUser = async (user: User): Promise<User> => {
  return await r.table(TABLE_NAME)
  .insert(user, { returnChanges: true })
  .merge({
    createdAt: r.now()
  })
  .run()
  .then((result: any) => {
    return result.changes[0].new_val;
  });
};

export const findById = async (userId: string): Promise<User> => {
  return await r.table(TABLE_NAME)
  .get(userId)
  .run();
};

export const findOne = async (filters: any): Promise<User> => {
  const result = await r.table(TABLE_NAME)
    .filter(filters)
    .limit(1)
    .run();

  return result[0];
};

export const save = async (user: User): Promise<User> => {
  if (!!user.id) {
    return await this.updateById(user.id, user);
  } else {
    return await this.createUser(user);
  }
};

export const updateById = async (userId: string, user: User): Promise<User | null> => {
  if (userId) {
    return await r.table(TABLE_NAME)
      .get(userId)
      .update(user, { returnChanges: true })
      .merge({
        updatedAt: r.now()
      })
      .run()
      .then((result: any) => {
        return result.changes[0].new_val;
      });
  } else {
    return null;
  }
};
