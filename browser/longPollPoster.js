/* 

 const connection = openLongPollPoster(function(message){
    
    // message = message from server, parsed json object as sent by server

    connection.send({hello:"hi there server"});



 });



*/


function openLongPollPoster(lastId,cb) {
    if (typeof lastId==='function') {
        cb=lastId;
        lastId=0;
    } else {
      lastId = lastId || 0;
    }
    const msg_poll_url = "/msg-poll";

  

    let callbacks = [];

    if (typeof cb==='function') callbacks.push(cb);

   

    let conn = {
        on : addCallback,
        send : sendMessage,
        lastId : lastId
    };

    nextMessage();
    
    return conn;

    function nextMessage() {

        getMsg(function(err,messages){
            
            if (messages) {

                messages.forEach(function(x){
                    const msg = JSON.parse(x.msg);
                    callbacks.forEach(function(fn){fn(msg)});
                });

            }

            if (err) {
                console.log(err);
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
        if (typeof cb!=='function') cb  = function(){};

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
                cb(undefined,msg.success);
            }          
        }

        function handleErrors(err) {
            cb(err);
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
}