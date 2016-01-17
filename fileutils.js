var fs = require('fs');
var path = require('path');
var s = require('string');
var datejs = require('datejs');
var Console = require('./log.js');
var Configstore = require('configstore');
var datastore = new Configstore('datastore');
var Promise = require('bluebird');
var defaultModifiedDateTime = "00000000000000";
var reprocessFiles = false;

var totals = {'filesread' : 0, 'processed' : 0, 'skipped' : 0, 'errors' : 0};
//fOnFile should return true if you want to acknowlege it is processed, this will mark this as complete
module.exports = {
    listFilesInPathAsync : function (currentPath) {
        var files = [];
        return new Promise(function (fulfill, reject) {
            var walk = require('walk');
            
            var walker = walk.walk(currentPath, { followLinks: false });
            
            walker.on('file', function (root, stat, next) {
                totals.filesread++;
                var currentFile = root + stat.name;
                var stats = fs.statSync(currentFile);
                if (stats.isFile()) {
                    var sCachedDateLastModified = datastore.get(currentFile) || defaultModifiedDateTime;
                    var sDateLastModified = stats['mtime'].toString("yyyyMMddHHmmss");
                    if ((currentFile.endsWith('.jpeg')) || (currentFile.endsWith('.jpg'))) {
                        if (reprocessFiles || ((sCachedDateLastModified == defaultModifiedDateTime) || (defaultModifiedDateTime > sCachedDateLastModified))) {
                            files.push(currentFile);
                        } else {
                            Console.info(currentFile + ' already processed.. skipping');
                            totals.skipped++;
                        }
                    }
                }
                next();
            });
            
            walker.on("errors", function (root, nodeStatsArray, next) {
                reject(root);
            });
            
            walker.on('end', function () {
                fulfill(files);
            });
        })
    }
    , recursiveProcessHTMLFilesInPath : function (currentPath, fOnFile, fOnComplete) {
        var walk = require('walk');
        var files = [];
        
        // Walker options
        var walker = walk.walk(currentPath, { followLinks: false });
        
        walker.on('file', function (root, stat, next) {
            totals.filesread++;
            var currentFile = root + stat.name;
            var stats = fs.statSync(currentFile);
            if (stats.isFile()) {
                var sCachedDateLastModified = datastore.get(currentFile) || defaultModifiedDateTime;
                var sDateLastModified = stats['mtime'].toString("yyyyMMddHHmmss");
                if ((currentFile.endsWith('.jpeg')) || (currentFile.endsWith('.jpg'))) {
                    if (reprocessFiles || ((sCachedDateLastModified == defaultModifiedDateTime) || (defaultModifiedDateTime > sCachedDateLastModified))) {
                        if (typeof fOnFile == "function") {
                            var files = [];
                            if (fOnFile(currentFile)) {
                                datastore.set(currentFile, sDateLastModified);
                                totals.processed++;
                            } else {
                                totals.errors++;
                            }
                        }
                    } else {
                        Console.info(currentFile + ' already processed.. skipping');
                        totals.skipped++;
                    }
                }
            }
            else if (stats.isDirectory()) {
                this.recursiveProcessHTMLFilesInPath(currentFile, fOnFile);
            }
            next();
        });
        
        walker.on('end', function () {
            fOnComplete(totals);
        });
    }
    ,
    recursiveProcessHTMLFilesInPath2: function (currentPath, fOnFile, fOnComplete) {
        console.log(currentPath);
        var files = fs.readdirSync(currentPath);
        for (var i in files) {
            totals.filesread++;
            var currentFile = currentPath + files[i];
            var stats = fs.statSync(currentFile);
            if (stats.isFile()) {
                var sCachedDateLastModified = datastore.get(currentFile) || defaultModifiedDateTime;
                var sDateLastModified = stats['mtime'].toString("yyyyMMddHHmmss");
                if ((currentFile.endsWith('.jpeg')) || (currentFile.endsWith('.jpg'))) {
                    if (reprocessFiles || ((sCachedDateLastModified == defaultModifiedDateTime) || (defaultModifiedDateTime > sCachedDateLastModified))) {
                        if (typeof fOnFile == "function") {
                            if (fOnFile(currentFile)) {
                                datastore.set(currentFile, sDateLastModified);
                                totals.processed++;
                            } else {
                                totals.errors++;
                            }
                        }
                    } else {
                        Console.info(currentFile + ' already processed.. skipping');
                        totals.skipped++;
                    }
                }
            }
            else if (stats.isDirectory()) {
                this.recursiveProcessHTMLFilesInPath(currentFile, fOnFile);
            }
        }
        if (typeof fOnComplete == "function") {
            fOnComplete(totals);
        }
    }
    , moveFile : function(oldPath, newPath, callback) {
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                if (err.code === 'EXDEV') {
                    copy();
                } else {
                    callback(err);
                }
                return;
            }
            callback();
        });

        function copy() {
            var readStream = fs.createReadStream(oldPath);
            var writeStream = fs.createWriteStream(newPath);
    
            readStream.on('error', callback);
            writeStream.on('error', callback);
            readStream.on('close', function () {
        
                fs.unlink(oldPath, callback);
            });
    
            readStream.pipe(writeStream);

        }
    }
    , appendToFileName : function (pathToAppendTo, stringToAppend) {
        return path.dirname(pathToAppendTo) + path.basename(pathToAppendTo) + stringToAppend + path.extname(pathToAppendTo);
    },
    recordTotals : function () {
        return totals;
    }
    , setReprocessFile : function (val) {
        reprocessFiles = (val == true);
    }
    , deleteFilesInPathAsync : function (dirPath, removeSelf) {
        return new Promise(function (fulfill, reject) {
            try {
                filecnt = 0;
                pathcnt = 0;
                if (removeSelf === undefined) removeSelf = false;
                var files = fs.readdirSync(dirPath);
                if (files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                        var filePath = dirPath + '/' + files[i];
                        if (fs.statSync(filePath).isFile()) {
                            filecnt++;
                            fs.unlinkSync(filePath);
                        } else {
                            pathcnt++;
                            rmDir(filePath);
                        }
                    }
                }
                if (removeSelf) {
                    pathcnt++;
                    fs.rmdirSync(dirPath);
                }
                fulfill({'filecnt' : filecnt, 'pathcnt' : pathcnt});
            } catch (e) {
                reject(e);
            }
        }
    )} 
    , deleteFilesInPath : function (dirPath, removeSelf) {
        if (removeSelf === undefined)
            removeSelf = false;
        try { var files = fs.readdirSync(dirPath); }
      catch (e) { return; }
        if (files.length > 0)
            for (var i = 0; i < files.length; i++) {
                var filePath = dirPath + '/' + files[i];
                if (fs.statSync(filePath).isFile())
                    fs.unlinkSync(filePath);
                else
                    rmDir(filePath);
            }
        if (removeSelf)
            fs.rmdirSync(dirPath);
    }
};