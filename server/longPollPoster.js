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

function startLongPollPoster(reqHandler) {

    const msg_poll_url = "/msg-poll";

    const max_backlog = 20;
    const messages = []; 
    const connections = [];
    const callbacks = [];
   
    return {
        handler : handler,
        on      : addCallback,
        send    : sendMessage
    };

    function addCallback(x,fn) {
        if (x==="message" && typeof fn==="function") {
            callbacks.push(fn);
        }
    }

    function sendMessage(msg) {


        const id = Date.now();
        messages.push({id,msg:JSON.stringify(msg)});
        if (messages.length>max_backlog) {
            messages.splice(0,messages.length-max_backlog);
        }
        connections.splice(0,connections.length).forEach(function(con){
            const reply = getMessages(con.lastId);
            sendReply(con.response,reply) ;
        });
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

