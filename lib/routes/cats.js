/* eslint-disable new-cap */
const router = require('express').Router();
const Cat = require('../models/cat');
// const ensureRole = require('../middleware/ensure-role');

router
  .post('/', (req, res, next) => {
    req.body.owner = req.user.id;
    Cat.create(req.body)
      .then(cat => res.json(cat))
      .catch(next);
  })

  .get('/:id', (req, res, next) => {
    Cat.findById(req.params.id)
      .lean()
      .then(cat => res.json(cat))
      .catch(next);
  })

  .get('/', ({ query }, res, next) => {
    const findQuery = {};
    if(query.name) findQuery.name = query.name;
    if(query.toes) findQuery.toes = { $gte: query.toes };
    Cat.find(findQuery)
      .select('name breed colors whiskers')
      .lean()
      .then(cats => {
        res.json(cats);
      })
      .catch(next);
  })

  .put('/:id', ({ params, body }, res, next) => {
    Cat.updateOne({
      _id: params.id
    }, body)
      .then(cat => res.json(cat))
      .catch(next);
  }) 

  .delete('/:id', ({ params }, res, next) => {
    Cat.findOneAndRemove(params.id)
      .then(cat => res.json(cat))
      .catch(next);
  });

module.exports = router; 