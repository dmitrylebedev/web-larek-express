import path from 'path';

import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { DB_ADDRESS, PORT } from './config';
import orderRouter from './routes/order';
import productRouter from './routes/product';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/product', productRouter);
app.use('/order', orderRouter);

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
