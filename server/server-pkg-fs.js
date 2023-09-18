
        const zlib=require('zlib'),db = {"files":["HELP.md"],"data":["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"]};

        const fs = {
            readFileSync :  function fs_readSync(path,encoding) {
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
    },
            readdirSync  :  function(){ return ["HELP.md"];}
        };

        module.exports = fs;
    