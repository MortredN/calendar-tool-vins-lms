const namingConv = require('./naming_conv.json');


module.exports = {

  codeFromNamingConv: (_name, category, parentCode) => {
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
  
}