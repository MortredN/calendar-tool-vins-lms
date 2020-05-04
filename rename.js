// make around 20 api calls / sec
const https = require('https');

const httpsOpts = (_path, _method) => {
  return {
    hostname: 'lms.vinschool.edu.vn',
    path: '/api/v1' + _path,
    method: _method,
    headers: {'Authorization': `Bearer ${process.env.NODE_ENV}`}
  }
}

let childAccs = [];

const getChildAccs = (_accQueues) => {
  let accQueues = _accQueues;
  if(accQueues.length != 0) {
    setTimeout(() => {
      const req = https.request(httpsOpts(`/accounts/${accQueues[0].id}/sub_accounts`, 'GET'), res => {
        console.log(`getChildAccIds of ID ${accQueues[0].id}: ${res.statusCode} - ${res.statusMessage}`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', () => {
          const accArrays = JSON.parse(dataQueue);
          if(accArrays.length != 0)
          {
            accArrays.forEach((acc) => {
              accQueues.push({id: acc.id, name: acc.name});
            });
          }
          else
          {
            childAccs.push(accQueues[0]);
          }
          accQueues.shift();
          
          console.log(childAccs);

          getChildAccs(accQueues);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 50);
  }
}

getChildAccs([{id: 1, name: 'VinSchool'}])