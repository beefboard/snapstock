import { Router, Response } from 'express';
import * as store from '../../data/store';

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
