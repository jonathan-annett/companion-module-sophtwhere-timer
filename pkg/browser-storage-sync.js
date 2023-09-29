

function syncedStorage (onMessage,sendMessage) {
    
    const self = {
         localId : localStorage.getItem('storage-id'),
         on : on,
         off : off,
         setItem:setItem,
         getItem:localStorage.getItem.bind(localStorage)
    };

    const events = {
        change           : [],
        remoteChange     : [],
        localChange      : [],
        peerWindowChange : []
    };

    getLocalId().then(setupStorageSync);

    return self;

    function on(ev,fn) {
        const stack = events[ev];
        if (typeof stack+typeof fn === 'objectfunction') {
             if (stack.indexOf(fn)<0) {
                stack.push(fn);
             }
        }
    }

    function off(ev,fn) {
        const stack = events[ev];
        if (typeof stack+typeof fn === 'objectfunction') {
             const ix = stack.indexOf(fn);
             if (ix>=0) {
                stack.splice(ix,1);
             }
        } else {
           if (stack) {
               stack.splice(0,stack.length);
           } 
        }
    }
   
    function setItem(key,newValue) {
       
       
        if (/^tab_|^controller_tab_/.test(key)) {

            return localStorage.setItem(key,newValue);
           
        } else {
           
            const msg = {
                id:self.localId,
                key:key,
                newValue:newValue,
                oldValue:localStorage.getItem(key)
            };

            localStorage.setItem(key,newValue);

            sendMessage( { storageLink : msg } );

            events.change.forEach(function(fn){
                fn( msg );
            });

            events.localChange.forEach(function(fn){
                fn( msg );
            });

        }
        
    }

    function storageKeyChanged(ev) {
        if (/^tab_|^controller_tab_/.test(ev.key)) {
            return;
        }

        const msg = {
            id:self.localId,
            key:ev.key,
            newValue:ev.newValue,
            oldValue:ev.oldValue
        };
    
        sendMessage( { storageLink : msg } );

        events.change.forEach(function(fn){
            fn(obj);
        });
        events.remoteChange.forEach(function(fn){
            fn(obj);
        });
    }

    function processStorageMessage(json) {

        if (typeof json==='string' && json.startsWith('{"')) {
            try {

                const msg = JSON.parse(json).storageLink||null;

                if (msg && msg.key && msg.newValue) {

                    localStorage.setItem(msg.key,msg.newValue);

                    events.change.forEach(function(fn){
                        fn(obj);
                    });

                    events.peerWindowChange.forEach(function(fn){
                        fn(obj);
                    });


                } else {
                    return msg;
                }

            } catch (e) {

            }
        }

        return null;
    }

    function setupStorageSync(localId) {

        Object.defineProperties(self,{
            localId : {
                value : localId,
                enumerable: true,
                configurable : true
            }
        });

        if (typeof onMessage+typeof sendMessage==='functionfunction') {
            onMessage(processStorageMessage);
            window.addEventListener('storage',storageKeyChanged);
        }
    }

}


function getLocalId() {
    let localId = localStorage.getItem('storage-id');
    if (localId) {
        return Promise.resolve(localId);
    }
    return new Promise(generateLocalId);
}

function generateLocalId(resolve,reject) {
    const encoder = new TextEncoder();
    const seed = `storage-id-${ Math.random() }-${ Date.now()} ${ Math.random()}`;
    crypto.subtle.digest("SHA-512", encoder.encode(seed)).then(arrayBufferToBase64).catch(reject);

   
 

    function arrayBufferToBase64(arrayBuffer) {

        const blob = new Blob([arrayBuffer]);        
        const reader = new FileReader();
        
        reader.onload = function (event) {
            const dataUrl = event.target.result;
            const [_, base64] = dataUrl.split(',');
            resolve(base64);
        };
        reader.onerror = function(error) {
            reject (error)
        };
            
        reader.readAsDataURL(blob);
    }


}