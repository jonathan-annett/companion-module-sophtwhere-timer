The server folder contains files that are related to the small http node.js server instance that is started to support the timer.

Additionally, it contains the master HELP.md file, which is read and augmented with the current list of interface addresses, in order to provide links for the timer instance

This happens on module startup, or whenever the port is changed in the connection config page

in order allow webpack to produce a single main.js file, this HELP.md file is stored as a compressed file archive.

the resulting file is server/server-pkg-fs.js, which is webpacked into main.js 

see build-browser-pkg.js, which is invoked from the "build" script in package.json
