'use strict';
/*jshint -W014*/

var exec = require('child_process').exec
  , fs = require('fs')
  , format = require('string-template')
  , path = require('path')
  , Q = require('q')
  , fileIndex = 0;

var NORMAL_IMAGE_SOURCE = '/dev/video0';
var BLUE_IMAGE_SOURCE = '/dev/video1';
var OUT_DIR = '/home/pi/usbdrv/images';

var takePicture = function(videoSource, fileName) {
  return Q.Promise(function(resolve, reject) {
    fs.exists(videoSource, function(exist) {
      if (exist) {
        var cmd = format('fswebcam -d {0} -r 600 -s --jpeg=95 {1}', [videoSource, fileName]);
        exec(cmd, function (error) {
          if (error !== null) {
            console.log('exec error: ' + error);
            return;
          }
          resolve(fileName);
        });
      } else {
        var errMsg = format('Video source {0} not attached', [videoSource]);
        reject(new Error(errMsg));
      }
    });
  });
};

var processImage = function(inputFile, outputFile) {
  return Q.Promise(function(resolve, reject) {
    var cmd = format('infrapix_single -i {0} --show_histogram -o {1}', [inputFile, outputFile]);
    exec(cmd, {
      cwd: '/home/pi/src/infrapix',
      env: process.env
    }, function (error) {
      if (error !== null) {
        console.log('exec error: ' + error);
        reject(new Error(error));
      } else {
        resolve(outputFile);
      }
    });
  });
};

var saveImage = function() {
  if (fileIndex >= 500) { fileIndex = 0; }
  var normalImageFile = path.join(OUT_DIR, format('rover_output_normal_{0}.jpg', fileIndex));
  var blueImageFile = path.join(OUT_DIR, format('rover_output_blue_{0}.jpg', fileIndex));

  Q.spread([
    takePicture(NORMAL_IMAGE_SOURCE, normalImageFile),
    takePicture(BLUE_IMAGE_SOURCE, blueImageFile)
  ], function(normalImageFilePath, blueImageFilePath) {
    var processedImageFilePath = path.join(OUT_DIR, format('processed_image_{0}.jpg', fileIndex++));

    processImage(blueImageFilePath, processedImageFilePath)
    .then(function(file) {
      console.log('Processed image and saved at', file);
    }, function(err) {
      console.log(err);
    });

  }, function(err) {
    console.log(err);
  });
};

setInterval(saveImage, 5000);
