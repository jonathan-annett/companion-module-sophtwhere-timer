/*global processServerMessage,writeNumber*/
 
let server_conn;


window.timerAPI = { 
    send : sendTimerApiMessage
};

function sendTimerApiMessage( msg ) {
    if (server_conn) {
        server_conn.send(JSON.stringify(msg));
    }
}

function openLongPollPoster(lastId,cb,useWs) {
    lastId = lastId || 0;
   
    const msg_poll_url = "/msg-poll";
   


    let opened=false;

    let callbacks = [];

    if (typeof cb==='function') callbacks.push(cb);

    if (useWs) return  emulateViaWebsocket (lastId,cb);

    let conn = {
        on : addCallback,
        send : sendMessage,
        lastId : lastId
    };

    nextMessage();
    
    return conn;

    function nextMessage() {

        if (!opened) {
            return setTimeout(function(){
                callbacks.forEach(function(fn){fn({cmd:"opened"})});
                opened=true;
                nextMessage();  
            },100);            
        }

        getMsg(function(err,messages){
            
            if (messages) {

            
                messages.forEach(function(x){
                    const msg = JSON.parse(x.msg);
                    callbacks.forEach(function(fn){fn(msg)});
                });

            }

            if (err) {
                console.log("error in longpoll:",err);
                opened=false;
            }

            nextMessage();

        });
    }


    function addCallback(x,fn) {
        if (x==="message" && typeof fn==="function") {
            callbacks.push(fn);
        }
    }

    function sendMessage(msg,cb) {
     

        fetch(msg_poll_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({send:msg})
        }).then(processResponse).catch(handleErrors);

        function processResponse(response) {
            response.json().then(processParsedJSON).catch(handleErrors);
        }

        function processParsedJSON (msg) {
            if (msg.error) {
                return cb(new Error(msg.error));
            } else {
                if (msg.success) return cb ?cb() :undefined;
                location.replace(location.href);
            }          
        }

        function handleErrors(err) {
            if (cb) return cb(err);
            //location.replace(location.href);
        }

    }

    function getMsg(cb) {

        fetch(msg_poll_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({receive:conn.lastId})
        }).then(processResponse).catch(handleErrors);

        function processResponse(response) {
            response.json().then(processParsedJSON).catch(handleErrors);
        }

        function processParsedJSON (msg) {
            if (msg.messages) {
                conn.lastId=msg.id;
                cb(undefined,msg.messages);                      
            } else {
                if (msg.error) {
                    cb(msg.error);
                }
            }
        }

        function handleErrors(err) {
            cb(err);
        }

    }


    function emulateViaWebsocket (lastId,cb) {
        

        let conn = {
            on : addCallback,
            send : sendMessage,
            lastId : lastId
        };

        let socket;

        restartWS();

        return conn;

        function restartWS() {
            socket = new WebSocket(location.origin.replace('http://','ws://'));
    
            socket.onopen = function(e) {
                callbacks.forEach(function(fn){fn({cmd:"opened"})});
            };
        
            socket.onmessage = function(event) {
                const json = event.data;
                try {
                    const msg = JSON.parse(json);
                    callbacks.forEach(function(fn){fn(msg)});
                } catch (x) {
                    callbacks.forEach(function(fn){fn({error:x})});
                }
            };
        
            socket.onclose = function(event) {
                
                if (event.wasClean) {
                //    callbacks.forEach(function(fn){fn(undefined,"closed",event.reason,event.code)});
                    // alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    // e.g. server process killed or network down
                    // event.code is usually 1006 in this case
               //     callbacks.forEach(function(fn){fn(undefined,"aborted",event.reason,event.code)});                   
                }
        
        
                if (socket) {
                    socket.onerror =undefined;
                    socket.onclose =undefined;
                    socket.onmessage =undefined;
                    socket = undefined;
                    setTimeout(restartWS,1500);
                }
            };
                
            socket.onerror = function(error) {
                cb(error);
                if (socket) {
                    socket.onerror =undefined;
                    socket.onclose =undefined;
                    socket.onmessage =undefined;
                    socket = undefined;
                    setTimeout(restartWS,1500);
                }
                
            };
    
        }
    
     

        function sendMessage(msg,cb,tries) {
            if (socket) {
                socket.send(msg);
                setTimeout(cb,10,undefined,!tries);
            } else {
                if (tries&&tries>=10) {
                    return cb ? cb(new Error("could not send")) : location.replace(location.href);
                } else {
                    setTimeout(sendMessage,500,msg,cb,(tries||0)+1);
                }
            }
        }
            
    }
}

function getLongPollPosterMode() {
    const msg_poll_mode_url = "/msg-poll-mode.json";

    return new Promise(function(resolve){
        fetch(msg_poll_mode_url,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        }).then(processResponse).catch(handleErrors);

        function handleErrors() {
            processPosterMode("error");
        }

        function processResponse(response) {
            response.json().then(processPosterMode).catch(handleErrors);
        }

        function processPosterMode(mode) {
            resolve(mode);
        }
    });
}


function startTimerApi() {

    getLongPollPosterMode().then(function(useWs){
        console.log({useWs});
        if (useWs === 'error' ) {
            return location.replace(location.href);
        }
        html.classList[useWs?'add':'remove']('ws');
        server_conn = openLongPollPoster( readNumber('lastLongPollId',0),function(message){    
            processTimerApiMessage(message);    
            writeNumber('lastLongPollId',server_conn.lastId);
        },useWs);
    }); 
}
