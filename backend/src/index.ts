import 'dotenv/config';

import app from './app';

const port = Number(process.env.PORT || 5001);

app.listen(port, () => {
  console.log(`[backend] listening on http://localhost:${port}`);
});
