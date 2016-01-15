# Image OCR Renamer (image-ocr-renamer)

This node.js project will synchronously and recursively loop through all JPGs in a directory and ocr specified regions of images within a directory.  It will then rename the files based on the OCRed data and move them to an output directory.  This project was developed in Visual Studio 2015 using NodeJS tools. It is NodeJS and the supporting modules (OCR and Image processing) all have *nix and osx versions,  so in theory it should work on those platforms as well.  The app looks at jpg (or jpeg) images with a resolution of 300.  The higher the resolution, the more accurate tesseract will be it the OCR.  If the resolution is less or more than 300, there is math to scale the location of the region.  If you scan and image, you need to make sure it is scanned into a JPG at 300dpi.  There is logic to not process images that it has already processed (by name and modified date and time).  If you change the image and rerun the process, the application will know it has changed and reprocess the image.  


## Installation
#### Prerequisites
###### 3rd Party Required Modules
1. GraphicsMagick - http://www.graphicsmagick.org
2. tesseract-ocr - https://code.google.com/p/tesseract-ocr/

###### Node Modules
1. Async.js 
	- https://github.com/caolan/async 
	- npm install async
	
2. bluebird 
	- http://bluebirdjs.com/docs/getting-started.html 
	- npm install bluebird
	
3. configstore 
	- https://www.npmjs.com/package/configstore 
	- npm install configstore
	
4. datejs 
	- https://www.npmjs.com/package/datejs 
	- npm install datejs
5. extend 
	- https://www.npmjs.com/package/extend 
	- npm install extend
	
6. gm - !! 
	- https://www.npmjs.com/package/gm 
	- npm install gm
	
7. node-tesseract - !! 
	- https://www.npmjs.com/package/node-tesseract 
	- npm install node-tesseract
	
8. progress 
	- https://www.npmjs.com/package/progress 
	- npm install progress
	
9. string 
	- https://www.npmjs.com/package/string 
	- npm install --save string
	
10. walk 
	- https://www.npmjs.com/package/walk 
	- npm install --save walk
	
11. winston 
	- https://github.com/winstonjs/winston 
	- npm install winston
	


## Usage

1.

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
