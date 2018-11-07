import supertest from 'supertest';
import app from '../../app';
import mockFs from 'mock-fs';

jest.mock('../../data/store');
const store = require('../../data/store');

// Hide error logs
console.error = () => {};

afterEach(() => {
  mockFs.restore();
});

describe('/v1/images', () => {
  describe('GET /', async () => {
    it('should reply with documentation', async () => {
      const response = await supertest(app).get('/v1/images');
      expect(response.body).toEqual({ postId: '/:postId' });
    });
  });

  describe('GET /:postId', async () => {
    it('should return all imageIds stored under given postId', async () => {
      store.listImages.mockImplementation(async () => {
        return [0, 1, 2, 3, 4];
      });
      const response = await supertest(app).get('/v1/images/lol');
      expect(response.body).toEqual({ images: [0, 1, 2, 3, 4] });
    });

    it('should respond with 404 if post images do not exist', async () => {
      store.listImages.mockImplementation(async () => {
        return [];
      });
      const response = await supertest(app).get('/v1/images/lol');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    });

    it('should response with 500 error when store errors', async () => {
      store.listImages.mockImplementation(async () => {
        throw new Error('bad');
      });
      const response = await supertest(app).get('/v1/images/lol');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /:postId/:imageId', () => {
    afterEach(() => {
      store.retrievePath.mockReset();
    });

    it('should respond with 404 for invalid image', async () => {
      const response = await supertest(app).get('/v1/images/lol/123');
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Not found' });
    });

    it('should retrieve image path from store', async () => {
      await supertest(app).get('/v1/images/lol/123');
      expect(store.retrievePath).toHaveBeenCalledWith('lol', '123');
    });

    it('should respond with image content of the image', async () => {
      const mockPath = '/here.png';
      mockFs({
        [mockPath]: 'data'
      });

      store.retrievePath.mockImplementation(async () => {
        return mockPath;
      });

      const response = await supertest(app).get('/v1/images/lol/123');
      expect(response.status).toBe(200);
      expect(response.body.toString()).toBe('data');
    });

    it('should send the correct content type for type of image', async () => {
      const mockPath = '/here.png';
      mockFs({
        [mockPath]: 'data'
      });

      store.retrievePath.mockImplementation(async () => {
        return mockPath;
      });

      const response = await supertest(app).get('/v1/images/lol/123');
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('image/png');

      const mockPath2 = '/here.jpg';
      mockFs({
        [mockPath2]: 'data'
      });

      store.retrievePath.mockImplementation(async () => {
        return mockPath2;
      });

      const response2 = await supertest(app).get('/v1/images/lol/123');
      expect(response2.status).toBe(200);
      expect(response2.header['content-type']).toBe('image/jpeg');
    });

    it('should respond with 500 error if unable to retrieve image', async () => {
      store.retrievePath.mockImplementation(async () => {
        throw new Error('bad');
      });

      const response = await supertest(app).get('/v1/images/lol/123');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('handleError', async () => {
    it('should print error to console', async () => {
      console.error = jest.fn();
      store.retrievePath.mockImplementation(async () => {
        throw new Error('bad');
      });

      const response = await supertest(app).get('/v1/images/lol/123');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
