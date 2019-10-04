const request = require('../request');
const db = require('../db');
const mongoose = require('mongoose');
const { signupUser } = require('../data-helpers');

describe('bands api', () => {
  beforeEach(() => db.dropCollection('users'));
  beforeEach(() => db.dropCollection('bands'));

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

  function postBand(band, user) {
    return request
      .post('/api/bands')
      .set('Authorization', user.token)
      .send(band)
      .expect(200)
      .then(({ body }) => body);
  }

  it('post a band for this user', () => {
    return request
      .post('/api/bands')
      .set('Authorization', user.token)
      .send(band)
      .expect(200)
      .then(({ body }) => {
        expect(body.owner).toBe(user._id);
        expect(body).toMatchInlineSnapshot(
          {
            _id: expect.any(String),
            owner: expect.any(String)
          },
          `
          Object {
            "__v": 0,
            "_id": Any<String>,
            "genre": "Blackened Crust",
            "guitarists": 1,
            "language": "Swedish",
            "name": "Dödsrit",
            "owner": Any<String>,
            "synths": false,
            "vocals": "whispers, screams",
          }
        `
        );
      });
  });

  it('post a band', () => {
    return postBand(band, user).then(band => {
      expect(band).toEqual({
        _id: expect.any(String),
        __v: 0,
        ...band
      });
    });
  });

  // it('gets a band by id', () => {
  //   return request
  //     .post('/api/bands')
  //     .set('Authorization', user.token)
  //     .then(band => {
  //       return request
  //         .get(`/api/bands/${band._id}`)
  //         .expect(200)
  //         .then(({ body }) => {
  //           expect(body).toEqual(band);
  //         });
  //     });
  // });

  it('gets a list of bands', () => {
    const firstBand = {
      name: 'Dödsrit',
      genre: 'Blackened Crust',
      owner: new mongoose.Types.ObjectId(),
      guitarists: 1,
      vocals: 'whispers, screams',
      synths: false,
      language: 'Swedish'
    };
    return Promise.all([
      postBand(firstBand, user), 
      postBand({
        name: 'Cult of Luna',
        genre: 'Doom Metal',
        owner: new mongoose.Types.ObjectId(),
        guitarists: 3,
        vocals: 'whispers, clean, bellows, screams',
        synths: true,
        language: 'English'
      }, user),
      postBand({
        name: 'We Butter The Bread With Butter',
        genre: 'Deathcore',
        owner: new mongoose.Types.ObjectId(),
        guitarists: 2,
        vocals: 'whispers, clean, bellows, screams, squeals, shouts, yells',
        synths: true,
        language: 'German'
      }, user),
      postBand({
        name: 'Auðn',
        genre: 'Black Metal',
        owner: new mongoose.Types.ObjectId(),
        guitarists: 2,
        vocals: 'whispers, clean, bellows, screams',
        synths: false,
        language: 'Icelandic'
      }, user)
    ])
      .then(() => {
        console.log(user);
        return request
          .get('/api/bands').expect(200)
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.length).toBe(4);
        expect(body[0]).toEqual({
          _id: expect.any(String),
          name: firstBand.name,
          genre: firstBand.genre,
          language: firstBand.language,
          vocals: firstBand.vocals
        });
      });
  });

  it('updates a band', () => {
    return postBand(band, user)
      .then(band => {
        band.guitarist = 2;
        return request
          .put(`/api/bands/${band._id}`)
          .send(band)
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.guitarists).toBe(1);
      });
  });

  it('deletes a band', () => {
    return postBand(band, user)
      .then(band => {
        return request
          .delete(`/api/bands/${band._id}`)
          .set('Authorization', user.token)
          .expect(200);
      });
  });
});
