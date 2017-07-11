// Images taken from https://commons.wikimedia.org/wiki/File:Gnome-folder.svg and
// https://commons.wikimedia.org/wiki/File:Gnome-text-x-preview.svg
// Function to fill the panel with files.
var fillPanel = function (panelID, location, items) {
  $.each(items, function () {
    if (this.name) {
      // create LI element and append it to the parent element.
      if (this.type == "Directory"){
        var col = $("<div class='col-sm-6 col-md-4 col-lg-3 item " + this.type + "'><a id=" + this.id + " >"
                   + "<img src='/images/folderImage.png' /><span>" + this.name + "</span></a></div>");
      } // if
      else if (this.type == "File"){
        var col = $("<div class='col-sm-6 col-md-4 col-lg-3 item " + this.type + "'><a id=" + this.id + " >"
                   + "<img src='/images/fileImage.png' /><span>" + this.name + "</span></a></div>");
      } // else if
      else {
        var col = "";
        // If something goes wrong, alert the error message.
        $('#errorMessageAlert').find(".modal-body").text("Something went wrong.");
        $('#errorMessageAlert').modal('show');
      }
      col.appendTo($(panelID).find(location));
    } // if
  });
};

// Function to hide the panel if it is empty from the beginning.
var hideEmptyRolePanels = function (panelID){
  if ($(panelID).find('.currentDirectoryList .item').length == 0){
    $(panelID).hide();
  } // if
} // hideEmptyRolePanels

// Function to show the panel if it isn't empty from the beginning.
var showNonEmptyRolePanels = function (panelID){
  if ($(panelID).find('.currentDirectoryList .item').length != 0){
    $(panelID).show();
  } // if
} // hideEmptyRolePanels

// Function to check if there is any content inside the panel and show
// a message if there isn't any.
var checkPanelContents = function(panelID){
  if ($(panelID).find('.currentDirectoryList .item').length == 0){
    var location = $(panelID).find('.currentDirectoryList');
    showAlert(location, "danger", "You don't have any projects yet!");
  } // if
} // checkPanelContents

// Function which fills all the panels with the given data.
var fillPanels = function(data){
  // Keep track of roles already done.
  var role = 0
  $.each(data, function () {
    fillPanel(convertRoleAndPanel(role),".currentDirectoryList", this);
    // Increment the role count.
    role ++;
  });
  // When done deal with the panel looks.
  if (role == 5 ){
    checkPanelContents("#myProjectsPanel");
    showNonEmptyRolePanels("#administratedProjectsPanel");
    showNonEmptyRolePanels("#editorialProjectsPanel");
    showNonEmptyRolePanels("#reviewProjectsPanel");
    hideEmptyRolePanels("#publicProjectsPanel");
  } // if
} // fillPanels

// Funtion to hide all panels.
var slideAllPanelsUp = function(){
  $("#projectFormPanel").slideUp();
  $("#folderFormPanel").slideUp();
  $("#fileFormPanel").slideUp();
  $("#uploadFormPanel").slideUp();
  $("#permissionFormPanel").slideUp();
  $("#defaultPermissionFormPanel").slideUp();
} // slideAllPanelsUp