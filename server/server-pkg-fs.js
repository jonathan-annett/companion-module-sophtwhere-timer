
        const zlib=require('zlib'),db = {"files":["HELP.md"],"data":["eNrVV01v4zYQvRvwf5j1HtIKstNu9hAEcYBFggUKtF0gyaVYLIqRRFmsKVIgKav+950hJVuykzYFeimSg03Ox5uZNzP0+/fgTFP5rhJWLL2shZ3P5rPnSjrIjdYi99JoEBozJRwgHbbaF6bTEISBLvemtXReN60XNoWuknnFh1BI1yjcQ+uk3pBuJzLIrOmcsCv2kiS/sZTRFx60EAV4A1I7j0oB6j1gUUh2j4pAlr5DK1Lwlehd21Y7UCYn8T3pRRy9/ZQMFEBBYOtNjV5GqRhHQRhFL08+yOQk2iSJ4J5/fnhMEkjulcy3BF9JvYVMKNMxUNOQiSOYBjcEzuhchNAJKpRYSyXRQid9xaJOhPBsG9y4VfBz+265NHRpg323XN7x6afMtD6Yf2bzFw4e+mT+YgoqxHy2Xq9Z8KGl7Izv5rPlcsk3P+kYWE2HaQDVSUpsSyiMFkOiAGNVtbdGKfo+FM3lVgidRvCoI8RBqZOaODAutcUNZwXBNRx7bbT0pi8DnQ9W6d5TpvqkRR+BCwBJCHeEJN5CRQilLo3lMhLdotOajGWCoylbBXRLnrgmFsktm3v39Snou8r4H799N/qyavTm+7HPc0jB6RnZU8LhhS4iU8n7ToqOvmQcV2OpvnRtV8CWD9atoOIFbD2VG2s2JOsgQ3ukM5gSCtzHhOWtI9ZCTVKEzEGwGx2x/BDm6jTOq3GcV4c457MvO2H/DUHwzfRguAilMlQcavIFqg73jseCN81iSpRe1/WF7nM7Kf/BkOkR9waMpu6lqLqobEWNUrMc5y7GOE3Fx3EqPh5S8UQ6SrzcMG/I5N+mzEXbJz0yIv9hWgxDMijnFWqin/TEE2r6hvve0Fwz20hOJHKge42oNAxyKzMiB2aUs1XMxSeaMLuYyBcGRD86ks/SOp9Crgzjp4EbLU8DYM/ooZabyjPnee7FyTWfxcl4i1BZUa4XlffNzeVlGMmVcf7m+ofr6wV4tBvh14vfM4V6u6DiqfVCGzYk7OLuliaGvuNGub0MH+H2Eu9eGLFno2G8a3JqMSsa48LGYG1WHDLPErF3+YbLxRNj3Es3pwx4ZWb8Kv70wa/icnD9pI4ZmqYtDQMhlu0rPMI32Ir9YVvS58ygLVYQNm3gwSHaxaOojRdD85wh+zBG9uGA7CGM4NgcpD7i32kmOumq0zxEavVSsa3HAXzuAyCtGrfMVqC5q4YJDolml8vYHfQ/TLsVyDIuiLDlO9T+FRtpyCL1QNuwBOkEkj0K39rY6TGQ+yMLYoSXHrN0cDOEFhyEsrCLvldQOZMe2FKYiHbYzqMoWXB10kcvTo7/qJP+x300mUy92Ft7aXgtXdCDocKmiRNySJqMW+R17k5b7OnIUIxVCwwL+2tEs39A+srcH/Fgukp7AoT6H/3y+4r2eZgv4d00RMB7w4WlryfgvxzBe7NhngXdyQ4kQp4fhiduXLm4Q6n4eZtCRjuEYudahsVJZBuwFVBaelpMEu2dUGW/ORJ699LdFezQStO6KfTTdcMuLgKZsfiDHi2Def41gJoIlELRCg5r9PaftCQxaScLYYDmcC2dY9LZVnGWaNuLHT9BeDiGNKJr6Inuhtz2dKYos/BwLOWm5WdS/L1xwLBKkmFf9TJ8fT9cH4o4/P0FV1Vzyw=="]};

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
    