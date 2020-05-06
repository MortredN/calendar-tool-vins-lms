const https = require('https');
const httpsOpts = require('./httpsOpts');
const namingConv = require('./naming_conv.json');


const getCodeInNamingConv = (_name, category, parentCode) => {
  // Temporary uppercased name variable for looping
  const name = _name.toUpperCase();

  const arr = namingConv[category];
  let code = parentCode;

  // For Accounts: Loop for schools and grades (not for the classes in compulsory education system - grade 1 to 12)
  if(category == "accounts")
  {
    for(let i = 0; i < arr.length; i++) {
      if(code == parentCode)
      {
        if(name.includes(arr[i].name.toUpperCase())) {
          code += arr[i].code;
        }
      }
      else
      {
        break;
      }
    }
    
    // Provide code with class's name (compulsory education system - grade 1 to 12)
    if(parentCode.includes("-TiH") || parentCode.includes("-THCS") || parentCode.includes("-THPT")) {
      if(parentCode.includes("-K")) {
        code += _name;
      }
    }

    // If it's an account, it might contain courses, therefore a dash should be included
    code += "-"
  }

  // For Subjects: Differentiate Alvin's classes to compulsory education's subjects
  else if(category == "subjects") {

    // Alvin classes
    if(parentCode.includes('-MN'))
    {
      // Get the class name by taking the remaining substring after the last dash at the original course name
      // E.g. "VSC-R1-Alvin1" ==> alvinClassName = "Alvin1"
      let alvinClassName = _name.substring(_name.lastIndexOf("-") + 1);
      code += alvinClassName;
    }

    // Compulsory education subjects
    else
    {
      for(let i = 0; i < arr.length; i++) {
        if(code == parentCode)
        {
          if(name.includes(arr[i].name.toUpperCase())) {
            code += arr[i].code;
          }
        }
        else
        {
          break;
        }
      }
    }
  }

  return code;
}


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
              accQueues.push({id: acc.id, name: acc.name,
                code: getCodeInNamingConv(acc.name, 'accounts', accQueues[0].code)});
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
            
            // Only push in the array if the course belongs to a specific sub-account
            // Does not count for the parent accounts of that sub-account
            if(co.account_id == accs[0].id)
            {
              courses.push({id: co.id, name: co.name,
                code: getCodeInNamingConv(co.name, 'subjects', accs[0].code)});
              console.log({id: co.id, name: co.name,
                code: getCodeInNamingConv(co.name, 'subjects', accs[0].code)});
            }
          });

          accs.shift();
          
          getCoursesFromChildAccs(accs, courses);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, 10); // 100 API calls / sec
  }
}


const updateCourseCodes = (_courses) => {
  
}


// TESTING
// getChildAccs([{id: 964, name: 'Rename', code: getCodeInNamingConv('Rename', 'accounts', '')}], [])

const data = JSON.stringify({"course_code": 'TV2A03'});

const req = https.request(httpsOpts(`/courses/16557`, 'PUT', data.length), res => {
  console.log(`PUT in Course 16657: ${res.statusCode} - ${res.statusMessage}`);
  let dataQueue = "";
  res.on('data', (data) => {dataQueue += data});

  res.on('end', () => {
    console.log(JSON.parse(dataQueue));
  });
});

req.on('error', err => {console.error(err)});
req.write(data)
req.end();