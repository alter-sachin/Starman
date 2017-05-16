'use strict';
/*eslint no-invalid-this:0*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _user = require('./user.events');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.Promise = require('bluebird');

var authTypes = ['github', 'twitter', 'facebook', 'google', 'instagram'];

var UserSchema = new _mongoose.Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    required: function required() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  role: {
    type: String,
    default: 'user'
  },
  password: {
    type: String,
    required: function required() {
      if (authTypes.indexOf(this.provider) === -1) {
        return true;
      } else {
        return false;
      }
    }
  },
  provider: String,
  salt: String,
  facebook: {},
  github: {},
  instagram: {}
});

/**
 * Virtuals
 */

// Public profile information
UserSchema.virtual('profile').get(function () {
  return {
    name: this.name,
    role: this.role
  };
});

// Non-sensitive info we'll be putting in the token
UserSchema.virtual('token').get(function () {
  return {
    _id: this._id,
    role: this.role
  };
});

/**
 * Validations
 */

// Validate empty email
UserSchema.path('email').validate(function (email) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return email.length;
}, 'Email cannot be blank');

// Validate empty password
UserSchema.path('password').validate(function (password) {
  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }
  return password.length;
}, 'Password cannot be blank');

// Validate email is not taken
UserSchema.path('email').validate(function (value) {
  var _this = this;

  if (authTypes.indexOf(this.provider) !== -1) {
    return true;
  }

  return this.constructor.findOne({ email: value }).exec().then(function (user) {
    if (user) {
      if (_this.id === user.id) {
        return true;
      }
      return false;
    }
    return true;
  }).catch(function (err) {
    throw err;
  });
}, 'The specified email address is already in use.');

var validatePresenceOf = function validatePresenceOf(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
  var _this2 = this;

  // Handle new/update passwords
  if (!this.isModified('password')) {
    return next();
  }

  if (!validatePresenceOf(this.password)) {
    if (authTypes.indexOf(this.provider) === -1) {
      return next(new Error('Invalid password'));
    } else {
      return next();
    }
  }

  // Make salt with a callback
  this.makeSalt(function (saltErr, salt) {
    if (saltErr) {
      return next(saltErr);
    }
    _this2.salt = salt;
    _this2.encryptPassword(_this2.password, function (encryptErr, hashedPassword) {
      if (encryptErr) {
        return next(encryptErr);
      }
      _this2.password = hashedPassword;
      return next();
    });
  });
});

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} password
   * @param {Function} callback
   * @return {Boolean}
   * @api public
   */
  authenticate: function authenticate(password, callback) {
    var _this3 = this;

    if (!callback) {
      return this.password === this.encryptPassword(password);
    }

    this.encryptPassword(password, function (err, pwdGen) {
      if (err) {
        return callback(err);
      }

      if (_this3.password === pwdGen) {
        return callback(null, true);
      } else {
        return callback(null, false);
      }
    });
  },


  /**
   * Make salt
   *
   * @param {Number} [byteSize] - Optional salt byte size, default to 16
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  makeSalt: function makeSalt() {
    var byteSize = void 0;
    var callback = void 0;
    var defaultByteSize = 16;

    if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'function') {
      callback = arguments.length <= 0 ? undefined : arguments[0];
      byteSize = defaultByteSize;
    } else if (typeof (arguments.length <= 1 ? undefined : arguments[1]) === 'function') {
      callback = arguments.length <= 1 ? undefined : arguments[1];
    } else {
      throw new Error('Missing Callback');
    }

    if (!byteSize) {
      byteSize = defaultByteSize;
    }

    return _crypto2.default.randomBytes(byteSize, function (err, salt) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, salt.toString('base64'));
      }
    });
  },


  /**
   * Encrypt password
   *
   * @param {String} password
   * @param {Function} callback
   * @return {String}
   * @api public
   */
  encryptPassword: function encryptPassword(password, callback) {
    if (!password || !this.salt) {
      if (!callback) {
        return null;
      } else {
        return callback('Missing password or salt');
      }
    }

    var defaultIterations = 10000;
    var defaultKeyLength = 64;
    var salt = new Buffer(this.salt, 'base64');

    if (!callback) {
      // eslint-disable-next-line no-sync
      return _crypto2.default.pbkdf2Sync(password, salt, defaultIterations, defaultKeyLength, 'sha1').toString('base64');
    }

    return _crypto2.default.pbkdf2(password, salt, defaultIterations, defaultKeyLength, 'sha1', function (err, key) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, key.toString('base64'));
      }
    });
  }
};

(0, _user.registerEvents)(UserSchema);
exports.default = _mongoose2.default.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map
