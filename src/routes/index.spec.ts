import supertest from 'supertest';
import app from '../app';

describe('routes', () => {
  describe('GET /', () => {
    it('should respond with routes documentation', async () => {
      const response = await supertest(app).get('/');
      expect(response.body).toEqual({ v1: '/v1' });
    });
  });

  it('should respond with 404 for unmatched routes', async () => {
    const response = await supertest(app).get('/skdjfkldjfl');
    expect(response.status).toEqual(404);
  });
});
