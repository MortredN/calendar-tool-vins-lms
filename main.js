const inquirer = require('inquirer');
const { inputParentIdForUpdate } = require('./rename');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'parentId',
      message: "Input the parent account's ID for course code update >>",
      validate: (id) => {
        if(!isNaN(id))
        {
          if(Number.isInteger(parseFloat(id)))
          return true;
        }
        return 'Please enter a valid integer ID';
      }
    },
    {
      type: 'input',
      name: 'callSpeed',
      message: "API calls/sec (Recommended < 500)?",
      default: "100",
      validate: (id) => {
        if(!isNaN(id))
        {
          if(Number.isInteger(parseFloat(id)))
          return true;
        }
        return 'Please enter a valid integer';
      }
    }
  ])
  .then(answers => {
    const timeoutSpeed = 1000 / parseFloat(answers.callSpeed);
    console.log("Ready the whole process in 5 seconds...");
    setTimeout(() => {
      inputParentIdForUpdate(timeoutSpeed, parseInt(answers.parentId));
    }, 5000);
  })
  .catch(error => {
    console.error(error);
  });