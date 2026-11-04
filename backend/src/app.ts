import cors from 'cors';
import express from 'express';

const { PORT = 3000 } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
