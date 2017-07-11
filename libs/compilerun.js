'use strict';

//packages
var express = require('express');
var exec = require('child_process').exec;

var compile = function(filename) {
    var path = __dirname + '/';
    exec('javac ' + path + filename + '.java', function(error, stdout, stderr){
        console.log('stdout: ' + stdout);
        console.log('sterr: ' + stderr);
        if(error != null)
            console.log('error: ' + error);
    });
};

var run = function(filename, callback) {

    var runWithEmptyQ = function() {
        exec('java -cp ' +  path + ' ' + filename, function(error, stdout, stderr){
            console.log('stdout: ' + stdout);
            console.log('sterr: ' + stderr);
            if(error != null)
                console.log('error: ' + error);
            callback(stdout);
        });
    };
    process.nextTick(runWithEmptyQ);
};

var compileAndRun = function(filename, path, callback)  {
    exec('javac ' + path + filename + '.java', function(error, stdout, stderr){
        console.log('stdout: ' + stdout);
        console.log('sterr: ' + stderr);
        if(error != null)
            console.log('error: ' + error);

        //Run java
        if(error == null)
            run(filename, path, callback);
    });
}

module.exports.compile = compile;
module.exports.run = run;
module.exports.compileAndRun = compileAndRun;