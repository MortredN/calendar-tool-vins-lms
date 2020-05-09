const https = require('https');
const httpsOpts = require('./httpsOpts');


module.exports = {
  
  getAccount: (timeoutSpeed, id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const req = https.request(httpsOpts(`/accounts/${id}`, 'GET'), res => {
          console.log(`GET - getSingle for Account ${id}: ${res.statusCode} - ${res.statusMessage}`);
    
          let dataQueue = "";
          res.on('data', (data) => {dataQueue += data});
    
          res.on('end', () => {
            resolve(JSON.parse(dataQueue));
          });
        });
    
        req.on('error', err => {console.error(err)});
        req.end();
      }, timeoutSpeed);
    });
  }
  
}