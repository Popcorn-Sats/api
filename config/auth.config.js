module.exports = {
  security: {
    jwt: {
      secret: "popcorn-secret-key",
      jwtExpiration: 600,           // 10 minutes
      jwtRefreshExpiration: 86400,   // 24 hours
      /* for test */
      // jwtExpiration: 60,          // 1 minute
      // jwtRefreshExpiration: 120,  // 2 minutes
    }
  }
};
