import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

const copyAsync = promisify(fs.copyFile);
const mkdirAsync = promisify(fs.mkdir);
const readdirAsync = promisify(fs.readdir);
const unlinkAsync = promisify(fs.unlink);

export const STORAGE_DIR = process.env.STORAGE_DIR || path.join(__dirname, '/../../storage');

function extractId(imageFileName: string) {
  const extension = path.extname(imageFileName);
  return path.basename(imageFileName, extension);
}

try {
  fs.mkdirSync(STORAGE_DIR);
} catch (_) {}

export async function save(postId: string, imagePaths: string[]) {
  const tasks = [];
  let i = 0;

  const postFolder = path.join(STORAGE_DIR, postId);
  try {
    await mkdirAsync(postFolder);
  } catch (e) {
    if (e.code === 'EEXIST') {
      const tasks = [];
      for (const file of await readdirAsync(postFolder)) {
        tasks.push(unlinkAsync(path.join(postFolder, file)));
      }
    } else {
      throw e;
    }
  }
  for (const imagePath of imagePaths) {
    const extension = path.extname(imagePath);
    tasks.push(copyAsync(imagePath, path.join(STORAGE_DIR, postId, `${i}${extension}`)));
    i += 1;
  }

  await Promise.all(tasks);
}

export async function retrievePath(postId: string, imageId: string) {
  const postFolder = path.join(STORAGE_DIR, postId);
  let images;
  try {
    images = await readdirAsync(postFolder);
  } catch (_) {
    return null;
  }

  for (const image of images) {
    if (extractId(image) === imageId) {
      return path.join(postFolder, image);
    }
  }

  return null;
}

export async function listImages(postId: string) {
  const postFolder = path.join(STORAGE_DIR, postId);
  try {
    const imageFiles = await readdirAsync(postFolder);
    const imageIds = [];
    for (const imageFile of imageFiles) {
      imageIds.push(extractId(imageFile));
    }

    return imageIds;
  } catch (e) {
    return [];
  }
}
