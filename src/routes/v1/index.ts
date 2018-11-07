import { Router } from 'express';
import store from './store';

const router = Router();

router.get('/', (_, res) => {
  res.send({
    store: '/store'
  });
});

router.use('/store', store);

export default router;
