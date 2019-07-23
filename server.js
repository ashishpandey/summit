const express = require('express');
const nocache = require('nocache');
const path = require('path');
const monitApi = require('./monit/api');

const app = express();
const port = process.env.PORT || 5000;

app.use('/api/*', nocache());

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.use('/api/monit', monitApi);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'client/build')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client/build/index.html')));
}

app.listen(port, () => console.log(`Listening on port ${port}`));
