const tokenService = require('../token-service');

module.exports = () => (req, res, next) => {
  tokenService.sign(req.user);
  if(req.user.roles !== 'Admin') {
    next ({
      statusCode: 401,
      error: 'Access Denied'
    });
    return;
  }
  next();
}; 