/* eslint-disable new-cap */
const router = require('express').Router();
const Cat = require('../models/cat');
const ensureRole = require('../middleware/ensure-role');
const ensureAuth = require('../middleware/ensure-auth');

router
  .get('/', (req, res, next) => {
    Cat.find()
      .lean()
      .then(cats => {
        res.json(cats);
      })
      .catch(next);
  })
  
  .post('/', ensureAuth(), ensureRole(), (req, res, next) => {
    Cat.create(req.body)
      .then(cat => res.json(cat))
      .catch(next);
  })

  .put('/:id', ensureAuth(), ensureRole('admin'), ({ params, body }, res, next) => {
    Cat.updateOne({
      _id: params.id
    }, body)
      .then(cat => res.json(cat))
      .catch(next);
  }) 

  .delete('/:id', ensureAuth(), ensureRole('admin'), ({ params }, res, next) => {
    Cat.findByIdAndRemove({
      _id: params.id
    })
      .then(cat => res.json(cat))
      .catch(next);
  });

module.exports = router; 