// On page load use the script.
$(function(){

  // Attach the top of the sidebar to the navbar.
  $('#sidebar').affix({
    offset: {
      top: 51
    }
  });

  // Change the top offset whether it is affixed or not.
  $('#sidebar').on('affixed.bs.affix', function () {
    $('#sidebar').data('bs.affix').options.offset.top = 71
  });

  $('#sidebar').on('affixed-top.bs.affix', function () {
    $('#sidebar').data('bs.affix').options.offset.top = 51
  });

}); // on page load