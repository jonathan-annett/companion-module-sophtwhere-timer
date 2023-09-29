/*!
 * companion-module-sophtwhere-timer/scripts/before-build.js
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */
const includeDev = false;
const fs = require('fs'),path=require('path');
const package_name = require (path.join (__dirname,'..','package.json')).name;
const { minify,html_regexp } = require ('./minifiers.js');
const src = path.join (__dirname,'..','browser');
const dest =  path.join (__dirname,'..','browser-pkg');

const require_regexp = /\.require$/;

function copyRequireInject(pth,subdir,output_path) {
    const require_inject = JSON.parse(fs.readFileSync(pth,'utf8'));
    const uri =  Object.keys(require_inject)[0];
    const req = require_inject[uri];
    const req_path = typeof req==='string' ? require.resolve(req) : path.join( path.dirname( require.resolve(req.require)), req.resolve) ;
    const content   = fs.readFileSync(req_path);
    const file_path = path.join(output_path,subdir+'-' + uri);
    fs.writeFileSync(file_path,content);
    if (file_path.endsWith(".min.js")) return null;

    const minified = minify(path.basename(uri),content);
    if (minified) {
        const file_path_min = minified.extFix( file_path );
        fs.writeFileSync(file_path_min,minified.contentMin);
    }
    return minified;
    
}

function copyBrowserFilesAsExtra(subdir,filenames,output_path) {
    const basepath  = path.resolve(__dirname,'..',subdir);

    
    filenames =  filenames || fs.readdirSync(basepath).filter(function(fn){
        return !fn.startsWith(".") && !fn.endsWith(".txt"); 
    });
    const filepaths = filenames.map(function(fn){ return path.join(basepath,fn)});
    const fixups = [];
    filepaths.forEach(function(pth,ix){ 
        if (html_regexp.test(pth)) return;
        let minified,file_data,file_path;
        if (require_regexp.test(pth)) {
            minified = copyRequireInject(pth,subdir,output_path) ;
            if (minified && minified.htmlFix ) {
                fixups.push(minified );
            }
           return;
        } else {
            file_data = fs.readFileSync(pth);
            file_path = path.join(output_path,subdir+'-' + filenames[ix]);
            minified = minify(filenames[ix],file_data);
        }
        if (minified) {
            if (minified.contentMin) {
                const file_path_min = minified.extFix( file_path );
                fs.writeFileSync(file_path_min,minified.contentMin);
                if ( minified.htmlFix ) {
                    fixups.push(minified );
                }
            }
            if (file_data && !minified.contentMin || includeDev) {
                fs.writeFileSync(file_path,file_data);
            }
        } else {
            if (file_data) {
                fs.writeFileSync(file_path,file_data);
            }
        }  
    });

    filepaths.forEach(function(pth,ix){

        if (!html_regexp.test(pth)) return;

        const clean_file_data = fs.readFileSync(pth,'utf8');
        let file_data = clean_file_data;
        fixups.forEach(function(f){
            file_data = f.htmlFix(file_data);
        });

        const minified = minify(filenames[ix],Buffer.from(file_data));
       
        if (includeDev || !minified) {
            const file_path = path.join(output_path,subdir+'-' + filenames[ix]).replace(html_regexp,'-dev.html');
            fs.writeFileSync(file_path,clean_file_data);
        }

        if (minified) {
            const file_path = path.join(output_path,subdir+'-' + filenames[ix]);
            fs.writeFileSync(file_path,minified.contentMin);
        }
       
    });
}


function  copyBrowserFiles(){
    if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {

        if (fs.existsSync(dest)) {
            if (fs.statSync(dest).isDirectory()) {
                fs.rmSync(dest,{ recursive: true, force: true });
            } else {
                fs.unlinkSync(dest,{  force: true });
            }
        } 

        fs.mkdirSync(dest,{recursive:true});
        copyBrowserFilesAsExtra('browser',undefined,dest);
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



copyBrowserFiles();

incrementBuildNo();
