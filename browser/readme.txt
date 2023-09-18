The browser folder contains files that are bundled compiled into a compressed data file, this is to enable them to be webpacked into a single main.js file

the resulting file is server/browser-pkg-fs.js, which is webpacked into main.js 

see build-browser-pkg.js, which is invoked from the "build" script in package.json
