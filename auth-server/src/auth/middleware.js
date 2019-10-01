'use strict';

const User = require('./users-model.js');

module.exports = (req, res, next) => {

  try {
  
    let [authType, encodedString] = req.headers.authorization.split(/\s+/);

    // BASIC Auth  ... Authorization:Basic ZnJlZDpzYW1wbGU=

    switch(authType.toLowerCase()) {
      case 'basic':
        return _authBasic(encodedString);
      default:
        return _authError();
    }

  } catch(e) {
    return _authError();
  }

  function _authBasic(authString) {
    let base64Buffer = Buffer.from(authString,'base64'); // <Buffer 01 02...>
    let bufferString = base64Buffer.toString(); // john:mysecret
    let [username,password] = bufferString.split(':');  // variables username="john" and password="mysecret"
    let auth = [username,password];  // {username:"john", password:"mysecret"}

if (!password) {
  return _authError();
}

    return User.authenticateBasic(auth)
      .then( user => _authenticate(user))
      .catch(_authError);
  }

  async function _authenticate(user) {
    if ( user ) {
      req.token = user.generateToken();
      req.user = user;
      next();
    }
    else {
     await _authError();
    }
  }

  async function _authError(error) {
    req.user = null;
    return next({
      error,
      status: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid User ID/Password'
      });
  }

};

