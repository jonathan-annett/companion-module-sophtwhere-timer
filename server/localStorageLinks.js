
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const { resolve } = require('path');
const { resolveSoa } = require('dns');

const getBrowserFiles = require('./getBrowserFiles.js');
const deployed = __filename.endsWith('main.js');
const browser_root =  deployed ?  path.join(__dirname,'browser') +'-' : './browser/';
const staticContent =  getBrowserFiles( browser_root );

module.exports = { localStorageLink, staticContent };

function localStorageLink(port, address, statics, whitelist, blacklist) {

    const send404 = sendStatic('text/plain', '404 Not Found', 404);

    const server = http.createServer(httpHandler);
    const storageAreas = new Map();
    const wss = new WebSocket.Server({ server: server });
    wss.on('connection', onWSConnection);

    const GET_routes = new Map();

    const GET = GET_routes.set.bind(GET_routes);

    const POST_routes = new Map();
    const POST = POST_routes.set.bind(POST_routes);

    const routes = new Map([
       [ 'GET',  GET_routes],
       [ 'POST', POST_routes]
    ]);



    const types = new Map([
        [
            'js', 'text/javascript'
        ],
        [
            'json', 'application/json'
        ],
        [
            'html', 'text/html'
        ],

        [
            'css', 'text/css'
        ],

    ]);

    // populate the routes Map
    if (statics) {
        Object.keys(statics).forEach(function (uri) {
            GET(uri, statics[uri]);
        });
    }


    browserRoutes( whitelist, blacklist);


    if (address) {
        server.listen(port, address, afterListen);
    } else {
        server.listen(port, afterListen);
    }

    function afterListen() {

    }

    function httpHandler(request, response) {

        const uris = routes.get(request.method);

        let uri = request.url.replace(/[\?&#](.*)/g, '');

        if (uris && uris.has(uri)) {
            const handler = uris.get(uri);
            handler(request, response);
        } else {
            send404(request, response);
        }

    }

    function sendStatic(contentType, content, status) {
        return function (request, response) {
            response.setHeader('content-type', contentType);
            response.setHeader('content-length', content.length ?? content.byteLength);
            response.writeHead(status || 200);
            response.write(content);
            response.end();
        };
    }

    function getRequestPostBody(request, opt, cb) {

        const body = [];

        request.on('data', function (chunk) {
            body.push(chunk);
        });

        request.on('end', function () {
            if (opt === 'chunks' && typeof cb === 'function') return cb(undefined, body);
            let buffer, string, object;
            try {
                buffer = Buffer.concat(body);
                if (opt === 'buffer' && typeof cb === 'function') return cb(undefined, buffer);
                string = buffer.toString('utf8');
                if (opt === 'string' && typeof cb === 'function') return cb(undefined, string);
                object = JSON.parse(string);
                if (typeof opt === 'function') return opt(undefined, object, string, buffer, body);
                if (typeof cb === 'function') return cb(undefined, object);

            } catch (e) {
                return (typeof opt === 'function' ? opt : cb)(e);
            }
        });

    }

    function onWSConnection(ws) {
        let wsStorageId;
        let onJSONMessage = waitForConnectMessage;
       
        console.log("onWSConnection");

        ws.addEventListener('message', onWsMessage);

        function onWsMessage(message) {
            try {
                const msg = JSON.parse(message.data );
                onJSONMessage(msg);
                console.log({in:msg,impliedId:wsStorageId});
                
            } catch (e) {
            }
        }

        function waitForConnectMessage(msg) {

            const { connect, storageId, storageListenId } = msg;

            if (connect && storageId) {

                wsStorageId = storageId;
                // make sure the storageArea for this 
                let storage = storageAreas.get(wsStorageId);
                if (storage) {
                    const listeners = storage.get('_listeners');
                    if (listeners.indexOf(ws) < 0) {
                        listeners.push(ws);
                    }
                } else {
                    storage = new Map([['_listeners', [ws]]]);
                    storageAreas.set(wsStorageId, storage);
                }

                if (storageListenId) {
                    const listening = storageAreas.get(storageListenId);
                    if (listening) {
                        const listeners = listening.get('_listeners');
                        if (listeners.indexOf(ws) < 0) {
                            listeners.push(ws);
                        }
                    } else {
                        storageAreas.set(new Map([['storageId', storageId], ['_listeners', [ws]]]));
                    }
                }

                onJSONMessage = onStorageMessage;

                ws.addEventListener('close', onWsClose);
                const json = JSON.stringify({connected:wsStorageId});
                ws.send(json);
                console.log("sent:",json);

            }



        }

        function onStorageMessage(msg) {

            const { key, newValue, oldValue, tabId, allKeyValues  } = msg;
            let storage = tabId && storageAreas.get(tabId);
            if (storage && key && newValue) {
                 storage.set(key, newValue);
            } else {
                if ( storage && allKeyValues  ) {
                    Object.keys(allKeyValues).forEach(function(key){
                        const newValue = allKeyValues[ key ];
                        storage.set(key, newValue);
                    });
                }
            }

        }

        function onWsClose() {
            console.log("onWsClose");
            ws.removeEventListener('message', onWsMessage);
            ws.removeEventListener('close', onWsClose);
            onJSONMessage = null;

            // remove this ws from every storage area's _listeners array...
            const cull = new Map();
            storageAreas.forEach(function (storage, id) {
                const listeners = storage.get('_listeners');
                if (listeners) {
                    const ix = listeners.indexOf(ws);
                    if (ix >= 0) {
                        listeners.splice(ix, 1);
                    }
                    if (listeners.length === 0) {
                        // this area has no listeners. we can trash it
                        cull.set(id, storage);
                    }
                }
            });

            // cull every storageArea that we detected as having no listeners
            cull.forEach(function (storage, id) {
                storage.clear();
                storageAreas.delete(id);
            });
            cull.clear();
        }

    }

    function browserRoutes( whitelist, blacklist) {

        GET('/storage-link-iframe.html', sendStatic('text/html', iframeHtml()));
        GET('/storage-link-test.html', sendStatic('text/html', testHtml()));

        
        whitelist = Array.isArray(whitelist) ? JSON.stringify(whitelist) : '[]';
        blacklist = Array.isArray(blacklist) ? JSON.stringify(blacklist) : '[]';

        function defineFunction(fn_name,fn, extra) {
            
            let content = fn.toString();

            content = content + "\n" + resolveExtra(extra);
            const uri = `/${fn_name}.js`;
            console.log(uri,'--->',content.length,'bytes');
            GET(uri, sendStatic("text/javascript", content));

            function resolveExtra(extra) {
                if (typeof extra === 'string') {
                    extra = extra.substring(0, extra.lastIndexOf('}') - 1);
                    return extra.substring(extra.indexOf('{') + 1);
                } else {
                    if (typeof extra === 'function') {
                        return extra.toString();
                    } else {
                        if (Array.isArray(extra)) {
                            return extra.map(resolveExtra).join('\n');
                        } else {
                            return '\n';
                        }
                    }
                }
            }

        }





        function iframeHtml() {
            return `

<html>
    <head>
        <style> html,body {display:none;}</style>
    </head>
    <body>
         <script src="/setupStorageLink.js" defer></script>
    </body>
</html>

`.trim();
        }

        function testHtml() {
            return `

<html>
    <head>
     </head>
    <body>

        <button>test</button>
        <script src="/onNewTabId.js"></script>
        <script src="/addStorageLink.js" defer></script>
     
    </body>
</html>

`.trim();
        }


    }

    function createObjectModel(self, proto) {

        self = self || {};
        proto = proto || {};

        return {
            self,
            property,
            readOnlyMethod
        };

        function property(nm, getter, setter, deflt) {

            proto[nm] = {
                enumerable: true,
                configurable: false
            };

            if (setter && getter) {
                proto[nm].set = setter;
                proto[nm].get = getter;
            } else {
                if (setter && !getter) {
                    let value = deflt || null;
                    proto[nm].get = function () { return value; };
                    proto[nm].set = function set(v) {
                        if (value !== v) {
                            value = v;
                            return setter(v);
                        }
                    };
                } else {
                    if (!setter && getter) {
                        proto[nm].set = function set(v) {
                        };
                        proto[nm].get = getter;
                    } else {
                        if (deflt !== undefined) {

                        } else {
                            proto[nm].value = deflt;
                            proto[nm].writable = false;
                        }
                    }
                }
            }

        }

        function readOnlyMethod(fn, rename) {
            proto[rename || fn.name] = {
                value: fn,
                writable: false,
                enumerable: true,
                configurable: false
            }
        }

    }

    function eventsManager(self, events, proto) {

        self = self || {};
        proto = proto || {};
        events = events || {};
        const {
            property,
            readOnlyMethod
        } = createObjectModel(self, proto);

        readOnlyMethod(addEventListener);
        readOnlyMethod(addEventListener, 'on');
        readOnlyMethod(removeEventListener);
        readOnlyMethod(removeEventListener, 'off');

        return {
            events,
            property,
            readOnlyMethod,
            emitEvent
        };

        function addEventListener(e, fn) {
            const stack = events[e];
            if (typeof fn + typeof stack === 'functionobject') {
                const index = stack.indexOf(fn);
                if (index < 0) {
                    stack.push(fn);
                }
            }
        }

        function removeEventListener(e, fn) {
            const stack = events[e];
            if (Array.isArray(stack)) {

                if (typeof fn === 'function') {
                    const index = stack.indexOf(fn);
                    if (index >= 0) {
                        stack.splice(index, 1);
                    }
                } else {
                    if (!fn) {
                        stack.splice(0, stack.length);
                    }
                }

            }
        }

        function emitEvent(e) {
            const stack = events[e];

            if (Array.isArray(stack)) {
                const args = [].slice.call(arguments);
                stack.forEach(function (fn) {
                    fn.apply(null, args);
                });
            }
        }

    }

}

if (require.main === module) {
    const link = localStorageLink(8089,'127.0.0.1',staticContent,[],[]);
}