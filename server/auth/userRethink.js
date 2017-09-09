'use strict';

// Middlewares
const bcrypt = require('bcryptjs');
const config = require('../config');
const r = require('rethinkdbdash')(config.rethinkdb);

exports.comparePassword = function (password, done) {
  bcrypt.compare(password, this.password, function (err, isMatch) {
    done(err, isMatch);
  });
};

exports.createUser = async function (userObject) {
  return await r.table("users")
    .insert(userObject, { returnChanges: true })
    .merge({
      createdAt: r.now()
    })
    .run()
    .then(function (result) {
      return result.changes[0].new_val;
    });
};

exports.findById = async function (userId) {
  return await r.table("users")
    .get(userId)
    .run();
};

exports.findOne = async function (filterObject) {
  var result = await r.table("users")
    .filter(filterObject)
    .limit(1)
    .run();

  return result[0];
};

exports.save = async function (userObject) {
  if (!!userObject.id) {
    return await this.updateById(userObject.id, userObject);
  } else {
    return await this.createUser(userObject);
  }
};

exports.updateById = async function (userId, userObject) {
  if (userId) {
    return await r.table("users")
      .get(userId)
      .update(userObject, { returnChanges: true })
      .merge({
        updatedAt: r.now()
      })
      .run()
      .then(function (result) {
        return result.changes[0].new_val;
      });
  } else {
    return null;
  }
};
