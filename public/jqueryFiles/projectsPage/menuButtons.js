// On page load use the script.
$(function(){

  // Make the new broject button interactive.
  $("#newProject").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      $("#projectFormPanel").slideToggle();
      // Hide panels.
      $("#permissionFormPanel").slideUp();
      $("#defaultPermissionFormPanel").slideUp();
    } // if
  }); // on event "click"

  // Make the new directory button interactive.
  $("#newDirectory").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    if(!$(this).hasClass('disabled')){
      $("#folderFormPanel").slideToggle();
      // Hide panels.
      $("#fileFormPanel").slideUp();
      $("#uploadFormPanel").slideUp();
      $("#permissionFormPanel").slideUp();
      $("#defaultPermissionFormPanel").slideUp();
    } // if
  }); // on event "click"

  // Make the new file button interactive.
  $("#newFile").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      $("#fileFormPanel").slideToggle();
      // Hide panels.
      $("#folderFormPanel").slideUp();
      $("#uploadFormPanel").slideUp();
      $("#permissionFormPanel").slideUp();
      $("#defaultPermissionFormPanel").slideUp();
    } // if
  }); // on event "click"

  // Make the upload button interactive.
  $("#uploadButton").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      $("#uploadFormPanel").slideToggle();
      // Hide panels.
      $("#fileFormPanel").slideUp();
      $("#folderFormPanel").slideUp();
      $("#permissionFormPanel").slideUp();
      $("#defaultPermissionFormPanel").slideUp();
    } // if
  }); // on event "click"

  // Make the upload button interactive.
  $("#changePermissions").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      $("#permissionFormPanel").slideToggle();
      // Hide panels.
      $("#projectFormPanel").slideUp();
      $("#fileFormPanel").slideUp();
      $("#folderFormPanel").slideUp();
      $("#uploadFormPanel").slideUp();
      $("#defaultPermissionFormPanel").slideUp();
    } // if
  }); // on event "click"

  // Make the upload button interactive.
  $("#changeDefaultPermissions").click( function(e){
    // Prevents the default action which is going to the linked page.
    e.preventDefault();
    // Check if the link is disabled or not.
    if(!$(this).hasClass('disabled')){
      $("#defaultPermissionFormPanel").slideToggle();
      // Hide panels.
      $("#projectFormPanel").slideUp();
      $("#permissionFormPanel").slideUp();
      $("#fileFormPanel").slideUp();
      $("#folderFormPanel").slideUp();
      $("#uploadFormPanel").slideUp();
    } // if
  }); // on event "click"

}); // on page load