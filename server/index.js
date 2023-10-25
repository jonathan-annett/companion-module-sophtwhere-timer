/*!
 * companion-module-sophtwhere-timer/server/index.js
 * Copyright(c) 2023 Jonathan Annett
 * MIT Licensed
 */

const fs        = require('fs');
const path      = require('path');
const startLongPollPoster = require('./longPollPoster.js');

  

//const {startMessagesAPI} = require('./messages.js');
const { getTruePath } = require('./getTruePath.js');

const getBrowserFiles = require('./getBrowserFiles.js');
const deployed = __filename.endsWith('main.js');
const browser_root =  deployed ?  path.join(__dirname,'browser') +'-' : './browser/';
const content =  getBrowserFiles( browser_root );

const help_md_src  = 'HELP.md';
const help_md_dest = path.join( getTruePath('companion'),'HELP.md');

let server,connections;

function api_config(self,config,enabledIps) {

   

    return new Promise(function(resolve,reject){
        
        const use_ws = true;//!!config.allow_ws;

        
                
            const HTTP_PORT=config.port;
            const restartURL = server && server.last_port === HTTP_PORT ? "/" : Number(HTTP_PORT); 
            console.log({HTTP_PORT,restartURL,last: server ? server.last_port : '?'});

            let browserControlId;

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

            if (config.redirect_disabled && !redirect_host) {
                console.log("can't redirect as no suitable address exists");

            } else {

                if (config.redirect_disabled) {
                    console.log("will redirect disabled interfaces to",redirect_host);
                } else {
                    console.log("will reject connection attempts to any disabled interfaces");
                }
                
            }



            return shutdownServer(restartURL).then(restartServer).catch(reject);



        function requestPermitted(request, response) {
            if (!enabledIps[request.headers && request.headers.host ]) {

                if (redirect_host && config.redirect_disabled) {
                    response.writeHead(302,{
                        'Location': `http://${redirect_host}/${request.url.replace(/^\//,'')}`
                    });
                } else {
                    response.writeHead(403);
                    response.write("this service is not enabled for this ip address");
                }
                response.end();
                return false;
            }
            return true;
        }

        function restartServer() {
            
                connections = startLongPollPoster(defaultHTTPHandler,requestPermitted,use_ws);

                server = connections.server;

                server.last_port = HTTP_PORT;

                connections.on('message',function(msg){

                    // msg is parsed json object as sent by client(s)

                    if ( msg.setVariableValues ) {
                            module.exports.api.setVariableValues( msg.setVariableValues );
                            browserControlId = msg.browserId;
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

                    let req_uri = request.url.split('?')[0];

            
                    if (req_uri === "/" ) {
                      

                        if ((request.browserId === browserControlId) || !browserControlId) {
                            response.writeHead(301, { "Location": "/control" });
                        } else {
                            response.writeHead(301, { "Location": "/linked" });
                        }
                        return response.end();
                    } else {
                        if (req_uri === "/remote" ) {
                            if ((request.browserId !== browserControlId) && browserControlId) {
                                response.writeHead(301, { "Location": "/linked" });
                                return response.end();
                            }
                        }
                    }
                   

                    const handler = content [req_uri];

                    if (handler) {
                        return handler(request,response);
                    }
                    response.writeHead(404);
                    response.end();
                }
                const listen_args = [HTTP_PORT];

            // if (listen_address) listen_args.push(listen_address);

                listen_args.push(function() {
                    resolve('Server is listening on port ' + HTTP_PORT );                     
                });

            
                server.listen.apply(server, listen_args );

                module.exports.api.send = api_send;
                    
                function api_send (data) {
                    let keys;
                    try {

                        // encode simple commands as keystrokes
                        switch (data.cmd) {
                           
                         
                            case "catchup" : {
                                data = {  cmd : "keys",keys :[ 'Control','Enter','~Control' ] }
                                break;
                            }

    



                        }

                        connections.send(data,function(err){
                            if (err ) {
                                console.log(err);
                            }
                        });

                    } catch (x) {
                        console.log((new Date()) , x);
                    }
                }

        }

      

    });




}

function shutdownServer(redirectToUrl) {
    return new Promise(function(resolve,reject){

        if (connections) {

                const doshutdown = function () {
                    console.log('cleaning up connections...');
                    connections.cleanup().then(continueClosingDownServer);
                    connections=undefined;
                }
        
                if (redirectToUrl) {
                    console.log('redirecting connections to ',redirectToUrl);
                    connections.send({cmd:'redirect','url':redirectToUrl,delay:1500},doshutdown,1000);
                } else {
                    doshutdown();
                }

               
        } else {
            return continueClosingDownServer();
        }

        function continueClosingDownServer() {
            if (server) {
                let tmr = setTimeout(function(){
                    if (tmr) {
                        tmr = undefined;
                        resolve(false);
                    }
                },1500);
                console.log('shutting down server...');
                server.on('close',function(){
                    server = undefined;      
                    if (tmr) {
                        clearTimeout(tmr);
                        tmr = undefined;
                        resolve(true);
                    }               
                });
                return server.close();
            } else {
                resolve(false);
            }
        }

    });
}


 
module.exports = {

   api : {
      send : function(){},
      setVariableValues : function(values){

        
      },
    
      config : api_config,


      shutdownServer : shutdownServer
      
    }

};

global['sophtwhere-timer-api'] = module.exports.api;

