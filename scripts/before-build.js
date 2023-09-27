const fs = require('fs'),path=require('path'),zlib=require('zlib');
const package_name = require (path.join (__dirname,'..','package.json')).name;
const src = path.join (__dirname,'..','browser');
const dest =  path.join (__dirname,'..','browser-pkg');

function copyBrowserFilesAsExtra(subdir,filenames,output_path) {
    const basepath  = path.resolve(__dirname,'..',subdir);
    filenames =  filenames || fs.readdirSync(basepath).filter(function(fn){
        return !fn.startsWith(".") && !fn.endsWith(".txt"); 
    });
    const filepaths = filenames.map(function(fn){ return path.join(basepath,fn)});
    filepaths.forEach(function(pth,ix){ 
        const file_data = fs.readFileSync(pth);
        const file_path = path.join(output_path,subdir+'-' + filenames[ix]);
        fs.writeFileSync(file_path,file_data);
    });
 
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
if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {

    if (fs.existsSync(dest)) {
        if (fs.statSync(dest).isDirectory()) {
            fs.rmSync(dest,{ recursive: true, force: true });
        } else {
            fs.unlinkSync(dest,{  force: true });
        }
    } 

    fs.mkdirSync(dest,{recursive:true});
    copyBrowserFilesAsExtra('browser',undefined,dest)
}

incrementBuildNo();
