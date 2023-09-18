module.exports = 
function getBrowserFiles() {
    const fs = require('fs');
    const path      = require('path');
    const browser_path = path.resolve(__dirname,'..','browser');

    const files = fs.readdirSync(browser_path).filter(function(fn){return !fn.startsWith('.');});
    const content = {};
    files.forEach(function(fn){
        const body =  fs.readFileSync(path.join(__dirname,'..','browser',fn),'utf8');   
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