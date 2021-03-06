import { Router } from 'express';
import v1 from './v1';

const router = Router();

router.get('/', (_, res) => {
  res.send({
    v1: '/v1'
  });
});

router.use('/v1', v1);

router.use((req, res) => {
  res.status(404).send({ error: 'Not found' });
});

export default router;
