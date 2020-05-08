const inquirer = require('inquirer');
const { inputParentIdForUpdate } = require('./rename');

inquirer
  .prompt([
    {
      type: 'input',
      name: 'parentId',
      message: "Please input the parent account's ID for course code update:",
      validate: (id) => {
        if(!isNaN(id))
        {
          if(Number.isInteger(parseFloat(id)))
          return true;
        }
        return 'Please enter a valid integer ID';
      }
    }
  ])
  .then(answers => {
    inputParentIdForUpdate(parseInt(answers.parentId));
  })
  .catch(error => {
    console.error(error);
  });