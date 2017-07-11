// On page load use the script.
$(function(){

  // Give panel headings ID classes to keep track of the currently shown folders.
  $("#myProjectsPanel").parent().find(".panel-heading").attr("id","");
  $("#administratedProjectsPanel").parent().find(".panel-heading").attr("id","");
  $("#editorialProjectsPanel").parent().find(".panel-heading").attr("id","");
  $("#reviewProjectsPanel").parent().find(".panel-heading").attr("id","");
  $("#publicProjectsPanel").parent().find(".panel-heading").attr("id","");

}); // on page load