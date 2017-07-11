'use strict';

//packages
var express = require('express');
var exec = require('child_process').exec;

module.exports = function(filename) {
    var path = __dirname;

    exec('java -cp ' +  path + ' ' + filename, function(error, stdout, stderr){
        console.log('stdout: ' + stdout);
        console.log('sterr: ' + stderr);
        if(error != null)
            console.log('error: ' + error);
    });
};