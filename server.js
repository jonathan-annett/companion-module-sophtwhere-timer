const fs = require('fs'),path=require('path');
const http = require('http');
const WebSocket = require('ws');

const files = [
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
 

function api_config(cfg) {
    console.log(cfg);
    const HTTP_PORT=cfg.port;
    const connections = [];

    const server = http.createServer(function(request, response) {
        const data = content [request.url.split('?')[0]];
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

    wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        try {
        const msg = JSON.parse( message.toString('utf8'));
            if ( msg.setVariableValues) {
                module.exports.api.setVariableValues( msg.setVariableValues );
            } else {
                console.log("wtf",msg);
            }
    
        } catch(e) {

        }
    
    })
    console.log('timer browser ws connected');
    connections.push(ws);
    ws.on('close',function(){
        const ix = connections.indexOf(ws);
        if (ix>=0) {
            connections.splice(ix,1);
            console.log('ws disconnected ');        
        }
    });
    
    });

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


        }
        const json = JSON.stringify(data);
        connections.forEach(function(connection){
            connection.send(json);
        });
    } catch (x) {
        console.log((new Date()) , x);
    }
}



}


module.exports = {

   api : {
      send : function(){},
      setVariableValues : function(values){

        
      },
    
      config : api_config
    }

};



