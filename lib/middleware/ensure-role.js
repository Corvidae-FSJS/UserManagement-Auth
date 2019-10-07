module.exports = () => (req, res, next) => {
console.log(req.user);

  
  if(req.user.roles !== 'Admin') {
    next ({
      statusCode: 401,
      error: 'Access Denied'
    });
    return;
  }
  next();
}; 