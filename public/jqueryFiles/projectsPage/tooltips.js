// On page load use the script.
$(function(){

  // Show a tooltip when hovering on the redirect to editor button.
  $('#goToEditor').tooltip({title: "This button allows you to open the current project in the editor.",
                            placement: 'right',
                            delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the back button.
  $('#backButton').tooltip({title: "This button allows you to go back in the currently active directory.",
                            placement: 'right',
                            delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the new project button.
  $('#newProject').tooltip({title: "This button allows you to create a new project.",
                            placement: 'right',
                            delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the new directory button.
  $('#newDirectory').tooltip({title: "This button allows you to create a new directory in the current directory.",
                              placement: 'right',
                              delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the new file button.
  $('#newFile').tooltip({title: "This button allows you to create a new file in the current directory.",
                         placement: 'right',
                         delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the upload button.
  $('#uploadButton').tooltip({title: "This button allows you to upload files to the currently active directory.",
                              placement: 'right',
                              delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the permissions button.
  $('#changePermissions').tooltip({title: "This button allows you to change a user's permissions on the currently selected object.",
                                   placement: 'right',
                                   delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on the default permissions button.
  $('#changeDefaultPermissions').tooltip({title: "This button allows you to change the default permissions on the currently selected object.",
                                          placement: 'right',
                                          delay: {show: 1000, hide: 100}});

  // Show a tooltip when hovering on delete button.
  $('#delete').tooltip({title: "This button allows you to delete the currently selected object.",
                        placement: 'right',
                        delay: {show: 1000, hide: 100}});

}); // on page load