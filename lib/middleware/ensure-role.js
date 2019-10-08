module.exports = () => (req, res, next) => {
  const role = req.user.roles;
  
  if(!role.includes('admin')) {
    next({
      statusCode: 401,
      error: 'User not authorized, must be admin'
    });
  } else {
    next(); 
  }
}; 