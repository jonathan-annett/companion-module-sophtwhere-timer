const fs = require('fs'),path=require('path'),zlib=require('zlib');
  

function writeBrowserFilesPacked(subdir,filenames,outfile) {
    const zlibOpts = {level:9};
    const basepath  = path.resolve(__dirname,'..',subdir);
    filenames =  filenames || fs.readdirSync(basepath).filter(function(fn){
        return !fn.startsWith(".") && !fn.startsWith(".txt"); 
    });
    const output_path = path.resolve(__dirname,'..','server', (outfile|| subdir)+'-pkg-fs.js');
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

    console.log('writing to:',output_path,' <<< ',JSON.stringify(filenames));
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

function incrementBuildNo() {
    const package_path = path.join(__dirname,'..','package.json');
    const package = JSON.parse(fs.readFileSync(package_path,'utf8'));
    const vers = package.version.split(".");
    const buildNo = (Number.parseInt(vers.pop())||0)+1;
    vers.push(buildNo.toString());
    package.version = vers.join('.');
    console.log({build:{name:package.name,version:package.version,buildNo}});
    fs.writeFileSync(package_path,JSON.stringify(package,undefined,4));

    const manifest_path = path.join(__dirname,'..','companion','manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifest_path,'utf8'));

    manifest.version = package.version;
    fs.writeFileSync(manifest_path,JSON.stringify(manifest));
}

writeBrowserFilesPacked('browser');
incrementBuildNo();