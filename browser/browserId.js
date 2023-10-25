browserId();

function browserId() {

    let id = getCookieValue('browserId', document.cookie);
    if (id) {
        window.thisBrowserId = id
        return id;
    }

    id = Math.random().toString(36).substring(2)+Date.now().toString(36).toString(4);
    window.thisBrowserId = id

    setCookie('browserId',id);

    location.replace(location.href);

    function setCookie(
        cname,
        cvalue,
        exdays = 100 
      ) {
        const now = new Date()
        const expireMs = exdays * 24 * 60 * 60 * 1000
        now.setTime(now.getTime() + expireMs)
      
        document.cookie = `${cname}=${cvalue};expires=${now.toUTCString()};path=/`
      }

      function getCookieValue(cookieName = '', cookie = '') {
        const matches = cookie.match(`(^|[^;]+)\\s*${cookieName}\\s*=\\s*([^;]+)`)
        return matches ? matches.pop() : ''
      }
  }
  