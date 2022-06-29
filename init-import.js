const axios = require('axios');

var config = require('./config/config'),
  mongoose = require('./config/lib/mongoose'),
  express = require('./config/lib/express');

// Initialize mongoose
mongoose.connect(function (db) {
  // Initialize express
  var app = express.init(db);

  // Start the app by listening on <port>
  app.listen(config.port);

  // Logging initialization
  console.log('Init import');
  axios
    .get('http://localhost:3003/towns/initElasticsearch')
    .then(() => {
      console.log('Init towns');
      return axios.get('http://localhost:3003/products/initElasticsearch');
    })
    .then(() => {
      console.log('Init products');
      return axios.get('http://localhost:3003/towns/import');
    })
    .then(() => {
      console.log('done');
      process.exit(1);
    });
});
