'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://localhost:9000',
  SESSION_SECRET: 'starman-secret',
  FACEBOOK_ID: 'app-id',
  FACEBOOK_SECRET: 'secret',
  INSTAGRAM_ID: '0a1a272b794748249d1a850a8de7f467',
  INSTAGRAM_SECRET: 'fb1126b209fa4b21ba165a4a175dcc73',
  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
//# sourceMappingURL=local.env.js.map