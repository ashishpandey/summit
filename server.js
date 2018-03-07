const express = require('express');
const nocache = require('nocache');
const monitApi = require('./monit/api');

const app = express();
const port = process.env.PORT || 5000;

app.use('/api/*', nocache());

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Hello From Express' });
});

app.use('/api/monit', monitApi);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

app.listen(port, () => console.log(`Listening on port ${port}`));
