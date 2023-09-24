const os = require('os');
const libs = {
    win32 : require('./comp-boot-starts-win32.js'),
    linux : require('./comp-boot-starts-linux.js'),
};
libs.win64=libs.win32;
const lib = libs[ os.platform() ];
 
module.exports = lib ? lib () : {  };
console.log({exports:module.exports});
