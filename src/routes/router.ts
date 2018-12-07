/**
 * デフォルトルーター
 */
import * as express from 'express';

import authentication from '../middlewares/authentication';
import apiRouter from './api';
import incomeRouter from './income';

import authRouter from './auth';

const router = express.Router();
router.use(authRouter);
router.use(authentication);
router.use('/api', apiRouter);
router.use('/income', incomeRouter);

export default router;
