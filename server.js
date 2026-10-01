require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const port = process.env.PORT || 5000;

connectDatabase()
  .then(() => app.listen(port, () => console.log(`Property Listing API running on port ${port}`)))
  .catch((error) => {
    console.error(`Unable to start server: ${error.message}`);
    process.exit(1);
  });
