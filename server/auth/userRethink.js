'use strict';

// Middlewares
const bcrypt = require('bcryptjs');
const config = require('../config');
const r = require('rethinkdbdash')(config.rethinkdb);

exports.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
      done(err, isMatch);
  });
};

exports.createUser = function* (userObject) {
  return yield r.table("users")
    .insert(userObject, { returnChanges: true })
    .merge({
      createdAt: r.now()
    })
    .run()
    .then(function(result) {
      return result.changes[0].new_val;
    });
};

exports.findById = function* (userId) {
  return yield r.table("users")
    .get(userId)
    .run();
};

exports.findOne = function* (filterObject) {
  var result = yield r.table("users")
    .filter(filterObject)
    .limit(1)
    .run();

  return result[0];
};

exports.save = function* (userObject) {
  if(!!userObject.id) {
    return yield this.updateById(userObject.id, userObject);
  }else {
    return yield this.createUser(userObject);
  }
};

exports.updateById = function* (userId, userObject) {
  if(userId) {
    return yield r.table("users")
      .get(userId)
      .update(userObject, { returnChanges: true })
      .merge({
        updatedAt: r.now()
      })
      .run()
      .then(function(result) {
        return result.changes[0].new_val;
      });
  }else {
    return null;
  }
};
