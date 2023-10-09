
decodeObjectData(location.href, location.origin, function(err,data){
  if (err) return alert(err);

  if (data && data.signal && data.id ===  localStorage.getItem('linked-peer-id')) {
    const base64=location.search.replace(/^\?/,'');
    localStorage.setItem('linked-peer-data',base64);

    window.onstorage = function(ev) {
            if (ev.key==="linked-peer-data" && !ev.newValue) {
                document.querySelector('h1').innerHTML = "Linked... you can close this tab now";
                window.onstorage = null;
            }
    };
    }
});



