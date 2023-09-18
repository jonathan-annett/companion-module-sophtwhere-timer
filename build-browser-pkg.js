const fs = require('fs'),path=require('path'),zlib=require('zlib');
  

function writeBrowserFilesPacked(subdir,filenames) {
    const zlibOpts = {level:9};
    const basepath  = path.resolve(__dirname,subdir);
    filenames =  filenames || fs.readdirSync(basepath);
    const output_path = path.resolve(__dirname,'server',subdir+'-pkg-fs.js');
    const filepaths = filenames.map(function(fn){ return path.join(basepath,fn)});
    const filedata  = filepaths.map(function(pth){ return zlib.deflateSync(fs.readFileSync(pth),zlibOpts).toString('base64');});
    const db={};

    const src = `
        const zlib=require('zlib'),db = ${JSON.stringify({files:filenames,data:filedata})};

        const fs = {
            readFileSync :  ${fs_readSync.toString()},
            readdirSync  :  function(){ return ${JSON.stringify(filenames) };}
        };

        module.exports = fs;
    `;

    console.log('writing to:',output_path,' >>> ');
    fs.writeFileSync(output_path,src);

    function fs_readSync(path,encoding) {
        const index = db.files.indexOf( path.replace(/\\/g,'/').split('/').pop() );
        if (index<0) return;

        let buf,b64 = (buf=db.data[index]); 
        if (typeof b64 === 'string') {
            try {
                const deflated_buffer = Buffer.from(b64,'base64');
                const inflated_buffer = zlib.inflateSync(deflated_buffer);
                buf = (db.data[index] = inflated_buffer);     
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

// make sure the HELP.md in the companion folder is the latest, clean version.
fs.writeFileSync ( 
    path.resolve(__dirname,'companion','HELP.md'),
    fs.readFileSync ( path.resolve(__dirname,'server','HELP.md'))
);

writeBrowserFilesPacked('browser');
writeBrowserFilesPacked('server',['HELP.md']);
