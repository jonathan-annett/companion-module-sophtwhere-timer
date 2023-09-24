module.exports = function(){

    const os = require('os');
    const fs = require('fs');
    const {execSync} = require('child_process');

    let callbacks = [];

    return {
        log_path : null,
        log_path_ok : false,
        on : function (ev,cb) {
            if (ev==='change' &&typeof cb==='function' && callbacks.indexOf(cb)<0) {
                
                if (os.hostname()==="CompanionPi") {
                    const pkgName  = JSON.parse("./package.json").name;
                    const filename = `/dev/shm/comp-boot-${pkgName}`;
                    const firstBoot = !fs.existsSync(filename);
                    fs.writeFileSync(filename,"1");
                    setTimeout(
                        function(){
                            cb(firstBoot,new Date(execSync('uptime -s')));
                        },
                        100
                    ); 
                    return;
                }
                
                callbacks.push(cb);
            }
        },
        off : function (ev,cb) {
            if (ev==='change' &&typeof cb==='function' ) {
                if (os.hostname()==="CompanionPi") {
                    return;
                }
                const index = callbacks.indexOf(cb);
                if (index<0) return;
                callbacks.splice(index,1);
            }
        },
    };

};