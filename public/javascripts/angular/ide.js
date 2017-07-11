(function(){
  'use strict';

  var ngapp = angular.module('ide', []);
  // Demo tabs?
  var tabs = [];

  ngapp.controller('IDEController', ['$scope', '$window', '$http', function($scope, $window, $http){

    //get the project name from the url
    var projectName = $window.location.pathname.split('/')[2].replace('%20', ' ');
    //console.log(projectName);

    //what is displayed in the console div
    $scope.console = '';

    // set the first tab to active by default
    $scope.currentTab = undefined;

    // Make a variable for the next id.
    $scope.nextId = 0;

    //get the document from the global scope
    $scope.doc = $window.codeMirror.getDoc();

    //No tabs are opened initially
    $scope.tabs = [];

    $scope.parseForBlocks = function(content){
      var linesArray = content.split('\n');
      var blocknames = ["<root>"];
      var inBlock = false
      while(linesArray.length > 0)
      {
        var line = linesArray[0].trim().split(' ');
        if (!inBlock && line[0] === "#" && line[1] === "block" && line[2])
        {
          inBlock = true;
          if(blocknames.indexOf(line[2]) == -1) blocknames.push(line[2]);
        }
        else if (inBlock && line[0] === "#" && line[1] === "end-block")
        {
          inBlock = false;
        }
        linesArray.splice(0,1);
      }
      return blocknames;
    }

    //this function gets called when the user clicks a tab
    //it changes the current tab and the editor content
    $scope.setTab = function(nr, closed) {
      
      //Save the content of the tab if it wasn't closed
      if(!closed && $scope.tabs.length > 1)
        $scope.tabs[$scope.currentTab].content = $scope.doc.getValue();

      //Set the new current tab
      $scope.currentTab = nr;

      //Load snippets
      $scope.snippets = $scope.tabs[$scope.currentTab].snippets;
      console.log($scope.snippets);

      $scope.blocknames = $scope.tabs[$scope.currentTab].blocknames;

      //Load the content of the file
      $scope.doc.setValue($scope.tabs[$scope.currentTab].content);

      //refresh
      setTimeout(function() {
        $window.codeMirror.refresh();
      },1);

    };

    //Returns true if this tab is selected
    $scope.isSelected = function(nr){
      return nr === $scope.currentTab;
    };

    var getFileContent = function(id, callback){
      console.log("Begining of file content in angular " + id);
      var data = {fileid: id};

      //send post request to get the file and its content
      $http.post('/api/getfilecontent', data)
        .success(function(data, status){
          console.log(data);
          callback(data.sourceCode ? data.sourceCode :  "", data.comments);
        })
        .error(function(data, status){
          console.log("Error to the post request for the file content in angular");
        });
    };

    $scope.addSnippet = function() {
      if(!$scope.chosenBlockname) return;

      $http.post('/api/addsnippet', {fileid: $scope.tabs[$scope.currentTab].fileid, blockname: $scope.chosenBlockname})
        .success(function(data, status){
          console.log(data);
          getFileContent($scope.tabs[$scope.currentTab].fileid, function(fileContent, snippets){
            //refresh snippets
            $scope.tabs[$scope.currentTab].snippets = snippets;
            $scope.snippets = $scope.tabs[$scope.currentTab].snippets;
            $scope.openSnippetTab(data._id);
          });
        })
        .error(function(data, status){
          console.log("Error to the post request for the file content in angular");
          console.log(data);
        });
    }

    $scope.openSnippetTab = function(id) {
      console.log(id);
      console.log(id.toString());
      $scope.openTab($scope.tabs[$scope.currentTab].title+": "+$scope.chosenBlockname+"["+id.toString().slice(18)+"]",id, true); //
    }

    var isFileOpened = function(fileid){
      for(var tab in $scope.tabs)
        if($scope.tabs[tab].fileid === fileid){
          $scope.setTab($scope.tabs[tab].id);
          return true;
        }
      return false;
    }

    $scope.openTab = function(filename, fileid, isSnippet){

      if(isFileOpened(fileid))
        return;

      //Get the file content first
      getFileContent(fileid, function(fileContent, snippets){

        //Add the new tab with its content
        $scope.parseForBlocks(fileContent);
        $scope.tabs.push({title: filename, fileid: fileid, content: fileContent, 
          snippets: snippets, blocknames: $scope.parseForBlocks(fileContent), id: $scope.nextId, 
          isSnippet: isSnippet});
        $scope.nextId++;

        //Set the current tab on the newly opened one
        $scope.setTab($scope.nextId - 1);
      });
    };

    $scope.closeTab = function(tabId){
      for(var tabIndex in $scope.tabs){
        var tab = $scope.tabs[tabIndex];

        //Found the tab to be closed
        if(tab.id === tabId){
          $scope.tabs.splice(tabIndex, 1);

          //update the id of the tabs following the closed one
          for(var index = tabIndex; index < $scope.tabs.length; index++)
            $scope.tabs[index].id--;

          //change the value of the nextId variable
          if($scope.tabs.length > 0)
            $scope.nextId = $scope.tabs[$scope.tabs.length - 1].id + 1;
          else
            $scope.nextId = 0;

          break;
        }
      }
      console.log($scope.tabs);

      //Empty the code
      $scope.doc.setValue('');

      //Set the current tab to the first opened one if it exists
      if($scope.tabs.length > 0)
        $scope.setTab(0, true);
    }

    //Compile and run the project
    $scope.run = function(){

      //Build the folder structure and run the file in the current tab
      console.log(projectName);
      $http.post('/editor/getTree', {fileToBeRunID: $scope.tabs[$scope.currentTab].fileid,
                                     projectName: projectName})
        .success(function(data, status){
          //The response contains the tree, and the result of running the code
          //err stdout and stdserr
          console.log(data.err);
          
          //Check if time limit was exceeded
          if(data.err && data.err.signal === 'SIGTERM')
            $scope.console = 'Time limit exceeded! \n';
          else
            $scope.console = '';
            
          //Check for other errors (like buffer size too large)
          if(data.err)
            $scope.console += 'Error. Program killed\n';

          //A little bit of formatting before displaying
          data.stderr = data.stderr.replace('/tmp/code/', ''); 
          $scope.console += data.stdout + '\n' + data.stderr;
         
        })
        .error(function(data, status){
          console.log("Error to the post request for the get tree function in angular");
        });
    }

    //Save the content of the current tab
    $scope.save = function(){
      $scope.tabs[$scope.currentTab].content = $scope.doc.getValue();
      $scope.tabs[$scope.currentTab].blocknames = $scope.parseForBlocks($scope.tabs[$scope.currentTab].content);
      $scope.blocknames = $scope.tabs[$scope.currentTab].blocknames;


      var data = {
        fileID: $scope.tabs[$scope.currentTab].fileid,
        content: $scope.tabs[$scope.currentTab].content
      };

      $http.post('/api/saveFile', data)
        .success(function(data, status){
          //The tree of the project is here
          console.log(data);
        })
        .error(function(data, status){
          console.log("Error to the post request for file saving in angular");
        });
    }

    // See if we have a file to open already.
    if ($window.sentFile != null){
      $scope.openTab($window.sentFile.filename, $window.sentFile._id);
    } 
  }]);
})();