/* eslint-disable new-cap */
const router = require('express').Router();
const User = require('../models/user');
const tokenService = require('../token-service');

router
  .post('/signup', (req, res, next) => {

    ///save user to db
    User.create(req.body)
      .then(user => {

        return tokenService.sign(user)
          .then(token => {
            res.json({
              _id: user._id,
              email: user.email,
              token: token
            });
          })
          .catch(next);

      });
  });

module.exports = router;