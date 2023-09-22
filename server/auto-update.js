/*!
 * companion-module-sophtwhere-timer/server/auto-update.js
 * Utility to Check for updates, for beta testers
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */
const https = require('https');
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const ostmp = require('os').tmpdir();

const console = {log : ()=>{}, warn  : ()=>{}};

let module_relative_path = path.join.apply(path, __filename.endsWith('main.js') ? [__dirname] : [__dirname, '..']);

let manifest_relative_path = path.join(module_relative_path, 'companion', 'manifest.json');

const manifest_exists  = fs.existsSync(manifest_relative_path),
manifest = {
    source : manifest_exists ? manifest_relative_path : 'implied',
    json: manifest_exists ? JSON.parse(fs.readFileSync(manifest_relative_path,'utf8')) : {
        "name": "sophtwhere-timer",
        "repository": "git+https://github.com/jonathan-annett/companion-module-sophtwhere-timer.git",
    }
};

if (manifest_exists && ! __filename.endsWith('main.js') ) {
    module_relative_path = path.join( __dirname, '..', 'dist-src', 'bundled-modules', manifest.json.name);
    manifest_relative_path = path.join(module_relative_path, 'companion', 'manifest.json');
    manifest.json =  JSON.parse(fs.readFileSync(manifest_relative_path,'utf8'));
}

const cache_zip = path.join(ostmp, `${manifest.json.name}-${ manifest.json.version}-updates.zip`);
const cache_zip_etag = path.join(ostmp, `${manifest.json.name}-${ manifest.json.version}-updates.json`);
console.log({cache_zip,cache_zip_etag});
const last_zip = {

};
Object.defineProperties(last_zip,{
    cache : {
        get : function(){
           if ( fs.existsSync(cache_zip) ) {
                delete last_zip.cache;
                last_zip.cache_ = fs.readFileSync(cache_zip);
                Object.defineProperties(last_zip,{
                    cache : {
                        get : function(){
                            return last_zip.cache_;
                        },
                        set : function doSet(arrayBuffer) {
                            last_zip.cache_ =  Buffer.from(arrayBuffer);
                            //delete last_zip.cache;
                            fs.writeFileSync(cache_zip,last_zip.cache_);
                        },
                        enumerable:true,
                        configurable:true
                    }
                });
                console.log('swizzled after get --> file read')
           } else {
               console.log('get ---> undefined');
           }
        },
        set : function doSet(arrayBuffer) {
            last_zip.cache_ =  Buffer.from(arrayBuffer);
            fs.writeFileSync(cache_zip,last_zip.cache_);
            delete last_zip.cache;
            Object.defineProperties(last_zip,{
                cache : {
                    get : function(){
                        return last_zip.cache_;
                    },
                    set : function doSet(arrayBuffer) {
                        last_zip.cache_ =  Buffer.from(arrayBuffer);
                        delete last_zip.cache;
                        fs.writeFileSync(cache_zip,last_zip.cache_);
                    },
                    enumerable:true,
                    configurable:true
                }
            });
            console.log('swizzled after inital set')
        },
        enumerable:true,
        configurable:true
    },

    etag  : {
        get : function() {

            if ( fs.existsSync(cache_zip) && fs.existsSync(cache_zip_etag) ) {
                  const value =  fs.readFileSync(cache_zip_etag,'utf8');
                  console.log('reading etag from file:',cache_zip_etag," = ",value);
                  return value ;
             }  else {
                 console.log('no etag file:',cache_zip_etag);
             }
        },
        set : function (value) {

            if (value) {
                console.log("saving etag",value);
                fs.writeFileSync(cache_zip_etag,value);
            } else {
                console.log("removing etag & cached zip");
                if ( fs.existsSync(cache_zip_etag) ) {
                    fs.unlinkSync(cache_zip_etag);
                }
                if ( fs.existsSync(cache_zip) ) {
                    fs.unlinkSync(cache_zip);
                }
                delete last_zip.cache_;
            }
            
        },
        enumerable:true,
        configurable:true
    }
   
 });


const installedVersionString =  manifest.json.version ;
const installedVersion = installedVersionString ? versionToInt(installedVersionString) : 0;

module.exports = {checkForUpdate,version:{installed:manifest.json.version }};

if (require.main===module) {
    checkForUpdate().then(function(info){
        console.log({info});
        if (info && info.updateNeeded && info.doUpdate){
            info.doUpdate();
        }
    }).catch(console.error.bind(console));
}


let inCheckForUpdate = false;

function checkForUpdate() {

    if (inCheckForUpdate) {
        return Promise.resolve({
            changed:false,
            version : {
                installed : installedVersionString,
             },
            updateNeeded: false
        });
    }

    inCheckForUpdate = true;
  
    let onlineVersionString = installedVersionString;
    let onlineVersion = installedVersion;// assume it has not changed

    const zipfile_manifest_path = path.posix.join('companion','manifest.json');

    const extract_relative_path = path.join.apply(path, __filename.endsWith('main.js') ? [__dirname] : [__dirname, '..', 'dist-src', 'bundled-modules', manifest.json.name]);


    const repo_url = manifest.json
        .repository
        .replace(/^git\+https\:/, 'https:')
        .replace(/\.git$/, '')
        .replace(/\/$/, '');

    const zip_downloadurl = `${repo_url}/blob/main/dist/${manifest.json.name}.zip?raw=true`;

    return new Promise(function (resolve, reject) {


        console.log("fetching:",zip_downloadurl);
        const opts = {
            method : 'GET'
        };

        const cached_etag = last_zip.etag;
        const cached_zip = last_zip.cache;

        if (cached_etag && cached_zip)  {
            opts.headers = {
                'if-none-match' : cached_etag
            };
        }

        console.log({opts});

        fetch(zip_downloadurl,opts).then(processDownloadResponse).catch(downloadError);

        function processDownloadResponse(response) {
            const etag =  response.headers.get('etag');
            const status = response.status;
           

            if (etag && status===304 && cached_etag === etag && cached_zip && (cached_zip.byteLength || cached_zip.length)) {
                console.log("using cached",zip_downloadurl,response.status);
                return  processDownloadedZip( cached_zip );
            }

            console.log("fetched",zip_downloadurl,response.status,etag);
            response.arrayBuffer().then(processDownloadedZip).catch(downloadError);

            function processDownloadedZip(zipAsArrayBuffer) {
                if (etag && status===200) {
                    last_zip.etag = etag;
                    last_zip.cache = zipAsArrayBuffer;
                }
                console.log("unzipping",zipAsArrayBuffer.byteLength || zipAsArrayBuffer.length,"bytes of compressed data");
                JSZip.loadAsync(zipAsArrayBuffer).then(processZipObject).catch(downloadError);
            }
        }

        function downloadError(error) {
            console.log(error);
            inCheckForUpdate = false;
            reject(error);
        }



        function compareBuffers(a, b) {
            if (a === b) return true;
            if (a.length !== b.length) return false;
            if (a.some(function (byte, offset) {
                return byte !== b[offset];
            })) return false;
            return true;
        }

        function processZipObject(zip) {
            console.log("analysing zip");

            const files = {};
            const folders = [];
            const tasks = [];
            let updateNeeded = false;
            zip.folder(`bundled-modules/${manifest.json.name}`).forEach(function (f) {
                if (!f.endsWith('/')) {
                    const zip_fn = `bundled-modules/${manifest.json.name}/${f}`;
                    const local_fn = path.join(extract_relative_path, f);
                    files[f] = zip.file(zip_fn);
                    tasks.push(new Promise(function (resolve, reject) {

                        files[f].async("nodebuffer").then(function (newbuffer) {

                            if (f === zipfile_manifest_path) {
                                try {
                                    mani = JSON.parse(newbuffer.toString('utf8'));
                                    onlineVersionString = mani.version;
                                    onlineVersion = versionToInt(onlineVersionString);
                                } catch (e) {

                                }
                            }

                            fs.promises.readFile(local_fn).then(compareFiles).catch(reject)

                            function compareFiles(local) {
                                
                                if (!compareBuffers(newbuffer, local)) {
                                    files[f] = newbuffer;
                                    updateNeeded = true;
                                } else {
                                    delete files[f];
                                }
                                resolve();
                            }

                        })
                    }));
                }
                if (f.endsWith('/')) {

                    tasks.push(new Promise(function (resolve, reject) {
                        const local_fn = path.join(extract_relative_path, f);
                        fs.promises.stat(local_fn).then(checkStat).catch(badDir);

                        function badDir(err) {
                            if (err.code === 'ENOENT') {
                                folders.push(f.replace(/\/$/, ''));
                                updateNeeded = true;
                                return resolve();
                            }
                            reject(err);
                        }

                        function checkStat(stat) {
                            if (stat.isDirectory()) {
                                return resolve();
                            }
                            reject(new Error("expecting a directory, got a file " + f));
                        }

                    }));


                }
            });

            Promise.all(tasks).then(tasksComplete).catch(downloadError);



            function tasksComplete() {
                processExtractedFiles({
                    files, folders, updateNeeded
                });
                
            }
        }

        function processExtractedFiles(info) {
            module.exports.version.online =  onlineVersionString;
            if (info.updateNeeded) {
               
                resolve({
                    changed:true,
                    files : Object.keys(info.files),
                    version : {
                        installed : installedVersionString,
                        online : onlineVersionString,
                    },
                    updateNeeded: installedVersion  < onlineVersion ,
                    doUpdate
                })
            } else {
                
                 resolve({
                    changed:false,
                    version : {
                        installed : installedVersionString,
                        online : onlineVersionString,
                    },
                    updateNeeded: false
                });
            }

            inCheckForUpdate = false;

            function doUpdate() {
                Object.keys(info.files).forEach(function(fn){
                    const dest = path.join(extract_relative_path,fn);
                    const data = info.files[fn];
                    console.log('writing',data.length,'bytes to',dest);
                    fs.writeFileSync(dest,data);
                });

            }
        }

        
    });


  
}

function versionToInt(versionString,maxnodes) {
    const bits_per_node = 12;
    const nodes = versionString.split('.');
    if (typeof maxnodes === 'number' && maxnodes >0  && maxnodes < 5 ) {
        while (nodes.length<maxnodes) {
            nodes.push('0');
        }
        while (nodes.length>maxnodes) {
            nodes.pop();
        }
    }
    return nodes.map(function(s){ return Number.parseInt(s);}).reduce(function(n,d){
        return (n << bits_per_node) + d;
    },0)
}


 
