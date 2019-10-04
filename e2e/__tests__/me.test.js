const request = require('../request');
const { dropCollection } = require('../db');
const { signupUser } = require('../data-helpers');
const mongoose = require('mongoose');

describe('Band API', () => {
  beforeEach(() => dropCollection('users'));
  beforeEach(() => dropCollection('bands'));

  let user = null;
  beforeEach(() => {
    return signupUser().then(newUser => (user = newUser));
  });

  const band = {
    name: 'Dödsrit',
    genre: 'Blackened Crust',
    owner: new mongoose.Types.ObjectId(),
    guitarists: 1,
    vocals: 'whispers, screams',
    synths: false,
    language: 'Swedish'
  };

  function postBand(band) {
    return request
      .post('/api/bands')
      .set('Authorization', user.token)
      .send(band)
      .expect(200)
      .then(({ body }) => body);
  }

  function putBand(band) {
    return postBand(band)
      .then(band => {
        return request
          .put(`/api/me/favorites/${band._id}`)
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => body);
      });
  }

  it('puts a band in favorites', () => {
    return postBand(band)
      .then(band => {
        return request
          .put(`/api/me/favorites/${band._id}`)
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(1);
            expect(body[0]).toEqual(band._id);
          });
      });
  });

  it('gets a favorited band', () => {
    return putBand(band)
      .then(() => {
        return request
          .get(`/api/me/favorites`)
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => {
            expect(body[0]).toMatchInlineSnapshot(
              {
                _id: expect.any(String)
              },
              `
            Object {
              "_id": Any<String>,
              "name": "Dödsrit",
            }
          `
            );
          });
      });
  });

  it('deletes a favorited band', () => {
    return putBand(band)
      .then(favoritedBand => {
        return request
          .delete(`/api/me/favorites/${favoritedBand[0]}`)
          .set('Authorization', user.token)
          .expect(200)
          .then(() => {
            return request
              .get('/api/me/favorites')
              .set('Authorization', user.token)
              .expect(200)
              .then(({ body }) => {
                expect(body.length).toBe(0);
              });
          });
      });
  });
});
