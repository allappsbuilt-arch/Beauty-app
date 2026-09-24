const app = require('./app');
const { port } = require('./config');
const { migrate } = require('./db/database');

migrate()
  .then(() => {
    app.listen(port, () => {
      console.log(`BeautyApp backend listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to the database / run migrations:', err.message);
    process.exit(1);
  });
