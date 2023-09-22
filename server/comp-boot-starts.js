/*!
 * companion-module-sophtwhere-timer/server/comp-boot-start.js
 * Utility to generate callback when the main Companion app is restarted (reads the log file)
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */
const APPDATA = process.env.APPDATA ;
const COMPANION_CONFIG_BASEDIR_FULL = process.env.COMPANION_CONFIG_BASEDIR_FULL;
const fs = require('fs');
const { file, files } = require('jszip');
const path = require('path');
const ostmp = require('os').tmpdir();

const bootLineTest = /Application\:\ Companion\ process\ started$/;
const bootLineTest2 = /\n.*Application\:\ Companion\ process\ started\n/;

const minScanLength = 16 * 1024;
const bufferScanSize = 4 * 1024;

const console = {log : ()=>{}, warn  : ()=>{}};

const data_file = path.join(ostmp,`sophtwhere-companion-lastboot.json`);
let last_known_boot = fs.existsSync(data_file) ? new Date(JSON.parse(fs.readFileSync(data_file))) : undefined;
console.log("last_known_boot data file:",data_file,fs.existsSync(data_file)  ? "exists" :"does not exist","value = ",last_known_boot ? last_known_boot :"???");
let callbacks = [];



//'C:\Users\USER\Desktop\comp-port2\resources\bundled-modules\sophtwhere-timer\config\companion\logs'
// C:\Users\USER\Desktop\comp-port2\resources\bundled-modules\sophtwhere-timer\companion

const log_path =

COMPANION_CONFIG_BASEDIR_FULL && COMPANION_CONFIG_BASEDIR_FULL.length > 0 ?
    path.join(  COMPANION_CONFIG_BASEDIR_FULL, 'logs' ) :
    path.join(  APPDATA , 'companion', 'logs');

module.exports = {
    log_path : log_path,
    log_path_ok : fs.existsSync(log_path),
    on : function (ev,cb) {
        if (ev==='change' &&typeof cb==='function' && callbacks.indexOf(cb)<0) {
            callbacks.push(cb);
        }
    },
    off : function (ev,cb) {
        if (ev==='change' &&typeof cb==='function' ) {
            const index = callbacks.indexOf(cb);
            if (index<0) return;
            callbacks.splice(index,1);
        }
    },
};

/*
{
  lastBoot:        2023-09-22T02:17:46.707Z,
  last_known_boot: 2023-09-22T02:17:46.707Z,
  changed: true
}

*/

 getLastBootTime().then(function (lastBoot){

        let result = false;
        const changed = `${last_known_boot}` !== `${lastBoot}`;
        if (changed) {
            console.log("notifying newly detected lastBoot",{last_known_boot,lastBoot});        
            result = true;          
        } else {
            console.log("notifying existing lastBoot", {last_known_boot,lastBoot});
        }
        notify();
        function notify() {

            if (callbacks.length>0) {
                last_known_boot=lastBoot;
                if (changed) {
                    fs.writeFileSync(data_file,JSON.stringify(lastBoot));   
                }
                return  callbacks.forEach(function(fn){fn(result,lastBoot)});
            }
            console.log("waiting for on('change') callback in getLastBootTime()...",{last_known_boot,lastBoot});
            setTimeout (notify,1000);
        }

 }).catch(function(error){
    console.log("error in getLastBootTime",error);
 });


function getLastBootTime() {

    return new Promise(function (resolve,reject){
        getLogs();

        if (module.exports.log_path_ok) {

            let last = 0, lastFile;
            module.exports.filenames.forEach(function(file,index){
                const filename = path.join(module.exports.log_path,file)
                const stat =  fs.statSync(filename);
                if (stat.isDirectory()) return ;
        
                if (stat.mtimeMs > last) {
                    last = stat.mtimeMs;
                    lastFile = filename;
                } 
            });

            findLastBootTimeInFile(lastFile).then(returnTheStartTime).catch(reject); 
                
            function returnTheStartTime(lastStartTime) {
                module.exports.lastAppStart = lastStartTime;
                module.exports.lastAppTime = lastStartTime.toTimeString();
                module.exports.lastAppFile = lastFile;
                resolve(lastStartTime);
            }

        } else {
            reject(new Error("can't find log file path"));
        }
    
    });
}

function getLogs() {
    if (module.exports.log_path_ok) {
        if (  module.exports.filenames ) {
            module.exports.filenames.splice(
                0,
                module.exports.filenames.length,
            );

            module.exports.filenames.push.apply(
                module.exports.filenames,
                readdir()
            );
        } else {
            
            module.exports.filenames = readdir();

        }
        return  module.exports.filenames;

        function readdir(){
           return  fs.readdirSync(module.exports.log_path).filter(function(f){
              return f.endsWith('.log')
           });
        }
    }
}

 

function lineWithBootTimeToDate(line) {
    return new Date(line.trim().split(' ')[0]);
}
 

function lineHasBootTime(line) {
        return bootLineTest.test(line);
}

function stringToLastBootTime(str) {
    let lines;
    const index = typeof str==='string' ? (lines=str.split('\n')).findLastIndex(lineHasBootTime) : -1;
    return !lines || index < 0 ? null : lineWithBootTimeToDate(lines[index]);
}

function bufferToLastBootTime(buf) {
    const str = buf.toString();
    if (bootLineTest2.test(str)) {
        return stringToLastBootTime(str);
    }
    return null;
}

function findLastBootTimeInFile(filename) {
    return new Promise(function(resolve,reject){
        fs.stat(filename,function(err,stat){
            if (err) return reject(err);
            if (stat.size<minScanLength) {
                return fs.readFile(filename,function(err,buf){
                    if (err) return reject(err);
                    resolve(bufferToLastBootTime(buf));
                });
            }

            const buffers = [];

            fs.open(filename,'r',function(err,fd){
                if (err) return reject(err);
                readNext(fd,stat.size-bufferScanSize);
            });

            function readNext(fd,position) {

                if (position<=0) {
                    return fs.close(fd,function(err){
                        if (err) console.warn(err);
                        resolve( bufferToLastBootTime(Buffer.concat(buffers)));
                    });
                } 

                const buffer = Buffer.alloc(bufferScanSize);

                fs.read(fd,buffer,{position,length:bufferScanSize,offset:0},function(err){

                    if (err) {
                        return fs.close(fd,function(err2){
                            reject(err2||err);
                        });
                    }

                    buffers.unshift(buffer);
                    const lastBoot = bufferToLastBootTime(Buffer.concat(buffers));
                    if (lastBoot) return resolve(lastBoot);
                    if (position > bufferScanSize) {
                        return  readNext(fd,position-bufferScanSize);
                    }


                    const lastBuffer = Buffer.alloc(position);
                    
                    fs.read(fd,lastBuffer,{position:0,length:position,offset:0},function(err){
                        if (err) return reject(err);
                        buffers.unshift(buffer);
                        return fs.close(fd,function(err){
                            if (err) console.warn(err);
                            resolve( bufferToLastBootTime(Buffer.concat(buffers)));
                        });
                    });
                    
                   
                   
                });
            }
        })
    });

}




