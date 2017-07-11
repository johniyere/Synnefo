// On page load use the script.
$(function(){

  // Add jquery scripts to head.
  $("head").append("<script type='text/javascript'"
                   + "src='/jqueryFiles/projectsPage/projectFunctions.js'><"+"/script>");
  $("head").append("<script type='text/javascript'"
                   + "src='/jqueryFiles/projectsPage/panelFunctions.js'><"+"/script>");

  // Put the css files to the head.
  $("head").append("<link href='/stylesheets/projects.css' rel='stylesheet'"
                   + " type='text/css' media='screen'><"+"/link>");
  $("head").append("<link href='/stylesheets/uploadBtn.css' rel='stylesheet'"
                   + " type='text/css' media='screen'><"+"/link>");

  // Initialising variables
  var dataArray = {};
  var currentDirectory;
  var currentParent = null;
  var currentFolderName;
  var currentFolderID = "";
  var clickedObject = null;
  var currentRole;
  var currentPanelID;

  // Function to update the active panel.
  var updateActivePanel  = function (givenPanel, givenRole, givenPanelID){
    // Check if the newly clicked object is a new panel.
    if (givenPanel.hasClass("panel-default")){

      // Remove default from previously active panel.
      $('.col-sm-9').find(".panel-primary").removeClass("panel-primary").addClass("panel-default");
      // Make the new panel the primary panel.
      givenPanel.removeClass("panel-default").addClass("panel-primary");
      // Update the current role.
      currentRole = givenRole;
      // Update the current panel id.
      currentPanelID = givenPanelID;
      // Clear out previous active objects.
      if (clickedObject != null
          && clickedObject.parent().parent().parent().parent().parent()
                          .attr("id") != currentPanelID)
        clickedObject.removeClass("Active");
      // Update current folder id.
      currentFolderID = $("#" + currentPanelID).find(".panel-heading").attr("id");
      // Check if the current folder is a projects folder and update the current directory accordingly.
      if (currentFolderID == ""){
        currentDirectory = dataArray[currentRole];
        currentParent = null;
        // Update buttons.
        updateButtonStatus();
      } // if
      else{
        updateCurrentDirectory(dataArray[currentRole],currentFolderID);
      } // else
    } // if
  } // updateActivePanel

  // Function to update the usability of buttons.
  var updateButtonStatus  = function() {
    // Check if it is currently showing projects.
    if (directoryIsRoleDirectory(currentDirectory, dataArray)){
      $(".dirButton").addClass('disabled');
      // Check if there is something active.
      if($('.currentDirectoryList').find(".Active").length){
        $("#goToEditor").removeClass('disabled');
      } else {
        $("#goToEditor").addClass('disabled');
      } // else
      // Check if your projects is selected.
      if (currentRole == 0)
      {
        $(".roleButton").removeClass('disabled');
      } else {
        $(".roleButton").addClass('disabled');
      } // else
    } // if
    // Showing folders and files inside a project.
    else{
      $(".dirButton").removeClass('disabled');
      $(".roleButton").addClass('disabled');
      $("#goToEditor").removeClass('disabled');
    } // else
    // Hide panels.
    slideAllPanelsUp();
    // Check if there is something active.
    if($('.currentDirectoryList').find(".Active").length){
      $(".activeButton").removeClass('disabled');
    } // if
    else {
      $(".activeButton").addClass('disabled');
    }
  }; // updateButtonStatus

  // Function to find the files inside the given folder.
  var updateCurrentDirectory = function (data,dataID){
    // Check all the elements of the given data layer.
    $.each(data, function () {
      // See if the ids match
      if (this.id == dataID) {
        // See if the element has children attribute.
        if (this.children) {
          // Update the directory and parent.
          currentDirectory = this.children;
          currentParent = data;
        } // if
        // Update buttons.
        updateButtonStatus();
        // End loop.
        return false;
      } // if
      // Go to the next layer.
      else {
        // See if there is a next layer.
        if (this.children) {
          updateCurrentDirectory(this.children, dataID);
        } // if
      } // else
    }); // for each
  }; // updateCurrentDirectory

  // Function to update the parent.
  var updateCurrentParent = function (data){
    // Check all the elements of the given data layer.
    $.each(data, function () {
      // Check if the children of the current element
      // is the current directory.
      if (this.children == currentDirectory){
        // Update current parent.
        currentParent = data;
        // Update the current folder name.
        currentFolderName = this.name;
        // Update the current folder ID.
        currentFolderID = this.id;
        // Give the panel heading an ID of the folder.
        $("#" + currentPanelID).find(".panel-heading").attr("id",currentFolderID);
        // End loop.
        return false;
      } // if
      // Go to the next layer.
      else{
        // Check if there is a next layer.
        if (this.children) {
          updateCurrentParent(this.children)
        } // if
      } // else
    }); // for each.
  }; // updateCurrentParent

  // Method which makes the next layer appear.
  var goToNextLayer = function(nextDirectory, panelID){
    // Take the name and id from the clicked element.
    currentFolderName = nextDirectory.text();
    currentFolderID = nextDirectory.attr('id');
    // Give the panel heading an ID of the folder.
    $("#" + panelID).find(".panel-heading").attr("id",currentFolderID);
    // Update panel heading.
    $("#" + panelID).find('span').text(currentFolderName);
    // Clear previous elements.
    $("#" + panelID).find('.currentDirectoryList').empty();
    // Update the current directory variable.
    updateCurrentDirectory(dataArray[convertRoleAndPanel(panelID)],currentFolderID);
    // Show a warning message about an empty
    // folder if the currentDirectory is empty.
    if (currentDirectory.length === 0){
      var alertLocation = $("#" + panelID).find(".currentDirectoryList");
      showAlert(alertLocation, "warning", "Nothing here yet.");
    }
    // Build the new folder into the panel.
    else{
      fillPanel("#" + panelID, ".currentDirectoryList" ,currentDirectory);
    }
    // Update buttons.
    updateButtonStatus();
  }; // goToNextLayer

  // Function to get data.
  var getData = function (callback){
    // Empty the database.
    dataArray = {};
    // Make a variable to keep track of roles done.
    var rolesLeft = 5;
    // Go through a loop to get all of the roles data.
    for(var role = 0; role < 5; role ++){
      $.ajax({
        type: 'POST',
        data: {role: role},
        url: '/projects/getData',
        dataType: 'JSON'
      }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
          // Add data to the memory database.
          dataArray[response.role] = JSON.parse(response.projects);
          // Decrease the tracing variable.
          rolesLeft --;
          // Do the callback function if the database
          // query has been finished.
          if (rolesLeft == 0){
            callback(dataArray);
          } // if
        } // if
        else {
          // If something goes wrong, alert the error message that the server returned
          showError(response.msg);
        } // else
      }); // done
    } // for
  }; // getData

  // Method which makes the previous layer appear.
  var goToPreviousLayer = function(role){
    // Update current directory.
    currentDirectory = currentParent;
    // See if the current directory is now the projects layer.
    if (directoryIsRoleDirectory(currentDirectory, dataArray)) {
      // Find the appropriate name for the panel.
      switch(currentRole) {
        case 0:
          currentFolderName = "My projects";
          break;
        case 1:
          currentFolderName = "Administrated projects";
          break;
        case 2:
          currentFolderName = "Editorial projects";
          break;
        case 3:
          currentFolderName = "Reviewing projects";
          break;
        case 4:
          currentFolderName = "Public projects";
          break;
      } // switch
      currentParent = null;
      currentFolderID = "";
      $(convertRoleAndPanel(role)).find(".panel-heading").attr("id","");
    }
    else {
      // Update the parent and the current folder name and the id.
      updateCurrentParent(dataArray[currentRole]);
    }
    // Change the heading of the panel.
    $("#" + currentPanelID).find('span').text(currentFolderName);
    // Clear out previous items.
    $("#" + currentPanelID).find('.currentDirectoryList').empty();
    // Put new items to the panel.
    fillPanel("#" + currentPanelID, ".currentDirectoryList", currentDirectory);
  }; // goToPreviousLayer

  // Function to update the current items in the panel.
  var updateCurrentDirectoryPanel = function(){
    // Update current directory variable.
    if (currentFolderID != ""){
      updateCurrentDirectory(dataArray[currentRole],currentFolderID);
    } // if
    else
    {
      currentDirectory = dataArray[currentRole];
    } // else
    // Empty the panel of items and then refill the panel.
    $("#" + currentPanelID).find('.currentDirectoryList').empty();
    fillPanel("#" + currentPanelID, ".currentDirectoryList", currentDirectory);
  }; // updateCurrentDirectoryPanel

  // Function to add a project to the database.
  var pushProjectToDatabase = function (content){
    $.ajax({
      type: 'POST',
      data: content,
      url: '/projects/push',
      dataType: 'JSON'
    }).done(function( response ) {
      // Check for successful (blank) response
      // and rebuild the current panel and add the project to the memory.
      if (response.msg === '') {
        // Update the panel.
        getData(updateCurrentDirectoryPanel);
        // Hide the form after completion.
        $("#projectFormPanel").slideUp();
      } // if
      else {
        // If something goes wrong, alert the error message that the server returned
        showError(response.msg);
      } // else
    }); // done
  }; // pushProjectToDatabase

  // Method to push the given file or folder to database.
  var pushContentToDatabase = function (data,content) {
    // Go through the data elements.
    $.each(data, function () {
      // If the current element has children which
      // is also the current directory get the id of the folder.
      if (this.children == currentDirectory) {
        // Assign objects id.
        content.parent_id=this.id;
        // http request to post the object.
        $.ajax({
          type: 'POST',
          data: content,
          url: '/projects/push',
          dataType: 'JSON'
        }).done(function( response ) {
          // Check for successful (blank) response
          if (response.msg === '') {
            if (content.type == "File"){
              currentFolderID = response.returnedFolder.dirId;
            } // if
            else{
              currentFolderID = response.returnedFolder.parent;
            } // else
            $("#" + currentPanelID).find(".panel-heading").attr("id",currentFolderID);
            getData(updateCurrentDirectoryPanel);
            // Hide the form on completion.
            $("#folderFormPanel").slideUp();
            $("#fileFormPanel").slideUp();
          } // if
          else {
            // If something goes wrong, alert the error message that the server returned
            showError(response.msg);
          } // else
        }); // done
        // End loop.
        return false;
      } // if
      // Go to the next layer to continue searching for the right folder.
      else{
        // Check if the next layer exists.
        if (this.children) {
          pushContentToDatabase(this.children,content)
        } // if
      } // else
    }); // for each
  }; // pushContentToDatabase

  // Give panels listeners so that when clicked on them they become active.
  $("#myProjectsPanel").click( function(){
    updateActivePanel($(this),0,"myProjectsPanel");
  });

  $("#administratedProjectsPanel").click( function(){
    updateActivePanel($(this),1,"administratedProjectsPanel");
  });

  $("#editorialProjectsPanel").click( function(){
    updateActivePanel($(this),2,"editorialProjectsPanel");
  });

  $("#reviewProjectsPanel").click( function(){
    updateActivePanel($(this),3,"reviewProjectsPanel");
  });

  $("#publicProjectsPanel").click( function(){
    updateActivePanel($(this),4,"publicProjectsPanel");
  });

  // Make the panels interactive.
  $('.currentDirectoryList').on("click",".item > a",function(e){
    // Prevent default event action, which is to go to the linked page.
    e.preventDefault();
    // Save the clicked object to a variable.
    clickedObject = $(this);
    // Only allow interacting with the items if they are active.
    if (clickedObject.hasClass("Active")){
      if (clickedObject.parent().hasClass("Directory")){
        // Make a variable out of the cliced item and go
        // to the next layer with the clicked item as required argument.
        var clickedDirectory = $(this);
        goToNextLayer(clickedDirectory, currentPanelID);
      } // if
      // Redirect to editor page if the clicked object is a file.
      else if (clickedObject.parent().hasClass("File")){
        var openedFileID = clickedObject.attr('id');
        var projectName = findProjectName(dataArray[currentRole], openedFileID);
        // Redirect to editor page.
        window.location.replace("./editor/" + projectName + "/" + openedFileID);
      } // else if
      // Send a message to the console to notify an odd situation.
      else{
        console.log("Some odd error at clicking on an object.");
      } // else
    } // if
    // Switch active classes.
    else{
      // Find the previous active and pass the active
      // class on to the clicked item.
      $('.currentDirectoryList').find(".Active").removeClass("Active");
      clickedObject.addClass("Active");
      // Update buttons.
      updateButtonStatus();
    } // else
  }); // on event "click"

  // Get the data from the databse and then fill the panels with the data.
  getData(fillPanels);

  // Make the back button interactive.
  $("#backButton").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      // Go to the previous layer.
      goToPreviousLayer(currentRole);
      // Update buttons.
      updateButtonStatus();
    } // if
  }); // on event "click"

  // Make the go to editor button interactive.
  $("#goToEditor").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      // See if the current directory is the projects layer or it is
      // already in a project.
      if (directoryIsRoleDirectory(currentDirectory, dataArray)) {
        var projectName = clickedObject.text();
      } else {
        var projectName = findProjectName(dataArray[currentRole], currentFolderID)
      } // else
      // Redirect to editor page.
      window.location.replace("./editor/" + projectName);
    } // if
  }); // on event "click"

  // Make the submit broject button interactive.
  $("#submitProject").click( function(e){
    // Prevent default action on event.
    e.preventDefault();
    // Get the name of the project.
    var newProjectName = $("#projectInput").val();
    // Check if the name is valid.
    if (newProjectName != ""){
      // Make an object to push and then proceed with pushing to database.
      var content = {name: newProjectName, type: "Project"};
      pushProjectToDatabase(content);
    } else {
      // Show an error message if the name is invalid.
      showError("Please input a name.");
    } // else
  }); // on event "click"

  // Make the submit directory button interactive.
  $("#submitDirectory").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Get the folders name from the input of the form.
    var newFolderName = $("#folderInput").val();
    // Check if the name is valid.
    if (newFolderName != ""){
      // Make an object which is to be pushed into the database.
      var content = {name: newFolderName, type: "Directory", parent_id: ""}
      pushContentToDatabase(dataArray[currentRole],content);
    } else {
      // Show an error message if the name is invalid.
      showError("Please input a name.");
    } // else
  }); // on event "click"

  // Make the submit file button interactive.
  $("#submitFile").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Get the new file name from the form.
    var newFileName = $("#fileInput").val();
    // Check if the name is valid.
    if (newFileName != ""){
      // Make an object to be pushed into the database.
      var content = {name: newFileName, type: "File", parent_id: ""}
      pushContentToDatabase(dataArray[currentRole],content);
    } else {
      // Show an error message if the name is invalid.
      showError("Please input a name.");
    } // else
  }); // on event "click"

  // Make the delete button interactive.
  $("#delete").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      // Get the name of the item.
      var deletedItemName = clickedObject.text();
      // Ask for confirmation.
      $('#confirmationAlert').find(".modal-body").text("Are you sure you want do delete " + deletedItemName + "?");
      $('#confirmationAlert').modal('show');
    } // if
  }); // on event "click"

  // Delete the item on confirmation.
  $('#confirmationAlert').on("click","#confirmed",function(){
    // Find the ID of the item wished to be deleted.
    var deletedItemID = clickedObject.attr('id');
    // Find the class of the item.
    var deletedItemClass = clickedObject.parent().attr("class").split(' ').pop();;
    // Make a JSON object to post to the server.
    var deletedItem = {id: deletedItemID,
                       type: deletedItemClass};
    // Make an ajax post request with the ID of the deleted object.
    $.ajax({
      type: 'POST',
      data: deletedItem,
      url: '/projects/delete',
      dataType: 'JSON'
    }).done(function( response ) {
      // Check for successful (blank) response
      if (response.msg === '') {
        // Remove active from clicked object.
        clickedObject.removeClass("Active");
        // Update the panel.
        getData(updateCurrentDirectoryPanel);
      } // if
      else {
        // If something goes wrong, alert the error message that the server returned
        showError(response.msg);
      } // else
    }); // done
  }); // on event "click"

  // Make the change permission button interactive.
  $("#changeDefaultPermission").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Get the new permission.
    var givenPermission = $("#newDefaultPermission").prop('selectedIndex');
    // Get the selected itemID.
    var objectToChangePermissionID = clickedObject.attr('id');
    // Get the selected item class.
    var selectedItemClass = clickedObject.parent().attr("class").split(' ').pop();;
    // Make an object to send to the server.
    var defaultPermissionChange = {objectID: objectToChangePermissionID,
                                   newDefault: givenPermission,
                                   type: selectedItemClass};
    // Make an ajax post request with the permission change data.
    $.ajax({
      type: 'POST',
      data: defaultPermissionChange,
      url: '/projects/defaultPermissionsChange',
      dataType: 'JSON'
    }).done(function( response ) {
      // Check for successful (blank) response
      if (response.msg === '') {
        // Hide the form on completion.
        $("#defaultPermissionFormPanel").slideUp();
      } // if
      else {
        // If something goes wrong, alert the error message that the server returned
        showError(response.msg);
      } // else
    }); // done
  }); // on event "click"

  // Make the change permission button interactive.
  $("#changePermission").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Get the user name.
    var givenUserName = $("#userInput").val();
    // Get the new permission.
    var givenPermission = $("#newPermission").prop('selectedIndex');
    // Get the selected itemID.
    var objectToChangePermissionID = clickedObject.attr('id');
    // Get the selected item class.
    var selectedItemClass = clickedObject.parent().attr("class").split(' ').pop();;
    // Make an object to send to the server.
    var permissionChange = {userName: givenUserName,
                            objectID: objectToChangePermissionID,
                            newRole: givenPermission,
                            type: selectedItemClass};
    // Make an ajax post request with the permission change data.
    $.ajax({
      type: 'POST',
      data: permissionChange,
      url: '/projects/permissionsChange',
      dataType: 'JSON'
    }).done(function( response ) {
      // Check for successful (blank) response
      if (response.msg === '') {
        // Hide the form on completion.
        $("#permissionFormPanel").slideUp();
        getData(updateCurrentDirectoryPanel);
      } // if
      else {
        // If something goes wrong, alert the error message that the server returned
        showError(response.msg);
      } // else
    }); // done
  }); // on event "click"

  // Inspiration taken from:
  // http://stackoverflow.com/questions/21044798/how-to-use-formdata-for-ajax-file-upload
  // http://blog.w3villa.com/websites/uploading-filesimage-with-ajax-jquery-without-submitting-a-form

  // Make the upload files button interactive.
  $("#uploadFiles").click( function(e){
    // Prevent default action.
    e.preventDefault();
    // Creating object of FormData class.
    var formData = new FormData();
    // Create a variable to check on the amount of files and the size of the files.
    var filesFound = 0;
    var fileTooBig = false;
    // Go through all of the files and add them to the data form to be sent to the server.
    jQuery.each(jQuery("#uploadFormPanel :input[type=file]")[0].files, function(i, file) {
      // Check for the size of the files.
      if (file.size > 5000000){
        fileTooBig = true;
      } // if
      // Count the files.
      filesFound += 1;
      formData.append("multiInputFileName[]", file);
    });
    // Add the cirectory where the files would be uploaded to the data to be sent.
    formData.append("directoryID", currentFolderID);
    // Check if there were any files selected.
    if (!fileTooBig && filesFound != 0 && filesFound <= 10) {
      // Ajax post.
      $.ajax({
        url: "/projects/uploadFiles",
        data: formData,
        cache:false,
        processData:false,
        contentType:false,
        type:'POST'
      }).done(function( response ) {
        // Check for successful (blank) response
        if (response.msg === '') {
          // Hide the form on completion.
          $("#uploadFormPanel").slideUp();
          // Update the panel.
          getData(updateCurrentDirectoryPanel);
        } // if
        else {
          // If something goes wrong, alert the error message that the server returned
          showError(response.msg);
        } // else
      }); // done
    } // if
    else if (fileTooBig){
      // Show an error message if a too big file was selected.
      showError("The file you tried to upload is too big.");
    } // else if
    else if (filesFound > 10){
      // Show an error message if too many files were selected.
      showError("Please select only up to 10 files to upload.");
    } else {
      // Show an error message if no files were selected.
      showError("Please select your files to upload.");
    }

  }); // on event "click"

}); // on page load