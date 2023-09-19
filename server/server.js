const fs        = require('fs');
const path      = require('path');
const http      = require('http');
const startLongPollPoster = require('./longPollPoster.js');
const { getTruePath } = require('./getTruePath');

const getBrowserFiles = require('./getBrowserFiles.js');

const content =   getBrowserFiles( __filename.endsWith('main.js') ? require('./browser-pkg-fs.js'):fs);
const help_md_src  = 'HELP.md';
const help_md_dest = path.join( getTruePath('companion'),'HELP.md');


let server,connections;

function api_config(config,enabledIps) {
    
    const HTTP_PORT=config.port;
    let redirect_host;
    const hosts = Object.keys(enabledIps).map(function(x){
        const this_ip = x.split(':')[0]
        if (enabledIps[x]) {
            if (!redirect_host && this_ip !== '127.0.0.1') {
                redirect_host = x;
            }
        }
        return this_ip;
    });



    if (!redirect_host) {
        console.log("can't redirect as no suitable address exists");

    } else {
        if (config.redirect_disabled) {
            console.log("will redirect disabled interfaces to",redirect_host);
        }
           
    }
  

    if (connections) {
        try {
            console.log('cleaning up connections...');
            connections.cleanup();
        } catch(e) {

        } finally {
            connections=undefined;
        }
    }

    if (server) {
        console.log('shutting down server...');
        server.on('close',function(){
            server = undefined;
            console.log('restarting server after clean shutdown');
            restartServer();
        });
        return server.close();
    } else {
        restartServer();
    }


    function requestPermitted(request, response) {
        if (!enabledIps[request.headers && request.headers.host ]) {

            if (redirect_host && config.redirect_disabled) {
                response.writeHead(302,{
                    'Location': `http://${redirect_host}/${request.url.replace(/^\//,'')}`
                  });
            } else {
                response.writeHead(403);
                response.write("Forbidden");
            }
            response.end();
            return false;
        }
        return true;
    }

    function restartServer() {
        
            connections = startLongPollPoster(defaultHTTPHandler,requestPermitted);

            server = http.createServer(connections.handler);

            connections.on('message',function(msg){

                // msg is parsed json object as sent by client(s)

                if ( msg.setVariableValues ) {
                        module.exports.api.setVariableValues( msg.setVariableValues );
                } else {
                    if (msg.setTimerColors) {

                        module.exports.api.updateTimerColors (msg.setTimerColors);

                    } else {
                        console.log("unhandled message:",msg,typeof msg);
                    }
                }

            });

            function defaultHTTPHandler(request, response) {

                if (!requestPermitted(request, response)) {
                    return;
                }

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
                //console.log((new Date()) + ' Received request for ' + request.url);
                response.writeHead(404);
                response.end();
            }
            const listen_args = [HTTP_PORT];

           // if (listen_address) listen_args.push(listen_address);

            listen_args.push(function() {
                console.log('Server is listening on port ' + HTTP_PORT );                      
            });

            server.listen.apply(server, listen_args );

            module.exports.api.send = api_send;
                
            function api_send (data) {
                let keys;
                try {

                    // encode simple commands as keystrokes
                    switch (data.cmd) {

                        case "start" : {
                            if (typeof data.msecs === 'number') {
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
                            if (typeof data.msecs === 'number') {
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

                        case "presenter" : {
                            data = {  cmd : "keys",keys :[ 'p' ] }
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

                    connections.send(data);

                } catch (x) {
                    console.log((new Date()) , x);
                }
            }

    }
}


module.exports = {

   api : {
      send : function(){},
      setVariableValues : function(values){

        
      },
    
      config : api_config,
      
    }

};



