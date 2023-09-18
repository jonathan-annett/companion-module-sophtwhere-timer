function getTruePath(subdir) {
    const path = require('path');
    const truepath = path.join(__dirname, (__filename.endsWith('main.js')) ? '.' : '..', subdir);
    return truepath;
}
module.exports.getTruePath = getTruePath;
