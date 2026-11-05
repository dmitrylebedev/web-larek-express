import path from 'path';

import { errors } from 'celebrate';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { DB_ADDRESS, ORIGIN_ALLOW, PORT } from './config';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import notFound from './middlewares/not-found';
import authRouter from './routes/auth';
import orderRouter from './routes/order';
import productRouter from './routes/product';
import uploadRouter from './routes/upload';
import { ensureUploadDirs, startTempCleanup } from './utils/file';

const app = express();

app.use(cors({
  origin: ORIGIN_ALLOW,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/auth', authRouter);
app.use('/upload', uploadRouter);
app.use(notFound);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

const connect = async () => {
  await mongoose.connect(DB_ADDRESS);
  await ensureUploadDirs();
  startTempCleanup();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${PORT}`);
  });
};

connect().catch((error: unknown) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
