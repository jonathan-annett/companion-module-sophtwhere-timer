function onNewTabId(callback) {

  const recycle = sessionStorage.getItem('tabId');

  if (recycle) {

      const bc = new BroadcastChannel(`tabId_${recycle}`);
      let timeout = setTimeout(function () {
          timeout = null;
          bc.onmessage = null;
          bc.close();
          newId(recycle);
          console.log("reload...",recycle);
          callback("reload", recycle);
      }, 50);

      bc.onmessage = function (ev) {
          if (ev.data === '?') {
              bc.postMessage('!');
          }

          if ((ev.data === '!') && timeout) {
              if (timeout) {
                clearTimeout(timeout);
                timeout = null;
                console.log(" ( cancelled:reload...",recycle," )");
              }
              bc.onmessage = null;
              bc.close();
              const newId_ = newId();
              console.log("duplicate...",recycle,"-->",newId_);
              callback("duplicate", newId_);

          }
      };

      bc.postMessage('?');



  } else {

      return callback("new", newId());

  }


  function newId(recycle) {
      const tabId = recycle || Math.random().toString(36).slice(-6) + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(-6);
      sessionStorage.setItem('tabId', tabId);
      const bc = new BroadcastChannel(`tabId_${tabId}`);
      bc.onmessage = function (ev) {
          bc.postMessage('!');
      };
      return tabId;
  }
}
