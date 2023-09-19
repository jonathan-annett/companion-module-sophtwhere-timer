module.exports = getBrowserFiles;

const aliases = {
    '/'           : '/timer.html',
    '/edit'       : '/event-edit.html',
    '/timer'      : '/timer.html',
    '/index.html' : '/timer.html',
};

function getBrowserFiles(fs) {
    const path      = require('path');
    const files = fs.readdirSync('./browser').filter(function(fn){return !fn.startsWith('.');});
    const content = {};
    files.forEach(function(fn){
        const body =  fs.readFileSync(path.join('./browser',fn),'utf8');   
        content['/'+fn]= {
            body: body,
            headers : {
                'content-type': 'text/'+fn.split('.').pop(),
                'content-length' : content.length
            }
        };
    });

    Object.keys(aliases).forEach(function(aliased_uri){
        const uri = aliases[aliased_uri];
        content[aliased_uri]=content[uri];
        console.log(`${aliased_uri} ---> ${uri}`)
    });
 
    return content;
}

