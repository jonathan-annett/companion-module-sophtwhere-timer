const fs        = require('fs');
const path  =require('path');
const http      = require('http');
const WebSocket = require('ws');

const files = [
    // these files are cached for the browser
    'timer.html',
    'timer.js',
    'timer.css',
    'fsapi.js'
];

const content = {};
files.forEach(function(fn){
    const body =  fs.readFileSync(path.join(__dirname,'browser',fn),'utf8');   
    content['/'+fn]= {
        body: body,
        headers : {
            'content-type': 'text/'+fn.split('.').pop(),
            'content-length' : content.length
        }
    };
});


content['/index.html']=content['/timer.html'];
content['/']=content['/timer.html'];
 
const connections = [];

function api_config(cfg) {
   
    const HTTP_PORT=cfg.port;

    closeConnections ();
   
    const server = http.createServer(function(request, response) {
        const data = content [request.url.split('?')[0]];
        console.log(request.socket.remoteAddress);
        if (data) {
            ['content-type' ].forEach(function(hdr){
                response.setHeader(hdr,data.headers[hdr]);
            });
            response.writeHead(200);
            response.write(data.body);
            response.end();
            return;
        }
        console.log((new Date()) + ' Received request for ' + request.url);
        response.writeHead(404);
        response.end();
    });


    const wss = new WebSocket.Server({ server: server })

    wss.on('connection', onWSConnection);

    function onWSConnection (ws) {

        console.log('timer browser ws connected');

        const forcePresenter = JSON.stringify({cmd:"presenter"});
        const forceControl = JSON.stringify({cmd:"control"});
        connections.forEach(function(conn){
            conn.send(forcePresenter);
        });

        connections.push(ws);

        ws.send(forceControl);

        ws.on('message',onWsMessage);
        ws.on('close',onWsClose);

        function onWsMessage(message) {
            try {
    
            const msg = JSON.parse( message.toString('utf8'));
                if ( msg.setVariableValues ) {
                    module.exports.api.setVariableValues( msg.setVariableValues );
                } else {
                    console.log("unhandled message:",msg);
                }
        
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

    server.listen(HTTP_PORT, function() {
        console.log((new Date()) + ' Server is listening on port ' + HTTP_PORT );      
        
    });

    module.exports.api.send = api_send;
        
    function api_send (data) {
        let keys;
        try {

            switch (data.cmd) {
                case "start" : {
                    if (data.msecs) {
                        let seconds = (data.msecs/60000).toFixed(3);
                        while (seconds.endsWith("0")) {
                            seconds = seconds.substring(0,seconds.length-1);
                        }
                        if (seconds.endsWith(".")) {
                            seconds = seconds.substring(0,seconds.length-1);
                        }  
                        keys = (" "+seconds).split("").concat(["Enter"," "]);
                    } else {
                        keys = [" "];
                    }
                    data = {
                        cmd : "keys",
                        keys : keys
                    };
                    break;
                }


                case "default" : {
                    if (data.msecs) {
                        let seconds = (data.msecs/60000).toFixed(3);
                        while (seconds.endsWith("0")) {
                            seconds = seconds.substring(0,seconds.length-1);
                        }
                        if (seconds.endsWith(".")) {
                            seconds = seconds.substring(0,seconds.length-1);
                        }  
                        keys = ["Enter"].concat(seconds.split("")).concat(["Enter"]);
                    } else {
                        return;
                    }
                    data = {
                        cmd : "keys",
                        keys : keys
                    };
                    break;
                }


                case "pause" : {
                    data = {  cmd : "keys",keys :[ '/' ] }
                    break;
                }

                case "undopause" : {
                    data = {  cmd : "keys",keys :[ "'" ] }
                    break;
                }

                case "bar" : {
                    data = {  cmd : "keys",keys :[ 'b' ] }
                    break;
                }

                case "time" : {
                    data = {  cmd : "keys",keys :[ 't' ] }
                    break;
                }

                
                case "plus1Min" : {
                    data = {  cmd : "keys",keys :[ 'Control','ArrowUp','~Control' ] }
                    break;
                }
                case "minus1Min" : {
                    data = {  cmd : "keys",keys :[ 'Control','ArrowDown','~Control' ] }
                    break;
                }

                case "plus1" : {
                    data = {  cmd : "keys",keys :[ 'ArrowUp' ] }
                    break;
                }
                case "minus1" : {
                    data = {  cmd : "keys",keys :[ 'ArrowDown' ] }
                    break;
                }

                case "catchup" : {
                    data = {  cmd : "keys",keys :[ 'Control','Enter','~Control' ] }
                    break;
                }

                case "messages" : {
                    data = {  cmd : "keys",keys :[ 'm' ] }
                    break;
                }



            }
            const json = JSON.stringify(data,undefined,4);
            if (connections.length) { console.log("sending:",json);}

            connections.forEach(function(connection){
                connection.send(json);
            });
        } catch (x) {
            console.log((new Date()) , x);
        }
    }

    function closeConnections () {
        connections.splice(0,connections.length).forEach(function(conn){
            conn.close();
        });
    }

}


async function loadOpen(){
    const open =  await import('open');
	return open;
}


module.exports = {

   api : {
      send : function(){},
      setVariableValues : function(values){

        
      },
    
      config : api_config
    }

};



