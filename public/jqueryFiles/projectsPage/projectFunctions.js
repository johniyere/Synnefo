// Function to show an alert of given type
// in the given location with given message.
var showAlert = function(location, type, message){
  $(location).append(" \
    <div class='alert alert-dismissable alert-" + type + "'> \
      <button type='button' data-dismiss='alert' class='close'>×</button> \
      <p>" + message + "</p> \
    </div>");
};

// Function to show an error.
var showError = function (message){
  $('#errorMessageAlert').find(".modal-body").text(message);
  $('#errorMessageAlert').modal('show');
} // showError

// Function to convert a role number to a panel id and vice versa.
var convertRoleAndPanel = function(givenInput){
  var output = "";
  switch(givenInput) {
    case 0:
      output = "#myProjectsPanel";
      break;
    case 1:
      output = "#administratedProjectsPanel";
      break;
    case 2:
      output = "#editorialProjectsPanel";
      break;
    case 3:
      output = "#reviewProjectsPanel";
      break;
    case 4:
      output = "#publicProjectsPanel";
      break;
    case "myProjectsPanel":
      output = 0;
      break;
    case "administratedProjectsPanel":
      output = 1;
      break;
    case "editorialProjectsPanel":
      output = 2;
      break;
    case "reviewProjectsPanel":
      output = 3;
      break;
    case "publicProjectsPanel":
      output = 4;
      break;
    default:
      // If something goes wrong, alert the error message.
      showError("Something went wrong.");
  } // switch
  return output;
} // convertRoleAndPanel

// Checks if the given directory is a directory in the given database level.
var directoryIsRoleDirectory = function (givenDirectory, database){
  // Make a variable to keep track of the result.
  var givenDirectoryIsRoleDirectory = false;
  // Go through all of the roles.
  for(var role = 0; role < 5; role ++){
    if (database[role] == givenDirectory)
      givenDirectoryIsRoleDirectory = true;
  } // for
  return givenDirectoryIsRoleDirectory;
} // checkCurrentDirectoryStatus

// Function to find an object in the database by its ID.
var findObjectByID = function (data, objectID){
  var foundObject = false;
  $.each(data, function () {
    // Check if the current elements ID
    // is the searched ID.
    if (this.id == objectID){
      // Save the object to a variable.
      foundObject = true;
      // End loop.
      return false;
    } // if
    // Go to the next layer.
    else{
      // Check if there is a next layer.
      if (this.children) {
        // Do the function recursively in the next layer.
        foundObject = findObjectByID(this.children, objectID)
      } // if
    } // else
  }); // for each.
  return foundObject;
  // Return the found file.
}; // findObjectByID

// Funtion to find the project which the given file's ID is associated with.
var findProjectName = function (givenData, givenID){
  var projectName = "";
  // Go through all of the elements in the given data.
  $.each(givenData, function () {
    // See if the project's ID matches the given id.
    if (this.id == givenID){
      // Change the variable to the found name.
      projectName = this.name;
      // End loop
      return false;
    } else {
      // Check if it has children.
      if (this.children){
        // Check if one of the children mathces with the given id.
        if (findObjectByID(this.children, givenID)){
          // Change the variable to the found name.
          projectName = this.name;
          // End loop
          return false;
        } // if
      } // if
    } // else
  }) // for each
  return projectName;
}// findProjectName