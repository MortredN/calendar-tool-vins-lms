const https = require('https');
const httpsOpts = require('./httpsOpts');
const { codeFromNamingConv } = require('./codeFromNamingConv');
const { getAccount } = require('./getSingle');


const findParents = (timeoutSpeed, inputId, currentChildId, _parents) => {
  let parents = _parents;
  if(parents == undefined) // First recursion
  {
    parents = [];
    currentChildId = inputId;
  }

  getAccount(timeoutSpeed, currentChildId).then((acc) => {
    parents.unshift(acc);

    // Recurse until reached the root account
    // The root account's root account ID will be "null"
    if(acc.root_account_id != null)
    {
      findParents(timeoutSpeed, inputId, acc.parent_account_id, parents);
    }
    else
    {
      let code = '', nameOfInputId = '';
      for(let i = 0; i < parents.length; i++)
      {
        code = codeFromNamingConv(parents[i].name, 'accounts', code);
        if(i == parents.length - 1)
        {
          nameOfInputId = parents[i].name;
        }
      }

      console.log(`Finished getting parents of input ID: ${inputId}.`);
      console.log("Ready to get all sub-accounts from the input account in 5 seconds...");

      setTimeout(() => {
        getChildAccs(timeoutSpeed, [{id: inputId, name: nameOfInputId, code: code}], []);
      }, 5000); // Wait 5 secs before getting sub-accounts
    }
  });
}


const getChildAccs = (timeoutSpeed, _accQueues, _childAccs) => {
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

          getChildAccs(timeoutSpeed, accQueues, childAccs);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, timeoutSpeed);
  }
  else {
    console.log("Ready to get courses from all accounts in 5 seconds...");
    setTimeout(() => {
      getCoursesFromChildAccs(timeoutSpeed, childAccs, []);
    }, 5000); // Wait 5 secs before getting courses
  }
}


const getCoursesFromChildAccs = (timeoutSpeed, _accs, _courses) => {
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
          
          getCoursesFromChildAccs(timeoutSpeed, accs, courses);
        });
      });
      
      req.on('error', err => {console.error(err)});
      req.end();
    }, timeoutSpeed);
  }
  else
  {
    console.log("Ready to update courses codes in 5 seconds...");
    setTimeout(() => {
      updateCoursesCodes(timeoutSpeed, courses);
    }, 5000); // Wait 5 secs before updating courses
  }
}


const updateCoursesCodes = (timeoutSpeed, _courses) => {
  let courses = _courses;
  if(courses.length != 0)
  {
    setTimeout(() => {
      const data = JSON.stringify({"course": {"course_code": courses[0].code}});

      const req = https.request(httpsOpts(`/courses/${courses[0].id}`, 'PUT', data.length), res => {
        console.log(`PUT - updateCoursesCodes for ${courses[0].id} "${courses[0].name}": ${res.statusCode} - ${res.statusMessage}`);

        let dataQueue = "";
        res.on('data', (data) => {dataQueue += data});

        res.on('end', ()  => {
          const updateSuccessful = JSON.parse(dataQueue).course_code == courses[0].code;
          console.log(`Code changed for ${courses[0].id}? ${updateSuccessful}`);

          if(!updateSuccessful)
          {
            courses.unshift(course[0].id); // Put the error courses back to the queue and re-run the update process
          }
          
          courses.shift();

          updateCoursesCodes(timeoutSpeed, courses);
        });
      });

      req.on('error', err => {console.error(err)});
      req.write(data);
      req.end();
    }, timeoutSpeed);
  }
  else
  {
    console.log("Finished updating!");
  }
}


module.exports = {
  inputParentIdForUpdate: (timeoutSpeed, inputId) => {
    findParents(timeoutSpeed, inputId);
  }
}