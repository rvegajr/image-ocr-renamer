var path = require('path'); var InputPath = ""; var OutputPath = ""; var ReprocessFiles = false; var CompressOutputImages = false;
var thisPath = path.dirname(process.argv[1]) + path.sep;

/* Set User variables here */
//ReprocessFiles = true;  //set this to reprocess files that have already been processed
//CompressOutputImages = true;
//InputPath = "C:" + path.sep + "Temp" + path.sep + "Scanner" + path.sep + "";
//OutputPath = "C:" + path.sep + "Temp" + path.sep + "Scanner_Output" + path.sep + "";
/* End set user variables */

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
var gm = require('gm');
if (InputPath == "") InputPath = path.normalize(thisPath + 'data' + path.sep + 'input' + path.sep);
if (OutputPath == "") OutputPath = path.normalize(thisPath + 'data' + path.sep + 'output' + path.sep);
var WorkPath = os.tmpdir() + path.sep + pjson.name + path.sep;

Console.info(pjson.name + ' ' + pjson.version + '\n*********************************');
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
        var bar = new ProgressBar('  processing [:bar] :percent :etas\n', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: (filelist.length * 1)
        });
        async.eachSeries(filelist, function iterator(fileName, callback) {
            console.log(fileName);
            var fError = function (e) {
                Console.error('ERROR: ' + e);
                bar.tick(1);
                callback(e);
            }
            ocrutils.OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1025, y : 420, 'name' : 'codename' } })
            .then(function (data) {
                return OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1025, y : 160, 'name' : 'gamedatetime' }, results : data.results });
            })
            .done(function (data) {
                var TextResults = {};
                if (data.results.length > 0) TextResults[data.results[0].name] = data.results[0].ocrdtext;
                if (data.results.length > 1) TextResults[data.results[1].name] = data.results[1].ocrdtext;
                //if (data.results.length > 2) TextResults[data.results[2].name] = data.results[2].ocrdtext;
                TextResults['src'] = data.src;
                Console.info('\nText Found: ' + JSON.stringify(TextResults));
                
                var CodeNameRaw = TextResults.codename;
                var CodeName = CodeNameRaw.replace(/\n/gi, '').replace(/[^A-Za-z0-9/\s\:\-]/gi, '').trim();  //lets try to clean up code name,  OCRs can be messy
                if (CodeName.length == 0) {  //If this date was invalid (meanig 
                    CodeName = path.basename(fileName, path.extname(fileName));
                }
                
                var GameDateTimeRaw = TextResults.gamedatetime;
                var GameDateTimeFixed = GameDateTimeRaw.replace(/[^0-9/\s\:]/gi, '').trim();  //lets try to clean up the date,  OCRs can be messy
                var DateParsed = new Date(GameDateTimeFixed);
                //this particular use case allows us to compare years to make sure we have a valid date.  This tournament happened in the year this wwas written, so
                //  it becomes an easy way to determine if the year didn't come over as 200 AD
                var IsValidDate = ( !isNaN((DateParsed.valueOf())) && ((new Date().getYear())==(DateParsed.getYear())) ); 
                var GameDateTime = (DateParsed.toString('yyyyMMdd_HHmmss'));  //normalize the date
                try {
                    var sTargetPath = OutputPath + GameDateTime + path.sep;
                    if (!IsValidDate) sTargetPath = OutputPath + '_BADDATE' + path.sep;
                    var sNewFileName = sTargetPath + CodeName + path.extname(fileName);
                    if (!fs.existsSync(sTargetPath)) fs.mkdirSync(sTargetPath);
                    if (CompressOutputImages) {
                        fCompressImagePromise(fileName, sNewFileName).done(
                            function (data) {
                                bar.tick(1);
                                callback();
                            },
                            function (err) {
                                callback(err);
                            }
                        )
                    } else {
                        fs.writeFileSync(sNewFileName, fs.readFileSync(fileName));
                        bar.tick(1);
                        callback();
                    }
                } catch (e) {
                    Console.error("Error while procesing '" + fileName + "'. " + e);
                    bar.tick(1);
                    callback("Error while procesing '" + fileName + "'. " + e);
                }
            }, fError);
        }, function done() {
            fileutils.deleteFilesInPath(WorkPath, true);
            Console.info(pjson.name + ' completed.');
        });
    })
};

var fCompressImagePromise = function (imageFileName, outputFileName) {
    return new Promise(function (fulfill, reject) {
        var outFileName = path.basename(outputFileName);
        gm(imageFileName).resize(640)
        .write(WorkPath + outFileName, function (err) {
            if (err == null) {
                fileutils.moveFile(WorkPath + outFileName, outputFileName, function () {
                    fulfill({'src' : imageFileName, 'output' : outputFileName});
                });
            } else reject(err);
        });
    });    
};
