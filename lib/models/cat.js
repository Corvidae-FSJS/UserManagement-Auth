const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { RequiredString } = require('./required-types');

const schema = new Schema({
  name: RequiredString,
  breed: RequiredString,
  toes: {
    type: Number,
    required: true,
    min: 0, 
    max: 6
  },
  colors: RequiredString,
  claws: {
    type: Boolean,
    default: true
  },
  whiskers: RequiredString
});

module.exports = mongoose.model('Cat', schema);