import 'dotenv/config';

import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('Yes');
});

const { PORT } = process.env;

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
