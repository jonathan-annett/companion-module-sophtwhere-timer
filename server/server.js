const fs        = require('fs');
const path      = require('path');
const http      = require('http');
const startLongPollPoster = require('./longPollPoster.js');
const { getTruePath } = require('./getTruePath');
const serverFS =  require('./server-pkg-fs.js');

const getBrowserFiles = require('./getBrowserFiles.js');

const content = getBrowserFiles(require('./browser-pkg-fs.js'));
const help_md_src  = 'HELP.md';
const help_md_dest = path.join( getTruePath('companion'),'HELP.md');

let server,connections;

function updateHelpMD(HTTP_PORT,help_md_src,help_md_dest) {
    
    if (fs.existsSync(help_md_dest) ) {
        
        const help_md = serverFS.readFileSync(help_md_src,'utf8');  
        const ipsArrayHtml=ipLinksArray(HTTP_PORT,module.exports.api.ip_list);
        
        const fixedupHelp = help_md
           .replace(/localhost\:8088/g,`localhost:${HTTP_PORT}`)
           .replace('<!--other links-->',ipsArrayHtml);
           
        const existingHelp = fs.readFileSync(help_md_dest,'utf8');  
        if (fixedupHelp!==existingHelp) {
            fs.writeFileSync(help_md_dest,fixedupHelp);
     	    return true;
        }
    }
    return false;
}


function ipLink(port,ip) {
    return `<a href="http://${ip}:${port}" target="_blank" rel="noopener"><span>http://${ip}:${port}</span></a>`;
}

function ipLinksArray(port,ips){
    const fn = ipLink.bind(null,port);
    return '  - '+ips.map(fn).join('\n  - ')+'\n';
}

function api_config(cfg,updated) {
    
    const HTTP_PORT=cfg.port;

    updateHelpMD(HTTP_PORT,help_md_src,help_md_dest);

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

    function restartServer() {
        
            connections = startLongPollPoster(defaultHTTPHandler);

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

            server.listen(HTTP_PORT, function() {
                console.log('Server is listening on port ' + HTTP_PORT );                      
            });

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



