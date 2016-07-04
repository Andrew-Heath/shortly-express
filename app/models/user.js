var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  username: null,
  password: null,
  salt: null
});

module.exports = User;