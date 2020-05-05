const https = require('https');
const httpsOpts = require('./httpsOpts');
const fs = require('fs');


const getChildAccs = (_accQueues, _childAccs) => {
  let accQueues = _accQueues, childAccs = _childAccs
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
            // accQueues = accQueues.concat(accArrays);
          }
          else
          {
            childAccs.push(accQueues[0]);
          }
          accQueues.shift();
          
          console.log(childAccs);

          getChildAccs(accQueues, childAccs);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 10); // 100 API calls / sec
  }
  else {
    setTimeout(() => {
      getCoursesFromChildAccs(childAccs, []);
    }, 5000); // Wait 5 secs before getting courses
  }
}


const getCoursesFromChildAccs = (_accs, _courses) => {
  let accs = _accs, courses = _courses;
  if(accs.length != 0) {
    setTimeout(() => {
      // Ignore blueprint courses
      const req = https.request(httpsOpts(`/accounts/${accs[0].id}/courses?blueprint=false`, 'GET'), res => {
        console.log(`getCourses from acc ID ${accs[0].id}: ${res.statusCode} - ${res.statusMessage}`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', () => {
          const courseArrays = JSON.parse(dataQueue);
          courseArrays.forEach((co) => {
             courses.push({id: co.id, course_code: co.course_code, name: co.name});
          });
          // courses = courses.concat(courseArrays);

          accs.shift();
          
          console.log(courses);

          getCoursesFromChildAccs(accs, courses);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 10); // 100 API calls / sec
  }
}


// TESTING
getChildAccs([{id: 1, name: 'VinSchool'}], [])

// const req = https.request(httpsOpts(`/accounts/237/courses?blueprint=false`, 'GET'), res => {
//   let dataQueue = "";
//   res.on('data', (data) => {dataQueue += data});

//   res.on('end', () => {
//     const courseArrays = JSON.parse(dataQueue);
//     console.log(courseArrays)
//   });
// });

// req.on('error', err => {console.error(err)});
// req.end();