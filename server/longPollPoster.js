/* 



  const connections = startLongPollPoster(function(request, response) {
        // default http handler for normal GET etc
  });

  const server = http.createServer(connections.handler);
  connections.on('message',function(msg){

    // msg is parsed json object as sent by client(s)

  });
  
  // send a message to all connected clients
  connections.send({hello:"hello world"});


*/
module.exports = startLongPollPoster;
const http      = require('http');
const msg_poll_url = "/msg-poll";
const msg_poll_mode_url = "/msg-poll-mode.json";

function startLongPollPoster(reqHandler,requestPermitted,useWs) {

    const connections = [];
    const callbacks = [];
    if (useWs) return emulateWithWS(reqHandler,requestPermitted) ;
    
    requestPermitted = requestPermitted || function () {return true};



    const max_backlog = 20;
    const messages = []; 

    const  server  = http.createServer(handler);
    
    return {
        on      : addCallback,
        send    : sendMessage,
        cleanup : cleanup,
        server  : server
    };

    function addCallback(x,fn) {
        if (x==="message" && typeof fn==="function") {
            callbacks.push(fn);
        }
    }

    function cleanup() {
        return new Promise(function(resolve){
            callbacks.splice(0,callbacks.length);
            messages.splice(0,messages.length);
            const reply = [{id:Date.now(),msg:{error:"server restarting"}}];
            connections.splice(0,connections.length).forEach(function(conn){
                sendReply(conn.response,reply) ;
            });
            resolve();
        });
    }

    function sendMessage(msg,cb,delay) {
        const id = Date.now();
        messages.push({id,msg:JSON.stringify(msg)});
        if (messages.length>max_backlog) {
            messages.splice(0,messages.length-max_backlog);
        }
        connections.splice(0,connections.length).forEach(function(con){
            const reply = getMessages(con.lastId);
            sendReply(con.response,reply) ;
        });
        if (cb) setTimeout(cb,delay||1);
    }

    function getMessages(lastId) {
        const stack = messages.filter(function(x) {
            return x.id > lastId;
        });
       return stack;
    }

    function sendReply(response,reply) {
        const lastId = reply[reply.length-1].id;
        const json = JSON.stringify({id:lastId,messages:reply});
        response.setHeader('content-type','application/json');
        response.writeHead(200);
        response.write(json);
        response.end();
    }

    function handler (request,response) {

        if (!requestPermitted(request, response)) {
            return;
        }

        const body = [];
        if (request.url === msg_poll_url && request.method==="POST") {
            request.on('data', function(chunk ) {
                body.push(chunk);
            });
            request.on('end', function() {
                try {
                    const payload = JSON.parse(Buffer.concat(body).toString());
                   // console.log({payload});
                    if (payload.send) {
                        const msg = JSON.parse(payload.send);
                        callbacks.forEach(function(fn){
                            fn(msg);
                        });
                        response.setHeader('content-type','application/json');
                        response.writeHead(200);
                        response.write('{"success":true}');
                        response.end();
                    } else {
                        if (typeof payload.receive==='number'){
                            const lastId = payload.receive;
                            const reply = getMessages(lastId);
                            if (reply.length===0) {
                                connections.push({lastId,response});
                            } else {
                                sendReply(response,reply);
                            }
                        } else {
                            response.setHeader('content-type','application/json');
                            response.writeHead(200);
                            response.write('{"error":"bad message format"}');
                            response.end();
                        }
                    }
                } catch (e) {
                    response.setHeader('content-type','application/json');
                    response.writeHead(200);
                    response.write(JSON.stringify({error:e.toString()}));
                    response.end();
                }            
            });
        } else {

            if (request.url.startsWith(msg_poll_mode_url) && request.method==="POST") {
                    response.setHeader('content-type','application/json');
                    response.writeHead(200);
                    response.write('false');
                    response.end();           
            } else {
                if (typeof reqHandler==='function') {
                    return reqHandler(request,response);
                } else {
                    response.writeHead(500);
                    response.write('internal server error');
                    response.end();                
                }
            }
        }
    }

    function emulateWithWS(reqHandler,requestPermitted) {
        const WebSocket = require('ws');
    
        const  server  = http.createServer(handler);
    
        const self =  {
            on      : addCallback,
            send    : sendMessage,
            cleanup : cleanup,
            server  : server
        };
        const wss = new WebSocket.Server({ server: server })
    
        
        wss.on('connection', onWSConnection);
    
        function onWSConnection (ws) {
    
            connections.push(ws);
    
            ws.on('message',onWsMessage);
            ws.on('close',onWsClose);
    
            function onWsMessage(message) {
                try {
        
                const msg = JSON.parse( message.toString('utf8'));
                    
                callbacks.forEach(function(fn){
                    fn(msg);
                });
                } catch(e) {
                    console.log("error parsing message:",e);
                }
            
            }
    
            function onWsClose(){
                const ix = connections.indexOf(ws);
                if (ix>=0) {
                    connections.splice(ix,1);
                    console.log('ws disconnected ');        
                }
            }
            
        }
    
        return self;

        function handler (request,response) {

            if (!requestPermitted(request, response)) {
                return;
            }

            if (request.url === msg_poll_url && request.method==="POST") {
                const body = [];
                request.on('data', function(chunk ) {
                    body.push(chunk);
                });
                request.on('end', function() {
                    try {
                        const payload = JSON.parse(Buffer.concat(body).toString());
                       // console.log({payload});
                        if (payload.send) {
                            response.setHeader('content-type','application/json');
                            response.writeHead(200);
                            response.write('{"success":false}');
                            response.end();
                        } else {
                            if (typeof payload.receive==='number'){
         
                                response.setHeader('content-type','application/json');
                                response.writeHead(200);
                                const msgId = Date.now();
                                response.write(JSON.stringify({id:msgId,messages:[{id:msgId,msg:JSON.stringify({"cmd":"redirect","url":"/","delay":1500})}]}));
                                response.end();
                            }
                        }
                    } catch (e) {
                        response.setHeader('content-type','application/json');
                        response.writeHead(200);
                        response.write(JSON.stringify({error:e.toString()}));
                        response.end();
                    }            
                });
                return;
            } else {
                console.log(request.url ,'vs', msg_poll_url );
            }
            
            if (request.url.startsWith(msg_poll_mode_url) && request.method==="POST") {
                    response.setHeader('content-type','application/json');
                    response.writeHead(200);
                    response.write('true');
                    response.end();           
            } else {
                if (typeof reqHandler==='function') {
                    return reqHandler(request,response);
                } else {
                    response.writeHead(500);
                    response.write('internal server error');
                    response.end();                
                }
            }
            
        }
    
        function cleanup() {
            return new Promise(function(resolve){
                callbacks.splice(0,callbacks.length);
                let pending = 0;
                const reply = [{id:Date.now(),msg:{error:"server restarting"}}];
                connections.splice(0,connections.length).forEach(function(conn){
                    pending++;
                    conn.on('close',function(){
                        pending--;
                        if (pending<=0 && resolve) {
                            resolve();
                            resolve = undefined
                        }
                    })
                    conn.send(reply,function(){conn.close();}) ;
                });
    
                if (pending<=0 && resolve) {
                    resolve();
                    resolve = undefined;
                }
            });
        }
      
        function sendMessage(msg,cb,delay) {
            const json = JSON.stringify(msg);
            connections.forEach(function(ws){
                ws.send(json);
            });
            if (cb) setTimeout(cb,delay||1);
        }    
    
    }
    
}


