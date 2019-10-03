/* eslint-disable new-cap */
const router = require('express').Router();
const User = require('../models/user');
const Band = require('../models/band');

router
  .get('/api/me/favorites', ({ user }, res, next) => {
    User.findById(user.id)
      .populate('favorites', 'name')
      .lean()
      .then(({ favorites }) => res.json(favorites))
      .catch(next);
  })

  .put('/api/me/favorites/:bandId', ({ user, params }, res, next) => {
    User.updateById(user.id, {
      $addToSet: {
        favorites: params.bandId
      }
    })
      .then(({ favorites }) => res.json(favorites))
      .catch(next);
  })

  .delete('/api/me/favorites/:bandId', ({ params, user }, res, next) => {
    Band.findOneAndRemove({
      _id: params.id,
      owner: user.id
    })
      .then(band => res.json(band))
      .catch(next);
  });


module.exports = router;