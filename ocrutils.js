var path = require('path');
var thisPath = path.dirname(process.argv[1]) + path.sep;
var os = require('os');
var Promise = require('bluebird');
var fileutils = require('./fileutils.js');
var Console = require('./log.js');
var fs = require('fs');
var s = require('string');
var path = require('path');
var datejs = require('datejs');
var tesseract = require('node-tesseract');
var gm = require('gm');
var extend = require('extend');
var pjson = require(thisPath + 'package.json');
var WorkPath = os.tmpdir() + path.sep + pjson.name + path.sep;

OCRImageSection = function (options) {
    options = extend({ imageFileName : '', region : { w : 0, h : 0, x : 0, y : 0, name : '' }, results : [], fOnComplete : function (data) { return true; }, fOnError : function (e) { Console.error(e); return false; } }, options);
    var imageFileName = options.imageFileName;
    var outFileName = path.basename(imageFileName);
    if (!fs.existsSync(WorkPath)) {
        Console.error('Work path does not exist...' + WorkPath);
        return false;
    }
    
    var loadImageAsync = function (fileNameToLoad) {
        return new Promise(function (fulfill, reject) {
            //if (error) reject(error);
            fulfill({ 'img' : gm(fileNameToLoad), 'result' : {} });
        })
    };
    var getImageSizeAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            data.img.size(function (err, value) {
                if (err == null)
                    fulfill({ 'img' : data.img, 'result' : extend(data.result, value) })
                else
                    reject(err);
            });
        })
    };
    var getImageResAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            data.img.res(function (err, value) {
                if (err == null) {
                    value = value.split('x')[0] * 1;
                    fulfill({ 'img' : data.img, 'result' : extend(data.result, { 'res' : value }) })
                } else
                    reject(err);
            });
        })
    };
    var cropImageAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            try {
                //this will scale the image base on the resolution.  The size 
                var scaler = (data.result.res / 300) * 1.0;
                data.img.crop((options.region.w * scaler), (options.region.h * scaler), (options.region.x * scaler), (options.region.y * scaler));
                fulfill({ 'img' : data.img, 'result' : data.result, 'name' : options.region.name });
            } catch (e) {
                reject(e);
            }
        })
    };
    var writeImageAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            data.img.write(outFileName, function (err) {
                if (err == null) {
                    fileutils.moveFile(outFileName, WorkPath + outFileName, function () {
                        //Console.info('Process ' + outFileName + ' into ' + WorkPath + outFileName + '    err=' + err);
                        fulfill(extend(data, { 'imgtemp' : WorkPath + outFileName }));
                    });
                } else reject(err);
            });
        })
    };
    var oCRImageAsync = function (data) {
        return new Promise(function (fulfill, reject) {
            tesseract.process(data.imgtemp, function (err, text) {
                if (err == null) {
                    fulfill(extend(data, { 'ocrdtext' : text }));
                } else {
                    reject(err);
                }
            });
        })
    };
    var errorHandler = function (e) {
        if (typeof options.fOnError == "function") {
            options.fOnError(e);
        } else {
            Console.error(e);
        }
    };
    var completed = function (data) {
        if (typeof options.fOnComplete == "function") {
            var ret = { 'ocrdtext' : data.ocrdtext, 'name' : data.name, 'src' : imageFileName };
            options.results.push(ret);
            ret = extend(ret, { results : options.results });
            options.fOnComplete(ret);
        }
        return data.ocrdtext;
    };
    loadImageAsync(imageFileName)
                .then(getImageSizeAsync)
                .then(getImageResAsync)
                .then(cropImageAsync)
                .then(writeImageAsync)
                .then(oCRImageAsync)
                .done(completed, errorHandler);
};

OCRImageSectionAsync = function (options) {
    return new Promise(function (fulfill, reject) {
        OCRImageSection({
            imageFileName : options.imageFileName
            , region : options.region
            , results : options.results
            , fOnComplete : function (data) {
                fulfill(data);
            }
            , fOnError : function (e) {
                reject(e);
            }
        })
    })
};

module.exports = {
    'OCRImageSection' : OCRImageSection,
    'OCRImageSectionAsync' : OCRImageSectionAsync
};
