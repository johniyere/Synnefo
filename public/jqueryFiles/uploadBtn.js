// On page load use the script.
$(function(){

  // Get the information from the file upload.
  $(".input-group").on('change', '.btn-file :file', function() {
    // Get the intput.
    var input = $(this);
    // Get the amount of files selected.
    var filesCount = input.get(0).files ? input.get(0).files.length : 1;
    // Get the label of the first file.
    var label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    // Trigger the feedback.
    input.trigger('fileselect', [filesCount, label]);
  });

  // Give feedback of the files chosen.
  $('.btn-file :file').on('fileselect', function(event, filesCount, label) {
    // Find the output location.
    var output = $(this).parents('.input-group').find(':text');
    // Make the response text.
    var responseText = filesCount > 1 ? filesCount + ' files selected' : label;
    // Output the response.
    output.val(responseText);
  });

}); // on page load