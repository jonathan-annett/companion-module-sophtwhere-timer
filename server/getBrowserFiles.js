module.exports = getBrowserFiles;

function getBrowserFiles(fs) {
    const path      = require('path');
    const files = fs.readdirSync('./browser').filter(function(fn){return !fn.startsWith('.');});
    const content = {};
    files.forEach(function(fn){
        const body =  fs.readFileSync(fn,'utf8');   
        content['/'+fn]= {
            body: body,
            headers : {
                'content-type': 'text/'+fn.split('.').pop(),
                'content-length' : content.length
            }
        };
    });

    content['/index.html']=content['/timer.html'];
    content['/']=content['/timer.html'];
    return content;
}

