const app = require('./index');

const server = app.listen(3001, () => {
    console.log(`Express is running on port ${server.address().port}`);
  });