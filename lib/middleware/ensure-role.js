module.exports = () => (req, res, next) => {
  const { payload } = req.payload;
  if(payload.roles !== 'Admin') {
    next ({
      statusCode: 401,
      error: 'Access Denied'
    });
    return;
  }
  next();
};