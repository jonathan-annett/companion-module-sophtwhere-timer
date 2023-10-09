(function(){

    window.encodeObjectData=encodeObjectData;
    window.decodeObjectData=decodeObjectData;
    

    function compress(string, encoding, cb) {
        const byteArray = new TextEncoder().encode(string);
        const cs = new CompressionStream(encoding);
        const writer = cs.writable.getWriter();
        writer.write(byteArray);
        writer.close();
        const prom = new Response(cs.readable).arrayBuffer();
        if (typeof cb === 'function') {
            prom.then(function (ab) { cb(undefined, ab); }).catch(cb);
        } else {
            return prom;
        }
    }

    function decompress(byteArray, encoding, cb) {
        const cs = new DecompressionStream(encoding);
        const writer = cs.writable.getWriter();
        writer.write(byteArray);
        writer.close();
        const prom = new Response(cs.readable).arrayBuffer().then(function (arrayBuffer) {
            return new TextDecoder().decode(arrayBuffer);
        });

        if (typeof cb === 'function') {
            prom.then(function (str) { cb(undefined, str); }).catch(cb);
        } else {
            return prom;
        }
    }


    function abToB64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    function b64ToAb(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function encodeObjectData(obj, urlPrefix, cb) {
        compress(JSON.stringify(obj), 'deflate', function (err, buf) {
            if (err) return cb(err);
            const b64 = abToB64(buf).split('=')[0];
            cb(undefined, urlPrefix + b64);
        })
    }

    function decodeObjectData(url, urlPrefix, cb) {
        if (url.startsWith(urlPrefix)) {
            const b64 = url.split('?')[1];
            if (b64) {
                return decompress(b64ToAb(b64), 'deflate', function (err, json) {
                    if (err) return cb(err);
                    try {
                        cb(undefined, JSON.parse(json));
                    } catch (err) {
                        cb(err);
                    }
                });
            }
        }

        return cb(new Error("badly formed url"))

    }

})();