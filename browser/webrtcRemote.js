const [button,button2,button3] = [].slice.call(document.querySelectorAll('button'));
const h1 = document.querySelector('h1');

window.tab_id = "tab_"+Date.now().toString(); 
var controller_tab_id = "controller_"+tab_id;
const updateTabTick = hysteresisWrap(doUpdateTabTick,500); 


let tabidInterval;
var runMode = "controller"; 
window.name = "timer_webrtc_remote";
var timerWin;
var peer,loopbackId;

decodeObjectData(location.href, location.origin, function(err,data){
    if (err) return  enablePaste () ;

    window.onstorage=null;
    loopbackId = data.id;
    if (localStorage.getItem('linked-peer-id')===loopbackId) {
        h1.innerHTML="Link opened on same system - ignored"
    } else {
        startPeer(data.signal);
    }

});

function startPeer(signal) {

    peer = new SimplePeer({ initiator: false,trickle:false });

    peer.on('signal', function(signalData) {
        // when peer1 has signaling data, give it to peer2 somehow

        encodeObjectData({ signal: signalData, id: loopbackId },  location.origin + '/webrtcSignal.html?', function(err,url){
            if (err) return alert(err);

            document.querySelector('input').value=url;

            const blob = new Blob ([ '[InternetShortcut]\nURL='+url] );
            
            button.onclick = function(){
                saveAs(blob,'link.url');
                button.onclick = null;
                button.disabled = true;
            };
            button2.disabled = false;
            
            button2.onclick = function() {
                var copyText = document.querySelector("input");
                
                // Select the text field
                copyText.select();
                copyText.setSelectionRange(0, 99999); // For mobile devices
                
                // Copy the text inside the text field
                navigator.clipboard.writeText(copyText.value);
                button2.disabled = true;

            };

            button.disabled  = false;
            button2.disabled = false;

            button.hidden  = false;
            button2.hidden = false;

            button3.disabled = true;
            
            h1.innerHTML="Open this link in a new tab, on the OTHER computer. (keep this tab open)";
                

        });

      
        
    });
    
    peer.on('connect',function(){
        document.querySelector('input').hidden = true;
        button.hidden=true;
        button2.hidden=true;
        h1.innerHTML="Link established";

    })
    
    peer.on('data',function(json){
    try {
        const msg = JSON.parse(json);
        console.log({in:msg});
        if (msg.storage) {
            Object.keys(msg.storage).forEach(function(k){
                const v= msg.storage[k];
                localStorage.setItem(k,v);
                console.log(k,'--->',v);
            });
        } else {
            if (msg.ready) {
                            
                enableOpenTimer();
            }
        }	   
    } catch (e) {
        console.log(e);
    }
    
    });
    
    peer.on('close',closeError);
    peer.on('error',closeError);

    function closeError(){
        document.querySelector('input').hidden = true;
        button.hidden=true;
        button2.hidden=true;
        h1.innerHTML="WebRTC Link is Closed";
        enablePaste () ;
    }
    


    peer.signal(signal);
}

function enableOpenTimer() {
    button2.onclick = function(){
        openTimerWindow(false)
        button2.disabled = true;
        h1.innerHTML='Timer window opened - keep this tab open to maintain the WebRTC link';

        if (tabidInterval) clearInterval(tabidInterval);
        tabidInterval = setInterval(updateTabId,500);

    };
    button2.innerHTML = "open timer";
    button2.disabled = false;
    button2.hidden=false;
}

function enablePaste () {

        button3.onclick = function() {
            button3.disabled = true;
            navigator.clipboard.readText().then(processClipboardText).catch(enablePaste);

            function processClipboardText(url) {
                const prefix = location.href.split('?')[0] ;

                decodeObjectData(url, prefix, function(err,data){
                    if (err) return enablePaste();
                    startPeer(data.signal);
                });

            }

        }

        button3.disabled = false;
}

function openTimerWindow(close) {
    if (close===true) {
       if (timerWin) timerWin.close();
       if (window.opener) window.close();
       timerWin = undefined;
    } else {
       timerWin = open("timer.html?presenter&linked", 'remote_timer_window', "location=0");
       if (timerWin) {
          timerWin.addEventListener ("load",function(){
              console.log("timer win loaded");
              timerWin.addEventListener ("unload",onTimerWinUnload);
          });
       }
    }
    return false;
}


function onTimerWinUnload() {
    enableOpenTimer();
}


function updateTabId() {
    getTabCount();
}

function doUpdateTabTick(tickNow) {
   
    writeNumber (tab_id,tickNow);
    if (runMode==="controller") {
        writeNumber (controller_tab_id,tickNow);
    } else {
       localStorage.removeItem (controller_tab_id);
    }
}


function hysteresisWrap(fn,msec) {
    let last = null;
    
    return function () {
        const tickNow = Date.now();
        if (last && last+msec > tickNow) {
            return;
        }
        last = tickNow;
        fn(tickNow);
    };
}


function getTabCount(cont) {
    let dead = [];
    let count = 1, tickNow = Date.now(), oldest = tickNow - 3000;

    if (!cont) { 
        updateTabTick();
    }

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key !== tab_id && key.startsWith("tab_")) {
            if (Number(localStorage.getItem(key)) < oldest) {
                dead.push(key);
            } else {
                if (cont) {
                    if (readNumber("controller_" + key, 0) > 0) {
                        count++;
                    }
                } else {
                    count++;
                }
            }

        } else {

            if (key.startsWith("controller_tab_")) {
                if (Number(localStorage.getItem(key)) < oldest) {
                    dead.push(key);
                }
            }
        }

    }
    dead.forEach(function (key) {
        localStorage.removeItem(key);
    });
    return count;
}

function writeNumber(nm,val) {
    if (val===undefined) {
        localStorage.removeItem(nm);
    } else {
        localStorage.setItem(nm,val.toString());
    }
}					

function readNumber(nm,def) {
    let str =  localStorage.getItem(nm);
    return str ? Number (str) : def;
}



