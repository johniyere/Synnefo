// Function to fill the UL given the JSON list and a parent UL.
// Function taken from http://www.jqwidgets.com/building-menu-from-json/
var buildUL = function (parent, items) {
  $.each(items, function () {
    if (this.name) {
      // create LI element and append it to the parent element.
      var li
      if(this.type != 'File')
        li = $("<li class=" + this.type + "><a>" + this.name + "</a></li>");
      else
        li = $('<li ng-click="openTab(\'' + this.name + '\', \'' + this.id + '\')" class="' + this.type + '"><a>' + this.name + '</a></li>');
      li.appendTo(parent);
      // if there are children, call the buildUL function.
      if (this.children && this.children.length > 0) {
        var ul = $("<ul></ul>");
        ul.appendTo(li);
        buildUL(ul, this.children);
      }
    }
  });
}