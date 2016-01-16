﻿var path = require('path');
var thisPath = path.dirname(process.argv[1]) + path.sep;
var Promise = require('bluebird');
var fileutils = require(thisPath + 'fileutils.js');
var ocrutils = require(thisPath + 'ocrutils.js');
var Console = require(thisPath + 'log.js');
var fs = require('fs');
var s = require('string');
var datejs = require('datejs');
var ProgressBar = require('progress');
var async = require('async');
var pjson = require(thisPath + 'package.json');
var os = require('os');

var InputPath = path.normalize(thisPath + 'data' + path.sep+ 'input' + path.sep);
var OutputPath = path.normalize(thisPath + 'data' + path.sep+ 'output' + path.sep);
var WorkPath = os.tmpdir() + path.sep + pjson.name + path.sep;
var ReprocessFiles = true;

Console.info('LSOCR Image Processor ' + pjson.version + '\n*********************************');
Console.info('InputPath=' + InputPath);
Console.info('OutputPath=' + OutputPath);
Console.info('ReprocessFiles=' + ReprocessFiles);

if (!fs.existsSync(WorkPath)) {
    fs.mkdirSync(WorkPath);
}
if (!fs.existsSync(WorkPath)) {
    Console.error('Work path does not exist...' + WorkPath);
    return false;
} else {

    fileutils.setReprocessFile(ReprocessFiles);
    fileutils.deleteFilesInPath(WorkPath);
    fileutils.listFilesInPathAsync(InputPath)
    .then(function (filelist) {
        var bar = new ProgressBar('  processing [:bar] :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: (filelist.length * 1)
        });
        async.eachSeries(filelist, function iterator(fileName, callback) {
            console.log(fileName);
            var fComplete = function (data) {
                var TextResults = {};
                if (data.results.length > 0) TextResults[data.results[0].name] = data.results[0].ocrdtext;
                if (data.results.length > 1) TextResults[data.results[1].name] = data.results[1].ocrdtext;
                TextResults['src'] = data.src;
                Console.info('\nText Found: ' + JSON.stringify(TextResults));
                bar.tick(1);
                callback();
            }
            var fError = function (e) {
                Console.error('ERROR: ' + e);
                bar.tick(1);
                callback(e);
            }
            
            ocrutils.OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1075, y : 440, 'name' : 'codename' } })
            .then(function (data) {
                return OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1075, y : 195, 'name' : 'gamedatetime' }, results : data.results });
            })
            .done(fComplete, fError);
        }, function done() {
            fileutils.deleteFilesInPath(WorkPath, true);
            Console.info(pjson.name + ' completed.');
        });
    })
};