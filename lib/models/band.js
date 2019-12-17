const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const { RequiredString } = require('./required-types');

const schema = new Schema({
  name: RequiredString,
  genre: RequiredString,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guitarists: {
    type: Number,
    required: true,
    min: 0, 
    max: 5
  },
  vocals: RequiredString,
  synths: {
    type: Boolean,
    default: false
  },
  language: RequiredString
});

module.exports = mongoose.model('Band', schema);