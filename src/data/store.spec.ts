import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import mockFs from 'mock-fs';
import * as store from './store';

console.log();
const statAsync = promisify(fs.stat);
const readFileAsync = promisify(fs.readFile);
describe('store', () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe('save', () => {
    it('should move given images to store', async () => {
      const imagePaths = {
        'test.png': 'test',
        'test1.png': 'test2',
        'test2.png': 'test3',
        'test3.png': 'test4',
      };

      const postId = 'jshfias';

      const mockFsConfig = Object.assign(imagePaths, { [store.STORAGE_DIR]: {} });
      mockFs(mockFsConfig);

      await store.save(postId, Object.keys(imagePaths));

      for (const imagePath in imagePaths) {
        let thrown = null;
        try {
          await statAsync(imagePath);
        } catch (e) {
          thrown = e;
        }

        expect(thrown).not.toBe(null);
      }
    });

    it('should create a folder of the given post id', async () => {
      const imagePaths = {
        'test.png': 'test'
      } as any;

      const postId = 'jshfias';

      const mockFsConfig = Object.assign({ [store.STORAGE_DIR]: {} }, imagePaths);
      mockFs(mockFsConfig);

      await store.save(postId, Object.keys(imagePaths));

      expect(await statAsync(path.join(store.STORAGE_DIR, postId))).toBeTruthy();
    });

    it('should save image names as their index numbers under their post folder', async () => {
      const imagePaths = {
        'test.png': 'test',
        'test1.png': 'test2',
        'test2.png': 'test3',
        'test3.png': 'test4',
      } as any;

      const postId = 'jshfias';

      const mockFsConfig = Object.assign({ [store.STORAGE_DIR]: {} }, imagePaths);
      mockFs(mockFsConfig);

      await store.save(postId, Object.keys(imagePaths));

      let i = 0;
      for (const imagePath in imagePaths) {
        const stats = await statAsync(path.join(store.STORAGE_DIR, postId, `${i}.png`));
        expect(stats).not.toBe(null);
        i += 1;
      }
    });

    it('should overwrite all previous images related to a post', async () => {
      const imagePaths = {
        'test.png': 'test',
        'test2.png': 'data2'
      } as any;

      const postId = 'jshfias';

      const mockFsConfig = Object.assign({ [store.STORAGE_DIR]: {} }, imagePaths);
      mockFs(mockFsConfig);

      await store.save(postId, ['test.png']);
      await store.save(postId, ['test2.png']);

      const data = await readFileAsync(path.join(store.STORAGE_DIR, postId, '0.png'));
      expect(data.toString()).toBe('data2');
    });

    it('should throw an error if directory cannot be created or wiped', async () => {
      const postId = 'jshfias';
      mockFs();

      let thrown = null;
      try {
        await store.save(postId, ['test2.png']);
      } catch (e) {
        thrown = e;
      }

      expect(thrown).not.toBe(null);
    });
  });

  describe('retrievePath', () => {
    it('should retrive the path of the given postId and imageId', async () => {
      const postId = 'sdkfsdf';
      const imageId = '2';

      const expectedPath = path.join(store.STORAGE_DIR, postId, `${imageId}.png`);
      mockFs({
        [expectedPath]: 'image-content'
      });

      const foundPath = await store.retrievePath(postId, imageId);
      expect(foundPath).toBe(expectedPath);
    });

    it('should return null if the image id does not exist', async () => {
      const postId = 'sdkfsdf';
      const imageId = '2';

      const mockPath = path.join(store.STORAGE_DIR, postId, '3.png');
      mockFs({ [mockPath]: 'content' });

      const foundPath = await store.retrievePath(postId, imageId);
      expect(foundPath).toBe(null);
    });

    it('should return null if the post id does not exist', async () => {
      const postId = 'sdkfsdf';
      const imageId = '2';
      mockFs({});

      const foundPath = await store.retrievePath(postId, imageId);
      expect(foundPath).toBe(null);
    });
  });

  describe('listImages', async () => {
    it('should return image ids stored under given postId', async () => {
      const postId = 'fdsfds';
      const postStoreDir = path.join(store.STORAGE_DIR, postId);
      const mockDirConfig = {
        [postStoreDir]: {
          '1.png': 'test',
          '2.png': 'test2',
          '3.png': 'test3',
          '4.png': 'test4',
        }
      } as any;
      mockFs(mockDirConfig);

      const images = await store.listImages(postId);
      expect(images).toEqual(['1', '2', '3', '4']);
    });

    it('should return empty list for posts which do not exist', async () => {
      const postId = 'fdsfds';
      mockFs({});

      const images = await store.listImages(postId);
      expect(images).toEqual([]);
    });
  });
});
