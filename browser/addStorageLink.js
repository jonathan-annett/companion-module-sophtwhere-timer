function addStorageLink(wsUrl, whitelist, blacklist) {


    let iframe = document.createElement('iframe');
    iframe.src = '/storage-link-iframe.html';
    document.body.appendChild(iframe);

    iframe.onload = function(){
        onNewTabId(function(status,tabId){
            const msg = {tabId, final:status!=='checking', wsUrl, whitelist, blacklist};
            iframe.contentWindow.postMessage(msg,location.origin);
        });
    };

    return { close };

    function close() {
        if (iframe) {
            document.body.removeChild(iframe);
            iframe = null;
        }
    }
}

const link = addStorageLink(location.origin.replace(/^http/,'ws'), [], [/^tab_|^controller_tab/]);

const btn = document.querySelector('button');
btn.onclick = function() {
   const n = 1+Number.parseInt(localStorage.getItem('n') || '0');
   localStorage.setItem('n',n.toString());
   btn.innerHTML = `test ${n}`;
};