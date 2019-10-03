/* eslint-disable new-cap */
const router = require('express').Router();
const Band = require('../models/band');

router
  .post('/', (req, res, next) => {
    req.body.owner = req.user.id;
    Band.create(req.body)
      .then(band => res.json(band))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Band.findById(req.params.id)
      .lean()
      .then(band => res.json(band))
      .catch(next);
  })

  .get('/', ({ query }, res, next) => {
    const findQuery = {};
    if(query.name) findQuery.name = query.name;
    if(query.guitarists) findQuery.guitarists = { $gte: query.guitarists };
    Band.find(findQuery)
      .select('name genre vocals language')
      .lean()
      .then(bands => {
        res.json(bands);
      })
      .catch(next);
  })

  .put('/:id', ({ params, body, user }, res, next) => {
    Band.updateOne({
      _id: params.id,
      owner: user.id
    }, body)
      .then(band => res.json(band))
      .catch(next);
  }) 

  .delete('/:id', ({ params, user }, res, next) => {
    Band.findOneAndRemove({
      _id: params.id,
      owner: user.id
    })
      .then(band => res.json(band))
      .catch(next);
  });

module.exports = router; 