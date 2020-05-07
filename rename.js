const https = require('https');
const httpsOpts = require('./httpsOpts');
const codeFromNamingConv = require('./codeFromNamingConv');


const getChildAccs = (_accQueues, _childAccs) => {
  let accQueues = _accQueues, childAccs = _childAccs
  if(accQueues.length != 0) {
    setTimeout(() => {
      const req = https.request(httpsOpts(`/accounts/${accQueues[0].id}/sub_accounts`, 'GET'), res => {
        console.log(`GET - getChildAccIds of ID ${accQueues[0].id}: ${res.statusCode} - ${res.statusMessage}`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', () => {
          const accArrays = JSON.parse(dataQueue);
          if(accArrays.length != 0)
          {
            accArrays.forEach((acc) => {
              accQueues.push({id: acc.id, name: acc.name,
                code: codeFromNamingConv(acc.name, 'accounts', accQueues[0].code)});
            });
          }

          childAccs.push(accQueues[0]);
          console.log(accQueues[0]);
          accQueues.shift();

          getChildAccs(accQueues, childAccs);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 10); // BCS (or maximum) 100 API calls / sec
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
        console.log(`GET - getCourses from acc ID ${accs[0].id}: ${res.statusCode} - ${res.statusMessage}`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', () => {
          const courseArrays = JSON.parse(dataQueue);
          courseArrays.forEach((co) => {
            
            // Only push in the array if the course belongs to a specific sub-account
            // Does not count for the parent accounts of that sub-account
            if(co.account_id == accs[0].id)
            {
              courses.push({id: co.id, name: co.name,
                code: codeFromNamingConv(co.name, 'subjects', accs[0].code)});
              console.log({id: co.id, name: co.name,
                code: codeFromNamingConv(co.name, 'subjects', accs[0].code)});
            }
          });

          accs.shift();
          
          getCoursesFromChildAccs(accs, courses);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 10); // BCS (or maximum) 100 API calls / sec
  }
  else
  {
    setTimeout(() => {
      updateCoursesCodes(courses);
    }, 5000); // Wait 5 secs before getting courses
  }
}


const updateCoursesCodes = (_courses) => {
  let courses = _courses;
  if(courses.length != 0) {
    setTimeout(() => {
      const data = JSON.stringify({"course": {"course_code": courses[0].code}});

      const req = https.request(httpsOpts(`/courses/${courses[0].id}`, 'PUT', data.length), res => {
        console.log(`PUT - updateCoursesCodes for ${courses[0].id} "${courses[0].name} - ${res.statusCode} - ${res.statusMessage}"`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', () => {
          console.log(`Code changed for ${courses[0].id}? ${JSON.parse(dataQueue).course_code == courses[0].code}`);
          
          courses.shift();

          updateCoursesCodes(courses);
        });
      });

      req.on('error', err => {console.error(err)});
      req.write(data);
      req.end();
    }, 10); // BCS (or maximum) 100 API calls / sec
  }
}


/* TESTING ZONE */
getChildAccs([{id: 964, name: 'Rename', code: codeFromNamingConv('Rename', 'accounts', '')}], [])

// const data = JSON.stringify({"course": {"course_code": 'TV2A03'}});

// const req = https.request(httpsOpts(`/courses/16557`, 'PUT', data.length), res => {
//   console.log(`PUT in Course 16657: ${res.statusCode} - ${res.statusMessage}`);
//   let dataQueue = "";
//   res.on('data', (data) => {dataQueue += data});

//   res.on('end', () => {
//     console.log(JSON.parse(dataQueue));
//   });
// });

// req.on('error', err => {console.error(err)});
// req.write(data)
// req.end();