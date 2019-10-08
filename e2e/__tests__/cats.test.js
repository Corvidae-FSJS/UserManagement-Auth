const request = require('../request');
const db = require('../db');
const User = require('../../lib/models/user');
const { signupUser } = require('../data-helpers');

describe('Cats API', () => {
  beforeEach(() => db.dropCollection('users'));
  beforeEach(() => db.dropCollection('cats'));

  const normalUser = {
    email: 'normal@normal.com',
    password: 'abc123'
  };

  const adminUser = {
    email: 'admin@admin.com',
    password: 'abc123'
  };

  const cat1 = {
    name: 'CMO',
    breed: 'American Shorthair',
    toes: 5,
    colors: 'Orange & White',
    claws: true,
    whiskers: 'Long'
  };

  const cat2 = {
    name: 'Ender',
    breed: 'Mumbai',
    toes: 5,
    colors: 'Black with Red Undertones',
    claws: true,
    whiskers: 'Normal'
  };

  function signinAdminUser(admin = adminUser) {
    return request
      .post('/api/auth/signin')
      .send(admin)
      .expect(200)
      .then(({ body }) => body);
  }

  it('posts a cat with user permission', () => {
    return signupUser(adminUser)
      .then(user => {
        return User.updateById(user._id, {
          $addToSet: {
            roles:'admin'
          }
        });
      })
      .then(() => {
        return Promise.all([
          signinAdminUser()
        ])
          .then(([admin]) => {
            return request
              .post('/api/cats')
              .set('Authorization', admin.token)
              .send(cat1)
              .expect(200)
              .then(({ body }) => {
                expect(body).toEqual({
                  ...cat1,
                  _id: expect.any(String),
                  __v: 0
                });
              });
          });
      });
  });

  it('denies the ability of someone without user permission to post', () => {
    return signupUser(normalUser)
      .then(() => {
        return request
          .post('/api/auth/signin')
          .send(normalUser)
          .expect(200)
          .then(({ body }) => body)
          .then(user => {
            return request
              .post('/api/cats')
              .set('Authorization', user.token)
              .send(cat2)
              .expect(401)
              .then(({ body }) => {
                expect(body.error).toBe('User not authorized, must be admin');
              });
          });
      });
  });

  const cat3 = {
    name: 'Space Cat',
    breed: 'Tabby Point Siamese',
    toes: 5,
    colors: 'White, Tan, Black',
    claws: true,
    whiskers: 'Normal'
  };

  it('only allows those with admin access to put', () => {
    return signupUser(normalUser)
      .then(() => {
        return signupUser(adminUser)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdminUser()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(cat3)
                  .expect(200)
                  .then(({ body }) => body)
                  .then(cat => {
                    return request
                      .put(`/api/cats/${cat._id}`)
                      .set('Authorization', admin.token)
                      .send({ toes: 6 })
                      .expect(200)
                      .then(({ body }) => {
                        expect(body.toes).toBe(6);
                      });
                  });
              });
          });
      });
  });

  it('gets can be done by any authorized user', () => {
    return signupUser(normalUser)
      .then(() => {
        return signupUser(adminUser)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdminUser()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(cat3)
                  .expect(200)
                  .then(() => {
                    return request
                      .post('/api/cats')
                      .set('Authorization', admin.token)
                      .send(cat3)
                      .expect(200)
                      .then(() => {
                        return signinAdminUser(normalUser)
                          .then(user => {
                            return request
                              .get('/api/cats')
                              .set('Authorization', user.token)
                              .expect(200)
                              .then(({ body })=> {
                                expect(body.length).toBe(2);
                              });
                          });
                      });
                  });
              });
          });
      });
  });

  it('deletes a cat, but only those with admin access', () => {
    return signupUser(normalUser)
      .then(() => {
        return signupUser(adminUser)
          .then(user => {
            return User.updateById(user._id, {
              $addToSet: {
                roles: 'admin'
              }
            });
          })
          .then(() => {
            return signinAdminUser()
              .then(admin => {
                return request
                  .post('/api/cats')
                  .set('Authorization', admin.token)
                  .send(cat3)
                  .expect(200)
                  .then(({ body }) => {
                    return request
                      .delete(`/api/cats/${body._id}`)
                      .set('Authorization', admin.token)
                      .expect(200)
                      .then(() => {
                        return request
                          .get('/api/cats')
                          .set('Authorization', admin.token)
                          .expect(200)
                          .then(() => {
                            expect(body).toEqual({ 
                              ...cat3,
                              _id: expect.any(String),
                              __v: 0 
                            });
                          });
                      });
                  });
              });
          });
      });
  });
});