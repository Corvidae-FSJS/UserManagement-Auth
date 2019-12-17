const request = require('../request');
const { dropCollection } = require('../db');
const { signupUser, signinUser } = require('../data-helpers');

describe('Bands API', () => {
  beforeEach(() => dropCollection('users'));
  beforeEach(() => dropCollection('bands'));

  const testUser = {
    email: 'me@me.com',
    password: 'abc'
  };

  let user = null;
  beforeEach(() => {
    return signupUser(testUser)
      .then(() => {
        return signinUser(testUser)
          .then(body => user = body);
      });
  });

  const band = {
    name: 'Dödsrit',
    genre: 'Blackened Crust',
    //owner: user._id, not needed because present in post of bands route
    guitarists: 1,
    vocals: 'whispers, screams',
    synths: false,
    language: 'Swedish'
  };

  function postBand(band) {
    //band.owner = user._id; not needed because present in post of bands route
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
          .then(() => band);
      });
  }

  it('no favorites return empty array', () => { 
    return request
      .get('/api/me/favorites')
      .set('Authorization', user.token)
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual([]);
      });
  });

  it('updates a band in favorites for user', () => {
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
      .then((favoritedBand) => {
        return request
          .get('/api/me/favorites')
          .set('Authorization', user.token)
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(1); 
            expect(body[0]._id).toEqual(favoritedBand._id);
          }); 
      });
  });

  it('deletes a favorited band', () => {
    return putBand(band)
      .then(favoritedBand => {
        return request
          .delete(`/api/me/favorites/${favoritedBand._id}`)
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
