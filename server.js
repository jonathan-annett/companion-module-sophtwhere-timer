const fs        = require('fs');
const path  =require('path');
const http      = require('http');
const startLongPollPoster = require('./longPollPoster.js');

const files = [
    // these files are cached for the browser
    'timer.html',
    'timer.js',
    'timer.css',
    'fsapi.js',
    'longPollPoster.js'
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

const help_md_src = path.join(__dirname,'HELP.md');
const help_md_dest = path.join(__dirname,'companion','HELP.md');





content['/index.html']=content['/timer.html'];
content['/']=content['/timer.html'];


function api_config(cfg,updated) {
    console.log({cfg});

    const HTTP_PORT=cfg.port;

    if (fs.existsSync(help_md_dest) && fs.existsSync(help_md_src) ) {
        const help_md = fs.readFileSync(help_md_src,'utf8');  
        const fixedupHelp = help_md.replace(/localhost\:8088/g,`localhost:${HTTP_PORT}`);
        const existingHelp = fs.readFileSync(help_md_dest,'utf8');  
        if (fixedupHelp!==existingHelp) {
            fs.writeFileSync(help_md_dest,fixedupHelp);
            if (updated) {
                console.log("updated",cfg);
		        return;
            }
        }
    }


    const connections = startLongPollPoster(defaultHTTPHandler);

    const server = http.createServer(connections.handler);

 
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


async function loadOpen(){
    const open =  await import('open');
	return open;
}


module.exports = {

   api : {
      send : function(){},
      setVariableValues : function(values){

        
      },
    
      config : api_config,
      
    }

};



