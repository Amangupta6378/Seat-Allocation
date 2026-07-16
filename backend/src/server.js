const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { connectToDatabase } = require('./config/db');
const { ensureBaseData } = require('./utils/bootstrap');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectToDatabase();
  await ensureBaseData();
  app.listen(PORT, () => {
    console.log(`Ethara backend running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
