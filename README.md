# Image OCR Renamer (image-ocr-renamer)

This node.js project will synchronously and recursively loop through all JPGs in a directory and ocr specified regions of images within a directory.  It will then rename the files based on the OCRed data and move them to an output directory.  This project was developed in Visual Studio 2015 using NodeJS tools. It is NodeJS and the supporting modules (OCR and Image processing) all have *nix and osx versions,  so in theory it should work on those platforms as well.  The app looks at jpg (or jpeg) images with a resolution of 300.  The higher the resolution, the more accurate tesseract will be it the OCR.  If the resolution is less or more than 300, there is math to scale the location of the region.  If you scan and image, you need to make sure it is scanned into a JPG at 300dpi.  There is logic to not process images that it has already processed (by name and modified date and time).  If you change the image and rerun the process, the application will know it has changed and reprocess the image.  


## Installation
#### Prerequisites
###### 3rd Party Required Modules
GraphicsMagick - http://www.graphicsmagick.org
tesseract-ocr - https://code.google.com/p/tesseract-ocr/

###### Windows Installation 
1. Go to https://code.google.com/p/tesseract-ocr/downloads/detail?name=tesseract-ocr-setup-3.02.02.exe and download and install the setup for Tesseract OCR
2. Go to http://sourceforge.net/projects/graphicsmagick/files/graphicsmagick-binaries/1.3.23/ and install GraphicsMagick
3. Open the Windows command prompt, change the directory the cloned project path,  then type "npm install" (this will install the packages required for the app)
4. type "node app.js" and let it fly

###### MacOSX Installation 

1. Download and install MacPorts https://www.macports.org/install.php
2. Open the OSX terminal and type "sudo port install tesseract" - go get some coffee or a shot of tequila, this will take a bit
3. Once tesseract is installed, using the format of "sudo port install tesseract-<langcode>", thus I typed "sudo port install tesseract-eng"...  Look at https://www.macports.org/ports.php?by=name&substr=tesseract- to see additional languages, Thanks https://code.google.com/p/tesseract-ocr/wiki/ReadMe for the installation instructions
4. In the terminal, type "sudo port install GraphicsMagick" 
5. Clone the project, change the directory to where the project has been cloned,  then type "npm install" (this will install the packages required for the app)
6. type "node app.js" and let it fly


## Usage
The following code lines define the regions that will be defined.  You can add multiple 'then' clauses to add more regions.  These are passed through 'data.results' 

            ocrutils.OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1075, y : 440, 'name' : 'codename' } })
            .then(function (data) {
                return OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1075, y : 195, 'name' : 'gamedatetime' }, results : data.results });
            })
            //.then(function (data) {
            //    return OCRImageSectionAsync({ imageFileName : fileName, region : { w : 450, h : 150, x : 1075, y : 195, 'name' : 'gamedatetime' }, results : data.results });
            //})

Data will be returned through the "data" parameter

                if (data.results.length > 0) TextResults[data.results[0].name] = data.results[0].ocrdtext;
                if (data.results.length > 1) TextResults[data.results[1].name] = data.results[1].ocrdtext;
                //if (data.results.length > 2) TextResults[data.results[2].name] = data.results[2].ocrdtext;  <== uncommend me if you uncomment the .then( above.
			
Use the value passed through this to process funky OCRed characters and rename the file 			

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## History

V0.1 - Initial Development and Checkin

## Credits

Much thanks to the following authors of the great node projects used in this utility.
Thanks specifically to
GraphicsMagick (http://www.graphicsmagick.org/Copyright.html)
and Tesseract-OCR (https://code.google.com/p/tesseract-ocr/)


###### Node Modules
Async.js 
	- https://github.com/caolan/async 
	- npm install async
bluebird 
	- http://bluebirdjs.com/docs/getting-started.html 
	- npm install bluebird
configstore 
	- https://www.npmjs.com/package/configstore 
	- npm install configstore
datejs 
	- https://www.npmjs.com/package/datejs 
	- npm install datejs
extend 
	- https://www.npmjs.com/package/extend 
	- npm install extend
gm - !! 
	- https://www.npmjs.com/package/gm 
	- npm install gm
node-tesseract - !! 
	- https://www.npmjs.com/package/node-tesseract 
	- npm install node-tesseract
progress 
	- https://www.npmjs.com/package/progress 
	- npm install progress
string 
	- https://www.npmjs.com/package/string 
	- npm install --save string
walk 
	- https://www.npmjs.com/package/walk 
	- npm install --save walk
winston 
	- https://github.com/winstonjs/winston 
	- npm install winston
	
## License
Ricardo Vega Jr. - image-ocr-renamer
Utility to ocr a directory of images based on regions within the image and copy them to a target directory with a new name.
Copyright (C) 2016 Ricardo Vega Jr.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
