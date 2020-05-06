const access_token = require('./access_token.json');


let currentIndex = 0;
const tokenCycle = () => {
  if(currentIndex == access_token.length) {
    currentIndex = 0;
  }
  return access_token[currentIndex++];
}


module.exports = (_path, _method, dataLength) => {
  if(_method == 'GET')
  {
    return {
      hostname: 'lms.vinschool.edu.vn',
      path: '/api/v1' + _path,
      method: _method,
      headers:{
        'Authorization': `Bearer ${tokenCycle()}`
      }
    }
  }
  else if(_method == 'POST' || _method == 'PUT' || _method == 'DELETE')
  {
    return {
      hostname: 'lms.vinschool.edu.vn',
      path: '/api/v1' + _path,
      method: _method,
      headers: {
        'Authorization': `Bearer ${tokenCycle()}`,
        'Content-Type': 'application/json',
        'Content-Length': dataLength
      }
    }
  }
}