

function getBrowserFiles() {
    const fs = require('fs'),path=require('path'),zlib=require('zlib');
    const zlibOpts = {level:9};
    const filenames =  [
        // these files are cached for the browser
        'timer.html',
        'timer.js',
        'timer.css',
        'fsapi.js',
        'longPollPoster.js'
    ];
    const basepath = path.resolve(__dirname,'browser');
    const filepaths = filenames.map(function(fn){ return path.join(basepath,fn)});
    const filedata  = filepaths.map(function(pth){ return zlib.deflateSync(fs.readFileSync(pth),zlibOpts).toString('base64');});
    const db={};

    return `
        
        const zlib=require('zlib'),db = ${JSON.stringify({files:filenames,data:filedata})};

        ${fs_readSync.toString()}

        console.log(fs_readSync('timer.html','utf8'));
    `;

    function fs_readSync(path,encoding) {
        const index = db.files.indexOf( path.split('/').pop() );
        console.log(index);
        if (index<0) return;

        let buf,b64 = (buf=db.data[index]); 
        if (typeof b64 === 'string') {
            try {
                buf = (db.data[index] = zlib.inflateSync(Buffer.from(b64,'base64')));
            } catch (e) {
                console.log(e);
                buf = (db.data[index] = null);
            }
        }
        if (buf && typeof buf === 'object' && buf.constructor===Buffer) {
            if (encoding==='utf8') {
                return buf.toString('utf8');
            }
        }
        return buf;
    }
}

console.log( getBrowserFiles())