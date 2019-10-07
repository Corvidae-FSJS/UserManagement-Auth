const request = require('../request');
const db = require('../db');
const mongoose = require('mongoose');
const { signupUser, signinUser } = require('../data-helpers');

describe('cats api', () => {
  beforeEach(() => db.dropCollection('users'));
  beforeEach(() => db.dropCollection('cats'));

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

  const cat = {
    name: 'CMO',
    breed: 'American Shorthair',
    owner: new mongoose.Types.ObjectId(),
    toes: 5,
    colors: 'Orange & White',
    claws: true,
    whiskers: 'Long'
  };

  function postCat(cat, user) {
    return request
      .post('/api/cats')
      .set('Authorization', user.token)
      .send(cat)
      .expect(200)
      .then(({ body }) => body);
  }

  it('post a cat', () => {
    return postCat(cat, user)
      .then(cat => {
        expect(cat).toEqual({
          _id: expect.any(String),
          __v: 0,
          ...cat
        });
      });
  });

  it('gets a list of cats', () => {
    const firstCat = {
      name: 'CMO',
      breed: 'American Shorthair',
      owner: new mongoose.Types.ObjectId(),
      toes: 5,
      colors: 'Orange & White',
      claws: true,
      whiskers: 'Long'
    };
    return Promise.all([
      postCat(cat, user), 
      postCat({
        name: 'Ender',
        breed: 'Mumbai',
        owner: new mongoose.Types.ObjectId(),
        toes: 5,
        colors: 'Black with Red Undertones',
        claws: true,
        whiskers: 'Normal'
      }, user),
      postCat({
        name: 'Space Cat',
        breed: 'Tabby Point Siamese',
        owner: new mongoose.Types.ObjectId(),
        toes: 5,
        colors: 'White, Tan, Black',
        claws: true,
        whiskers: 'Normal'
      }, user),
      postCat({
        name: 'Mort',
        breed: 'Russian Blue',
        owner: new mongoose.Types.ObjectId(),
        toes: 5,
        colors: 'Gray',
        claws: true,
        whiskers: 'Short'
      }, user)
    ])
      .then(() => {
        return request
          .get('/api/cats').expect(200)
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.length).toBe(4);
        expect(body[0]).toEqual({
          _id: expect.any(String),
          name: firstCat.name,
          breed: firstCat.breed,
          whiskers: firstCat.whiskers,
          colors: firstCat.colors
        });
      });
  });

  it('updates a cat', () => {
    return postCat(cat, user)
      .then(cat => {
        cat.toes = 5;
        return request
          .put(`/api/cats/${cat._id}`)
          .send(cat)
          .set('Authorization', user.token)
          .expect(200);
      })
      .then(({ body }) => {
        expect(body.toes).toBe(5);
      });
  });

  it('deletes a cat', () => {
    return postCat(cat, user)
      .then(cat => {
        return request
          .delete(`/api/cats/${cat._id}`)
          .set('Authorization', user.token)
          .expect(200);
      });
  });
});
