const http = require('http');

let options = {
  host: '13.37.20.18',
  path: '/oauth/token?grant_type=client_credentials',
  port: '80',
  auth: '8a7a3bc7-331a-4da8-9e7c-821c67aa3fdc' + ':' + 'kLL24wBMXGUKKgL',
  headers: {
    Accept: 'application/json'
  }
};

var req = http.request(options, function (response) {
    var str = '';
    response.on('data', function (chunk) {
        str += chunk;
     });

    response.on('end', function () {
    var data;

    try {
      data = JSON.parse(str);
    } catch (err) {
      data = null;
    }

    console.log('Data = ',data);
  });
});

req.end();