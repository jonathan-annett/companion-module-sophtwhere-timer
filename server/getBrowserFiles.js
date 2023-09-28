const is_webpacked  = __filename.endsWith('main.js');

module.exports = is_webpacked ? getWebpackedBrowserFiles : getBrowserFiles;

const fs = require('fs');
const aliases_ = {
    '/'           : '/timer.html',
    '/edit'       : '/event-edit.html',
    '/timer'      : '/timer.html',
    '/index.html' : '/timer.html',
};  

const ctype = {
    js : 'text/javascript',
    css:'text/css',
    html:'text/html',
    ico:'image/vnd.microsoft.icon',
    png:'image/png'  
};
  

function getBrowserFiles(srcpath,aliases) {
    const path      = require('path');
    srcpath = srcpath ? srcpath : './browser/';
    const filtered = srcpath.endsWith ('-') ? path.basename(srcpath) : null;
    const browser_dir_path = filtered ? path.dirname(srcpath)+'/' : srcpath;
    const file_filter = filtered ?  function(fn){return fn.startsWith(filtered);} : function(fn){return !fn.startsWith('.');};
    const files = fs.readdirSync(browser_dir_path).filter(file_filter);
  
    const content = {};
    files.forEach(function(fn){
        let fn_read_path = browser_dir_path+fn;
        const ext = fn.split('.').pop()
        let contentType = ctype[ ext ];
        if ( ext === 'require' ) {
            const require_inject = JSON.parse(fs.readFileSync(fn_read_path,'utf8'));
            fn =  Object.keys(require_inject)[0];
            fn_read_path = require.resolve(require_inject[fn]);
            const uri = filtered ? '/' + fn.substring(filtered.length) : '/' + fn ; 
            console.log({fn,ext,fn_read_path,uri});
            content[uri] = function(request,response) {
                fs.readFile(fn_read_path,function(err,content){
                    if (err) {
                        console.log(err||!content);
                        response.setHeader('content-type','text/plain');
                        response.writeHead(404);
                        response.write(uri+' not found');
                        return  response.end();
                    }
                    const sendContent = function(request,response) {
                        response.setHeader('content-type','text/javascript');
                        response.setHeader('content-length',content.byteLength);
                        response.writeHead(200);
                        response.write(content);
                        response.end();
                    };
                    content[uri] = sendContent;
                    sendContent(request,response);
                });
            };
            return;
        }
        const uri = filtered ? '/' + fn.substring(filtered.length) : '/' + fn ; 
        content[uri] = function(request,response) {
            fs.readFile(fn_read_path,function(err,content){
                if (err) {
                    console.log(err||!content);
                    response.setHeader('content-type','text/plain');
                    response.writeHead(404);
                    response.write(uri+' not found');
                    return  response.end();
                }
                const sendContent = function(request,response) {
                    response.setHeader('content-type',contentType);
                    response.setHeader('content-length',content.length||content.byteLength);
                    response.writeHead(200);
                    response.write(content);
                    response.end();
                };
                content[uri] = sendContent;
                sendContent(request,response);
            });
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


function getWebpackedBrowserFiles(srcpath,aliases) {
    const path      = require('path');
    srcpath = srcpath ? srcpath : './browser/';
    const filtered = srcpath.endsWith ('-') ? path.basename(srcpath) : null;
    const browser_dir_path = filtered ? path.dirname(srcpath)+'/' : srcpath;
    const file_filter = filtered ?  function(fn){return fn.startsWith(filtered);} : function(fn){return !fn.startsWith('.');};
    const files = fs.readdirSync(browser_dir_path).filter(file_filter);
  
    const content = {};
    files.forEach(function(fn){
        let fn_read_path = browser_dir_path+fn;
        const ext = fn.split('.').pop()
        let contentType = ctype[ ext ];
        const uri = filtered ? '/' + fn.substring(filtered.length) : '/' + fn ; 
        content[uri] = function(request,response) {
            fs.readFile(fn_read_path,function(err,content){
                if (err) {
                    console.log(err||!content);
                    response.setHeader('content-type','text/plain');
                    response.writeHead(404);
                    response.write(uri+' not found');
                    return  response.end();
                }
                const sendContent = function(request,response) {
                    response.setHeader('content-type',contentType);
                    response.setHeader('content-length',content.length||content.byteLength);
                    response.writeHead(200);
                    response.write(content);
                    response.end();
                };
                content[uri] = sendContent;
                sendContent(request,response);
            });
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

