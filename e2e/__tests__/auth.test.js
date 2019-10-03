const request = require('../request');
const { dropCollection } = require('../db');

describe('Auth API', () => {
  
  beforeEach(() => dropCollection('users'));

  const testUser = {
    email: 'me@me com',
    password: 'abc'
  };


  it('signs up a user', () => {
    return request
      .post('/api/auth/signup')
      .send(testUser)
      .expect(200)
      .then(({ body }) => body)
      .then(user => {
        expect(user.token).toBeDefined();
      });
  });
});