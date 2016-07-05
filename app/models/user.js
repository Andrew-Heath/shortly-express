var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,

  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      model.attributes.salt = bcrypt.genSaltSync(10);
      model.attributes.password = bcrypt.hashSync(model.attributes.password, model.attributes.salt);
    });
  }

});

module.exports = User;