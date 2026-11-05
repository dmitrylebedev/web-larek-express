import path from 'path';

import { errors } from 'celebrate';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { DB_ADDRESS, PORT } from './config';
import errorHandler from './middlewares/error-handler';
import { errorLogger, requestLogger } from './middlewares/logger';
import notFound from './middlewares/not-found';
import orderRouter from './routes/order';
import productRouter from './routes/product';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use(notFound);
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

const connect = async () => {
  await mongoose.connect(DB_ADDRESS);
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
