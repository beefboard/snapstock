import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import * as store from '../../data/store';
import mimeTypes from 'mime-types';

const autoReap = require('multer-autoreap');

export const TMP_IMAGE_STORE =
  process.env.IMAGE_STORE ||
    path.join(__dirname, '../../../tmpStorage');

const upload = multer({
  fileFilter: (_, file, cb) => {
    const extension = mimeTypes.extension(file.mimetype);
    cb(null, extension !== false);
  },
  storage: multer.diskStorage({
    destination: TMP_IMAGE_STORE,
    filename: function (_, file, cb) {
      const name = (Math.random()).toString(36).substring(7);
      const extension = mimeTypes.extension(file.mimetype);
      cb(null, `${name}-${Date.now()}.${extension}`);
    }
  })
}).array('images');

function handleError(e: any, res: Response) {
  console.error(e);
  res.status(500).send({
    error: 'Internal server error'
  });
}

const router = Router();

router.get('/', (_, res) => {
  res.send({
    postId: '/:postId'
  });
});

router.get('/:postId', async (req, res) => {
  const postId = req.params.postId;
  try {
    const images = await store.listImages(postId);
    if (images.length > 0) {
      res.send({ images: images });
    } else {
      res.status(404).send({ error: 'Not found' });
    }
  } catch (e) {
    handleError(e, res);
  }
});

router.put('/:postId', (req, res) => {
  upload(req, res, (err) => {
    autoReap(req, res, async () => {
      if (err) {
        return handleError(err, res);
      }

      const postId = req.params.postId;
      const imageFiles = req.files;

      if (!imageFiles) {
        return res.status(422).send({ error: 'Images must be attached' });
      }

      const filePaths = [];
      for (const file of imageFiles as any[]) {
        filePaths.push(file.path);
      }
      try {
        await store.save(postId, filePaths);
        res.send({ success: true });
      } catch (e) {
        handleError(e, res);
      }
    });
  });
});

router.get('/:postId/:imageId', async (req, res) => {
  const { postId, imageId } = req.params;
  try {
    const imagePath = await store.retrievePath(postId, imageId);
    if (!imagePath) {
      res.status(404).send({
        error: 'Not found'
      });
      return;
    }
    res.sendFile(imagePath);
  } catch (e) {
    handleError(e, res);
  }
});

export default router;
