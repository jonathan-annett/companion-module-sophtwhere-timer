
let tabidInterval;
window.tab_id = "tab_"+Date.now().toString(); 
var controller_tab_id = "controller_"+tab_id;
const updateTabTick = hysteresisWrap(doUpdateTabTick,500); 


var runMode = "presenter";

window.name = "timer_webrtc";

const invalidKeys = /^(tab_|controller_tab_)/;
const isValidKey = function (key) { return !invalidKeys.test(key); };


var peer = new SimplePeer({ initiator: true, trickle: false });
const [button, button2, button3] = [].slice.call(document.querySelectorAll('button'));
const h1 = document.querySelector('h1');

var timerWin;




const loopbackId = Math.random().toString();
localStorage.setItem('linked-peer-id', loopbackId);
peer.on('signal', function (signalData) {

    encodeObjectData({ signal: signalData, id: loopbackId },  location.origin + '/webrtcRemote.html?', function(err,url){
        if (err) return alert(err);
        
        document.querySelector('input').value = url;

        window.onstorage = waitStoragePeerData;

        const blob = new Blob(['[InternetShortcut]\nURL=' + url]);
    
        button.onclick = function () {
            saveAs(blob, 'linked.url');
            button.onclick = null;
            button.disabled = true;
        };
        
        button2.onclick = function () {
            var copyText = document.querySelector("input");
    
            // Select the text field
            copyText.select();
            copyText.setSelectionRange(0, 99999); // For mobile devices
    
            // Copy the text inside the text field
            navigator.clipboard.writeText(copyText.value);
            button2.disabled = true;
    
    
            button3.onclick = function () {
    
                navigator.clipboard.readText().then(processClipboardText);
    
                function processClipboardText(url) {
                    const prefix = location.origin + '/webrtcSignal.html?';

                    decodeObjectData(url, prefix,function(err,msg){
                        if (err) return alert(err);
                        if (msg && msg.signal && msg.id === loopbackId) {
                            window.onstorage = null;
                            peer.signal(msg.signal);
                            button3.disabled = true;
                        }
                    });

                }
    
            };
            button3.disabled = false;
        };

        button.disabled = false;
        button2.disabled = false;
    
        h1.innerHTML = "Open this link on the OTHER computer, and keep this tab open.";
    
    });


});

peer.on('connect', () => {

    document.querySelector('input').hidden = true;
    button.hidden = true;

    h1.innerHTML = 'WebRTC Link Established';

    localStorage.removeItem("linked-peer-data");
    localStorage.removeItem("linked-peer-id");


    const payload = { storage: {} };

    const validKeys = Object.keys(localStorage).filter(isValidKey);

    validKeys.forEach(function (k) {
        const val = localStorage.getItem(k);
        if (val) {
            payload.storage[k] = val;
        }
    })

    peer.send(JSON.stringify(payload));
    console.log({ out: payload });

    window.onstorage = relayToPeer;

    button2.onclick = function () {
        openTimerWindow(false)
        button2.disabled = true;

        if (tabidInterval) clearInterval(tabidInterval);
        tabidInterval = setInterval(updateTabId, 500);
        setTimeout(function () {
            const payload = { ready: true };

            peer.send(JSON.stringify(payload));
            console.log({ out: payload });
            h1.innerHTML = 'Timer window opened - keep this tab open to maintain the WebRTC link';

        }, 1000);
    };
    button2.innerHTML = "open timer";
    button2.disabled = false;

})


peer.on('close', function () {
    if (tabidInterval) {
        clearInterval(tabidInterval);
        tabidInterval = undefined;
    }
    location.replace(location.href);

});

peer.on('error', function () {
    if (tabidInterval) {
        clearInterval(tabidInterval);
        tabidInterval = undefined;
    }
    location.replace(location.href);

});



function waitStoragePeerData(ev) {
    if (ev.key === "linked-peer-data") {
        decodeObjectData(
            location.origin+'?'+ ev.newValue, 
            location.origin, function(err,msg){
                if (err) return alert(err);
                if (msg && msg.signal && msg.id === loopbackId) {
                    window.onstorage = null;
                    peer.signal(msg.signal);
                }                
            }
        );
    }
}

function relayToPeer(ev) {
    if (!invalidKeys.test(ev.key)) {

        const payload = { storage: {} };
        payload.storage[ev.key] = ev.newValue;
        peer.send(JSON.stringify(payload));
        console.log({ out: payload });

    }
}

function openTimerWindow(close) {
    if (close === true) {
        if (timerWin) timerWin.close();
        if (window.opener) window.close();
        timerWin = undefined;
    } else {
        timerWin = open("timer.html", 'timer_control_window');
        if (timerWin) {
            timerWin.addEventListener("load", function () {
                console.log("timer win loaded");
                timerWin.addEventListener("unload", onTimerWinUnload);
            });
        }
    }
    return false;
}

function onTimerWinUnload() {
    timerWin = undefined;
    button2.disabled = false;
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

function writeNumber(nm, val) {
    if (val === undefined) {
        localStorage.removeItem(nm);
    } else {
        localStorage.setItem(nm, val.toString());
    }
}

function readNumber(nm, def) {
    let str = localStorage.getItem(nm);
    return str ? Number(str) : def;
}

