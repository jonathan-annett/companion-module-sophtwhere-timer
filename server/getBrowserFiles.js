module.exports = getBrowserFiles;

const aliases_ = {
    '/'           : '/timer.html',
    '/edit'       : '/event-edit.html',
    '/timer'      : '/timer.html',
    '/index.html' : '/timer.html',
};

function getBrowserFiles(fs,filenames,srcpath,aliases) {
    const ctype = {js : 'javascript',css:'css',html:'html' };
    const path      = require('path');
    const files = filenames || fs.readdirSync(srcpath||'./browser').filter(function(fn){return !fn.startsWith('.');});
    const content = {};
    files.forEach(function(fn){
        const body =  fs.readFileSync(path.join(srcpath||'./browser',fn),'utf8');   
        content['/'+fn]= {
            body: body,
            headers : {
                'content-type': 'text/'+ctype[fn.split('.').pop()],
                'content-length' : content.length
            }
        };
    });
    aliases = aliases || aliases_;
    Object.keys(aliases).forEach(function(aliased_uri){
        const uri = aliases[aliased_uri];
        content[aliased_uri]=content[uri];
        console.log(`${aliased_uri} ---> ${uri}`)
    });
 
    return content;
}

