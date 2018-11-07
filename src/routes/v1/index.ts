import { Router } from 'express';
import images from './images';

const router = Router();

router.get('/', (_, res) => {
  res.send({
    images: '/images'
  });
});

router.use('/images', images);

export default router;
