function setupStorageLink(wsUrl, whitelist, blacklist, tabId_ ) {

    let tabId = tabId_;
    let keysSent = false;

    whitelist = whitelist || [/.*/g];
    blacklist = blacklist || [];

    let resolvedSocket, connecting, onlinkmessage = function () { };

    const whitelistRegexps = whitelist.filter(isRegExp);
    const whitelistStrings = whitelist.filter(isString);

    const blacklistRegexps = blacklist.filter(isRegExp);
    const blacklistStrings = blacklist.filter(isString);

    let enabled;

    enable(true);

    return Object.defineProperties({}, {

        enabled: {
            get: function () { return enabled; },
            set: enable,
            enumerable: true,
            configurable : false
        },

        sendMessage: {
            value: sendMessage,
            enumerable: true,
            configurable : false
        },

        onmessage: {
            get: function () { return onlinkmessage; },
            set: function (fn) { if (typeof fn === 'function') onlinkmessage = fn; },
            enumerable: true,
            configurable : false
        },

        tabId: {
            get : function () { return tabId; },
            set : function (v) { 
                tabId = v;
                getSocket().then(function(socket){
                      socket.send(allKeyValues());
                      keysSent = true;
                });
            },
            enumerable: true,
            configurable : false
        }
    });

    function sendMessage(msg) {
        getSocket().then(function(socket){
            const json = typeof msg==='string' ? msg : JSON.stringify(msg,undefined,4);
            socket.send(json);
        });
    }

    function allKeyValues(){
        let obj = {
            allKeyValues : {}
        };
        const keys = Object.keys(localStorage);
        keys.forEach(function(key){
            value = localStorage.getItem(key);
            obj.allKeyValues[key]=value;
        });
        const json = JSON.stringify(obj,undefined,4);
        keys.forEach(function(key){
            delete obj.allKeyValues[key];
        });
        delete obj.allKeyValues;
        delete obj.tabId;
        return json;
    }

    function allKeys(){
        let obj = {
            allKeys : Object.keys(localStorage)
        };
        const json = JSON.stringify(obj,undefined,4);
        delete obj.allKeys;
        delete obj.tabId;
        return json;
    }

    function enable(en) {
        if (enabled && (en === false)) {
            window.removeEventListener('storage', onStorage);
            enabled = false;
            if (resolvedSocket) {
                resolvedSocket.then(function(socket){
                    socket.onmessage = null;
                    socket.onerror = null;
                    socket.onclose = null;
                    socket.onopen = null;
                    socket.close();
                    resolvedSocket=null;
                });
            }
            
            if (connecting) {
                connecting.splice(0,connecting.length)
                connecting=undefined;
            }  
        } else {
            if (!enabled && (en!==false)) {
                enabled = true;
                getSocket().then (function(socket){
                    
                    window.addEventListener('storage', onStorage);

                    if (!keysSent) {
                        socket.send(allKeyValues());
                        keysSent = true;
                    }
                });
            }
        }
    }

    function isString(x) {
        return typeof x === 'string' && x.length > 0;
    }

    function isRegExp(x) {
        return typeof x === 'object' && x.constructor === RegExp;
    }

    function onStorage(event) {
        const {
            key, // Returns a string that represents the key changed. The key attribute is null when the change is caused by the storage clear() method.
            newValue, // Returns a string with the new value of the key. This value is null when the change has been invoked by storage clear() method, or the key has been removed from the storage.
            oldValue, // Returns a string with the original value of the key. This value is null when the key has been newly added and therefore doesn't have any previous value.
            storageArea, // Returns a Storage object that represents the storage that was affected.
            url //Returns string with the URL of the document whose key changed.
        } = event;

        if (isWhitelisted(key)) {
            if (isBlacklisted(key)) {
                return;
            }
        } else {
            return;
        }

        const json = JSON.stringify({
            key,
            newValue,
            oldValue
        },undefined,4);


        getSocket().then(function(socket){
            socket.send(json)
        });
        
    }

    function isWhitelisted(key) {
        if (whitelistRegexps.length === 0 && whitelistStrings.length === 0) return true;
        return whitelistRegexps.some(regExpTest) || whitelistStrings.indexOf(key) >= 0;
        function regExpTest(re) {
            return re.test(key);
        }
    }

    function isBlacklisted(key) {
        if (blacklistRegexps.length === 0 && blacklistStrings.length === 0) return false;
        return blacklistRegexps.some(regExpTest) || blacklistStrings.indexOf(key) >= 0;
        function regExpTest(re) {
            return re.test(key);
        }
    }

    

    function getSocket() {
        return resolvedSocket ? resolvedSocket : new Promise(connectToSocket); 
    }

    function connectToSocket(resolve) {

        if (connecting) {
            connecting.push(resolve);
            return;
        } else {
            connecting = [ resolve ];
        }

        const tempSocket = new WebSocket(wsUrl);
        tempSocket.onopen = function () {
            const wrappedSend = tempSocket.send.bind(tempSocket);
            tempSocket.send = function (x) {
                
                const stack = new Error("x").stack.split("\n");
                console.log("ws.send:",x,"@",stack[2]);
                return wrappedSend(x);
            };
            tempSocket.send( JSON.stringify({connect:1, storageId : tabId},undefined,4) );
        };

        tempSocket.onclose = function () {
            tempSocket.onclose = null;
            tempSocket.onerror=null;
            tempSocket.onmessage=null;
            resolvedSocket = null;
            if (connecting) {
                connecting.splice(0,connecting.length)
                connecting=undefined;
            }  
        };

        tempSocket.onmessage = function (ev) {

            if (typeof ev.data==='string' && ev.data.startsWith('{"')) {
                try {
                    const msg = JSON.parse(ev.data);
                    if (msg.connected === tabId) {
                        tempSocket.onmessage = undefined;
                        resolvedSocket = Promise.resolve(tempSocket);
                        connecting.splice(0,connecting.length).forEach(function(resolve){
                            resolve(tempSocket);
                        });
                        connecting=undefined;   
                    }
                } catch (e) {

                }
            }                    
                 
        };

        tempSocket.onerror = function (e) {

        };

    }

}

let link;

window.addEventListener('message', function (ev) {
    
    
            const msg = ev.data;
            const { tabId, final,wsUrl, whitelist, blacklist } = msg;
            if (typeof tabId+typeof final+ typeof wsUrl + typeof whitelist + typeof blacklist === 'stringbooleanstringobjectobject') {
                if (final) {
                    if (!link) {
                        link = setupStorageLink(wsUrl, whitelist, blacklist,tabId);
                    } else {
                        link.tabId = tabId;
                    }
                } else {
                    link = setupStorageLink(wsUrl, whitelist, blacklist,tabId);
                }
            
            }
        
     
    
});

