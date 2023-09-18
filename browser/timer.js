

/*jshint maxerr: 10000 */

/* global fs_api,ace*/

const oneSecond        = 1000;
const oneMinute        = 60 * oneSecond;
const skip_granularity = 15 * oneSecond;

var timerWin;

window.addEventListener ("unload",onControlUnload);

let server_conn;

let doc = document;
let qs = doc.querySelector.bind(doc);
let getEl = doc.getElementById.bind(doc);

let shifting = false;
let controlling = false;

let stylesheet1= getEl ("style_1");
let stylesheet1_obj;
replaceStylesheet(stylesheet1,function(ev){
    stylesheet1_obj = ev;
});

let aceScript;
let elapsedDisp  = getEl("elapsed_disp");
let remainDisp   = getEl("remain_disp");
let startedDisp  = getEl("started_disp");
let endsDisp     = getEl("ends_disp");

let remainInfoDisp = getEl("remain_info_message");


let custom_message  = getEl("custom_message");


let durationDisp = getEl("duration_disp");
let extraTimeDisp = getEl("extra_time_disp");


 

let nowDisp      = getEl("now_disp");
let keyDisp      = getEl("key_disp");
let dispNextMins = getEl("disp_next_mins");
let html         = qs("html");
let progress     = qs('.progress');
let pausedAt;
let pauseAcum = 0;
  
let runMode = "controller";

let togglePIPMode = setupPip(
    "remain_disp",
    "remain_disp_video",
    192*2,108*2,
    '100px "Lucida", sans-serif',
    "#remain_disp_video_text",
    "overlay",
    "#remain_disp_video_text",
    '40px "Lucida", sans-serif');

  if (window.location.search.startsWith("?presenter")) {

      html.classList.add("reduced");
      runMode = "presenter";
      if (fs_api.isFullscreen()) {
         document.title = "Presentation Timer - Remote Screen (Fullscreen)";
      } else {
         document.title = "Presentation Timer - Remote Screen";
      }

  } else {

     if (fs_api.isFullscreen()) {
         document.title = "Presentation Timer - Control Screen (Fullscreen)";
     } else {
         document.title = "Presentation Timer - Control Screen";
     }

   

  }
  
let defaultDuration = readNumber ( "defaultDuration", 10 * oneMinute ); 
let thisDuration = defaultDuration;
let startedAt       = readNumber ( "startedAt",       Date.now()     );
let endsAt          = readNumber ( "endsAt",          startedAt + defaultDuration  ) ;
let seekEndsAt      = readNumber ( "seekEndsAt",      endsAt        );


let lastUpdateTick = 0;
let lastTimeText   = "";
let lastEndsAtText = "";
let enterTimeText  = "";
let enterHoursText = "";
window.tab_id = "tab_"+Date.now().toString(); 

custom_message.addEventListener('focus', function(){
  setTimeout(function(){
     document.execCommand('selectAll',false,null);
  },2);
});


  progress.style.width = '0%';
    
  dispNextMins.textContent = secToStr(defaultDuration/1000);
  
  let restartNeeded = isNaN (startedAt) || isNaN (endsAt);
  if (!restartNeeded) {
      
      let overshoot = 1000 * 60 * 10;
      if ((Date.now () > endsAt + overshoot) || (Date.now() > seekEndsAt+ overshoot) ) {
          restartNeeded=true;
      } 

  }
  
  if ( restartNeeded) {
     restartTimer() ;
  } else {
      
      if ((Date.now () > endsAt) || (Date.now() > seekEndsAt) ) {
          endsAt = seekEndsAt;
          setHtmlClass("over");
      } 
       startedDisp.textContent =  local24HourTime (new Date(startedAt));
       endsDisp.textContent    =  local24HourTime ( new Date(endsAt) );
       durationDisp.textContent = secToStr((endsAt-startedAt) / 1000);
       
       
       pausedAt = readNumber("pausedAt",pausedAt);
       pauseAcum = readNumber("pauseAcum",pauseAcum);
       
       
       
       if (pausedAt!==undefined) {
           setHtmlClass("paused");
       }
    
       
       displayUpdate();
       
       if ( readNumber("showbar",0) === 1) {
           setHtmlClass("showbar");
       } else {
           clearHtmlClass("showbar");
       }
       
        if ( readNumber("showtimenow",0) === 1 ) {
           setHtmlClass("showtimenow");
         } else {
           clearHtmlClass("showtimenow");            
         } 
         
         
        if ( readNumber("showmessages",0) === 1 ) {
           setHtmlClass("showmessages");
         } else {
           clearHtmlClass("showmessages");
         } 

       
       
       localStorage.setItem("remainDispClass",html.className);
  }

  dispNextMins.textContent = secToStr( defaultDuration / oneSecond );
  
  setInterval(displayUpdate,100);
  doc.addEventListener("keyup",onDocKeyUp);
  doc.addEventListener("keydown",onDocKeyDown);
  
  doc.addEventListener("contextmenu",function(e){ e.preventDefault();});
  addEventListener('storage',onLocalStorage);
  
           [].forEach.call(document.querySelectorAll('div.buttons div.btn'),function(el){
              el.addEventListener('pointerdown',keyMacroClick);
          });

          
 
          function keyMacroClick(e) {
              if (e.pointerType === "mouse") {
                  if (e.button !== 0) {
                      return;
                  }
              }
              let keys = this.dataset.keys.split(",").map(function(code){
                  
                  if (code.startsWith('!')) {
                      
                      return {key : code.substr(1),__up:true};
                  } else {
                    return {key : code};  
                  }
              });
              
              if (e.shiftKey && keys[0].key===" ") {
                  
                  if (enterTimeText !== "") {
                      this.dataset.keys = ' ,'+enterTimeText.split('').join(',')+', ';
                      this.innerHTML = enterTimeText;
                      clearHtmlClass("editing");
                      dispNextMins.textContent = secToStr(defaultDuration/1000);
                      enterTimeText = "";
                      return;

                  } else {
                      keys = this.dataset.keys.split(",").map(function(code){
                          if (code===" ")  {
                              return { key :"Enter" };
                          }
                          return {key : code};  
                      });
                    }
              }
              
              keys.forEach(function(e){
                  if (e.__up) { 
                    onDocKeyUp(e);
                  } else {
                    onDocKeyDown(e);
                  }
              });
          }
          
  
   function openTimerWindow(close) {
      if (close===true) {
         if (timerWin) timerWin.close();
         if (window.opener) window.close();
         timerWin = undefined;
      } else {
         timerWin = open("timer.html?presenter", 'remote_timer_window', "location=0");
         if (timerWin) {
            timerWin.addEventListener ("load",function(){
                console.log("timer win loaded");
                timerWin.addEventListener ("unload",onTimerWinUnload);
            });
         }
      }
      return false;
  }
  
  
  function displayUpdate() {
      
      let tabCount = getTabCount(),timeNow =  Date.now() ;
      let controllerCount = getTabCount(true);
      let pausing = false;

      let adjusting_down = false;
      let adjusting_up = false;
      let adjusting_delta = '0';
      let remain_actual ;
      
      if (tabCount===1) {
          clearHtmlClass("twoplus");
      } else {
          setHtmlClass("twoplus");
      }

      if (!fs_api.isFullscreen()) {
            if (runMode === "presenter") {
                if (tabCount===1) {
                    document.title = "Presentation Timer - Single Window";
                } else { 
                    document.title = "Presentation Timer - Remote Screen";
                }
            } else  {
                if (runMode==="controller" ) {
                    document.title = "Presentation Timer - Control Screen";
                } else {
                   document.title = "Presentation Timer";
                }
            }
      } else {
             if (runMode === "presenter") {
                        document.title = "Presentation Timer - Remote Screen (Fullscreen)";
             } else  {
                    if (runMode==="controller" ) {
                        document.title = "Presentation Timer - Control Screen (Fullscreen)";
                    } else {
                        document.title = "Presentation Timer (Fullscreen)";
                    }
            }  
      } 
      
      if (runMode==="controller" || tabCount=== 1 ) {
         
         let pausedMsec = pausedAt ? timeNow-pausedAt : 0;
          
         let actualRemain =  (seekEndsAt - timeNow) / oneSecond ;
         if (actualRemain>0) actualRemain++;
         remain_actual = secToStr(actualRemain);
         if (seekEndsAt < endsAt - 500) {
             
             if (seekEndsAt < endsAt - skip_granularity) {
                 //endsAt -= skip_granularity;
             }
             
             endsAt -= 25;
             clearRemainClass("adjustingDown");
             setRemainClass("adjusting") ;
             adjusting_delta = Number ( (endsAt -seekEndsAt) / oneSecond).toFixed(1);
             
             keyDisp.textContent = "speeding up to match actual time ("+remain_actual+")  "+adjusting_delta+" seconds offset";
             writeNumber("endsAt",endsAt);
             adjusting_up = true;
            
         } else {
              if (seekEndsAt > endsAt + 500) {
                  if (seekEndsAt > endsAt + skip_granularity) {
                      //endsAt += skip_granularity;
                  }
                  endsAt += 25;
                  clearRemainClass("adjusting");
                  setRemainClass("adjustingDown") ;
                  adjusting_delta = Number ( (endsAt -seekEndsAt) / oneSecond).toFixed(1)
                  keyDisp.textContent = "slowing down to match actual time ("+remain_actual+")  "+adjusting_delta+" seconds offset";
                  writeNumber("endsAt",endsAt);
                  adjusting_down = true;
              }  else {
                  endsAt = seekEndsAt;
                  clearRemainClass("adjusting") ;
                  clearRemainClass("adjustingDown") ;
                  remain_actual = undefined;
                  keyDisp.textContent = tabCount === 1  ? "" : controllerCount > 1 ? "MULTIPLE CONTROLLERS TABS ARE OPEN. CLOSE ONE!" : pausedMsec === 0 ? "remote display active" : "countdown was paused at "+ local24HourTime (new Date(pausedAt));
                  writeNumber("endsAt",endsAt);
              }
         }
         
          
         let secondsRemain = ((endsAt - timeNow) + (pausedMsec)) / oneSecond;
         let timeText,elapsedText;
         
         
         if (pausedMsec!=0) {
             const pausedTimeStr = secToStr(pausedMsec / oneSecond);
             remainInfoDisp.textContent =  runMode === "presenter" ? "Paused" : pausedTimeStr;
             endsDisp.textContent =  local24HourTime ( new Date(seekEndsAt+pausedMsec) );
             const accumTimeStr = secToStr((pauseAcum+pausedMsec) / oneSecond);
             extraTimeDisp.textContent = "+ "+accumTimeStr+" pauses";
             pausing = true;
             if (server_conn && lastEndsAtText !== endsDisp.textContent) {
                lastEndsAtText = endsDisp.textContent;
                server_conn.send(JSON.stringify({
                    setVariableValues:{
                        adjusting_up,
                        adjusting_down,
                        adjusting_delta,
                        remain_actual: remain_actual,
                        endsAt:lastEndsAtText,
                        paused:pausedTimeStr,
                        pauses:accumTimeStr,
                        pausing}
                    }));
             }

            
             
         } else {
             remainInfoDisp.textContent = "";
             if (pauseAcum===0) {
                 extraTimeDisp.textContent = "";
             } else {
                 extraTimeDisp.textContent = "+ "+secToStr(pauseAcum / oneSecond)+" pauses";
             }
         }
         
         
         
        
         let elapsedMSec = (timeNow-startedAt) - (pausedMsec+pauseAcum);
         if (elapsedMSec < 0) {
             
            setHtmlClass("future");
            if (elapsedMSec > -60000) {
                setHtmlClass("impending");
            } else {
                clearHtmlClass("impending");
            }
            seekEndsAt = startedAt + thisDuration;
            bumpEnd(0,0);
            endsAt = seekEndsAt;
            elapsedText = secToStr((0-elapsedMSec) / oneSecond);
            elapsedDisp.textContent = elapsedText;
            timeText = secToStr(thisDuration/1000);
            localStorage.setItem("elapsedDisp",elapsedText);
                
             
            
         } else {
             
            clearHtmlClass("future");
            if (secondsRemain >= 0 ) {
                  timeText =  secToStr(secondsRemain+1);
                 
            } else {
                  timeText =  secToStr((0-secondsRemain));
                
            }
            elapsedText =  secToStr(elapsedMSec / oneSecond);
                     
         }
         
         if (lastTimeText !== timeText) {
                 if (lastUpdateTick===0 || timeNow - lastUpdateTick > 750) {
                     lastUpdateTick = timeNow;
                     remainDisp.textContent = timeText;
                     elapsedDisp.textContent = elapsedText;
                     
                     
                     lastTimeText = timeText;
                     let expired = false;
                     let impending = false;
                   
                     if (secondsRemain >=  0 ) {
                         
                        clearHtmlClass("over");
                        
                        if (elapsedMSec >= 0) {
                            if (secondsRemain <= 60 ) {
                                setHtmlClass("impending");
                                impending=true;
                            } else {
                                clearHtmlClass("impending");                                
                            }
                        }
                        
                        setBar(elapsedMSec,thisDuration);
                     } else {
                        expired = true;
                        setHtmlClass("over");
                        clearHtmlClass("impending");    
                        setBarPct(100);
                     }
                     localStorage.setItem("remainDisp",timeText);
                     if (server_conn) {
                        server_conn.send(JSON.stringify({
                            setVariableValues:{
                                adjusting_up,
                                adjusting_down,
                                adjusting_delta,
                                remain_actual: remain_actual||timeText,
                                expired,impending,pausing,
                                remain:timeText,
                                elapsed:elapsedText}}));
                     }

                  }
         }
         localStorage.setItem("remainDispClass",html.className);
         
      } else {
          keyDisp.textContent = tabCount+" tabs open";
      }
       nowDisp.textContent = timeNowStr();
  }
  
  function updateEnteredTimeText () {
         if (enterHoursText === "") {
            dispNextMins.textContent = secToStr(Number(enterTimeText) * 60);
         } else {
            dispNextMins.textContent = secToStr((Number(enterHoursText) * 3600) + (Number(enterTimeText) * 60)); 
         } 
  }


 function replaceStylesheet(el,cb) {
     
     let src = el.href;
     var xhr = new XMLHttpRequest(),
         css = '';//Empty string variable intended for the XMLHttpRequest response data...

        function processRequest(){
            if (xhr.readyState == 4){
                css = this.responseText;
                let editor,editorPre;
                let sheet = document.createElement('style');
                sheet.innerHTML = css;
                let storedCss = localStorage.getItem("custom_css");
                if (storedCss) {
                    sheet.innerHTML = storedCss;
                }
                document.body.appendChild(sheet);
                el.parentNode.removeChild(el);
                if (cb) {
                    cb(Object.defineProperties({},{
                        sheet : {value: sheet},
                        css : { 
                            set : function(newCss){
                                sheet.innerHTML = newCss;
                            },
                            get : function () {
                                return sheet.innerHTML;
                            }
                        },
                        reset : {value : function(){
                            sheet.innerHTML = css;
                            localStorage.removeItem("custom_css");
                        }},
                        editToggle : {
                            
                            value : function(){
                            if (editor) {
                                sheet.innerHTML = editor.getValue();
                                localStorage.setItem("custom_css",sheet.innerHTML);
                                editorPre.parentNode.removeChild(editorPre);
                                editor=undefined;
                            } else {
                                   let startEditor = function(){
                                      
                                      editorPre = document.createElement("pre");
                                      editorPre.id="css_editor";
                                      document.body.appendChild(editorPre);
                                      
                                      setTimeout(function(){
                                          editor = ace.edit("css_editor");
                                          editor.setTheme("ace/theme/chrome");
                                          editor.session.setMode("ace/mode/css");
                                          editor.setValue(sheet.innerHTML);
                                          editor.focus();                            
                                          editor.gotoLine(1);
                                      },10);
                                };
                                
                                if (aceScript) {
                                    
                                   
                                  let iv = setInterval(function(){
                                      if (window.ace) {
                                         clearInterval(iv);
                                         startEditor();
                                      }
                                  },100);
                                    
                                } else {
                                    
                                    aceScript = document.createElement("script");
                                    aceScript.setAttribute('integrity',"sha512-NSbvq6xPdfFIa2wwSh8vtsPL7AyYAYRAUWRDCqFH34kYIjQ4M7H2POiULf3CH11TRcq3Ww6FZDdLZ8msYhMxjg==");
                                    aceScript.setAttribute('crossorigin',"anonymous" );
                                    aceScript.setAttribute('referrerpolicy',"no-referrer");
                                    aceScript.setAttribute('src',"https://cdnjs.cloudflare.com/ajax/libs/ace/1.15.2/ace.js");
                                    document.body.appendChild(aceScript);
                                    
                                    let iv = setInterval(function(){
                                        if (window.ace) {
                                           clearInterval(iv);
                                           startEditor();
                                        }
                                    },100);
                                
                                }
                                
                            }       
                        }},
                        editing : {
                            get : function() {
                                return !!editor;
                            }
                        }
                    }));
                }
             }
        }

        xhr.responseType = 'text';
        xhr.open('GET', src);
        xhr.onreadystatechange = processRequest;
        xhr.send();

 }

  
  function restartTimer() {
    lastUpdateTick = 0;
    startedAt  = Date.now();  
    endsAt     = startedAt + defaultDuration;
    pausedAt=undefined;
    pauseAcum=0;
    thisDuration = defaultDuration;
    seekEndsAt = endsAt;
    startedDisp.textContent = local24HourTime ( new Date(startedAt) ); 
    endsDisp.textContent    =  local24HourTime ( new Date(endsAt) ); 
    durationDisp.textContent = secToStr(defaultDuration / 1000);
    extraTimeDisp.textContent = "";
    
    
    writeNumber("pausedAt",pausedAt);
    writeNumber("pauseAcum",pauseAcum);
    
    writeNumber("startedAt",startedAt);
    writeNumber("endsAt",endsAt);
    writeNumber("seekEndsAt",seekEndsAt);
    clearHtmlClass("countup-override");
    clearHtmlClass("paused");
    setBarPct(0);

    if (server_conn) {
        server_conn.send(JSON.stringify({
            setVariableValues:{
                startedAt:startedDisp.textContent,
                endsAt:endsDisp.textContent,
                default:durationDisp.textContent,
                paused:'0:00',
                pauses:'0:00',
                pausing:false,
                expired:false,
                showpresenter: html.classList.contains("reduced") ? '1' : '0',
                impending:defaultDuration<=60000}
            }));
      }
  }
  
  function setPresenterMode() {
      runMode = "presenter";
      html.classList.add("reduced");
      if (server_conn) {
        server_conn.send(JSON.stringify({setVariableValues:{showpresenter:  '1' }}));
    }
  }
  
  function setControllerMode() {
      runMode = "controller";
      html.classList.remove("reduced");
      if (server_conn) {
        server_conn.send(JSON.stringify({setVariableValues:{showpresenter:  '0' }}));
    }
  }
 
 



function extendDefaultToCurrentTimer() {
    lastUpdateTick = 0;
    endsAt = startedAt + defaultDuration;
    thisDuration = defaultDuration;
    seekEndsAt = endsAt;
    writeNumber("endsAt",endsAt);
    writeNumber("seekEndsAt",seekEndsAt);
    durationDisp.textContent = secToStr(defaultDuration / 1000);
    displayUpdate();
}


function onLocalStorage(ev){
     
     
     
     if (runMode==="presenter" && (ev.key==="showbar"  ||  ev.key.startsWith("remainDisp"))){
         
       remainDisp.textContent = localStorage.getItem("remainDisp");
       html.className  = localStorage.getItem("remainDispClass")+" reduced";
       if ( readNumber("showbar",0)===1) {
          setHtmlClass("showbar");
          setBarPct(Number(localStorage.getItem("barpct")));
       } else {
           clearHtmlClass("showbar");
       }      
     }  
      
     if (ev.key === "elapsedDisp"){
        elapsedDisp.textContent = localStorage.getItem("elapsedDisp");
     }
     
     if (ev.key==="showtimenow" ) {
     
         if ( readNumber("showtimenow",0) === 1 ) {
           setHtmlClass("showtimenow");
         } else {
           clearHtmlClass("showtimenow");
           
           
         } 

    }
    
      if (ev.key==="showmessages" ) {
     
         if ( readNumber("showmessages",0) === 1 ) {
           setHtmlClass("showmessages");
         } else {
           clearHtmlClass("showmessages");
         } 

      }
      
      if (ev.key==="custom_message") {
          let msg = localStorage.getItem("custom_message");
          custom_message.textContent=msg;
          if (msg==="") {
              clearHtmlClass("show_custom_message");
          } else {
              setHtmlClass("show_custom_message");
          }    
          
      }
      
      if (stylesheet1_obj && !stylesheet1_obj.editing && ev.key==="custom_css") {
          
            let storedCss = localStorage.getItem("custom_css");
            if (storedCss) {
                stylesheet1_obj.css = storedCss;
            } else {
                stylesheet1_obj.reset();
            }
            
      }
}

function getTabCount(cont) {
    let dead = [];
    let count=1,tickNow = Date.now(),oldest=tickNow - 3000;
   
    if (!cont) { 
        writeNumber (tab_id,tickNow);
        if (runMode==="controller") {
            writeNumber ("controller_"+tab_id,tickNow);
        } else {
           localStorage.removeItem ("controller_"+tab_id);
        }
    }
    
    for (let i=0; i< localStorage.length; i++) {
       let key = localStorage.key(i);
       if (key !== tab_id && key.startsWith("tab_")) {
            if (Number(localStorage.getItem(key)) < oldest ) {
               dead.push(key);
            } else {
                if (cont) {
                    if (readNumber ("controller_"+key,0)>0) {
                       count ++; 
                    } 
                } else {
                   count ++;
                }
            }           
          
       } else {
           
            if ( key.startsWith("controller_tab_")) {
                if (Number(localStorage.getItem(key)) < oldest ) {
                  dead.push(key);
                } 
            }
       } 
       
    }
    dead.forEach(function(key){
      localStorage.removeItem(key);
    });
    return count;
}

let custom_msg_timeout;

function onDocKeyDown(ev){
   
   if (html.classList.contains("edit_custom_message")) {
       
        if  ( ev.key === "Enter") {
               custom_message.contentEditable=false;
               html.classList.remove("edit_custom_message");
               if (custom_message.textContent==="custom message") {
                   html.classList.remove("show_custom_message");
                   localStorage.setItem("custom_message","");
                   
               } else {
                   html.classList.add("show_custom_message");
                   custom_msg_timeout = setTimeout(function(){
                       custom_msg_timeout = undefined;
                       localStorage.setItem("custom_message",custom_message.textContent);
                   },500);
               }
        }
       return;
   } else {
       if (html.classList.contains("show_custom_message")) {

            if  ( ev.key ==="c" || ev.key==="C") {
               html.classList.remove("edit_custom_message");
               html.classList.remove("show_custom_message");
               if (custom_msg_timeout) {
                   clearTimeout(custom_msg_timeout);
                   custom_msg_timeout = undefined;
               }
               localStorage.setItem("custom_message","");
                  return;
           
               
            }

       }
   }
   
   
   if (stylesheet1_obj && stylesheet1_obj.editing) {
       
       if ( (ev.key === "S" || ev.key === "s")  && ev.ctrlKey ) {
            ev.preventDefault();
            stylesheet1_obj.editToggle();
            if (ev.shiftKey) {
                stylesheet1_obj.reset();
            }
       }
       
       return;
       
   }
   
  let tabCount = getTabCount(),timeNow =  Date.now() ;
     
    let factor = controlling ? 60000 : 1000;
    
    let endDelta     =  controlling ? 60000 : 0;
    let seekEndDelta =  controlling ? 60000 : 1000;
    
    
    if (typeof ev.key === 'string' && ( ( ev.key >= 1 && ev.key <=9) || ev.key=== "0") ) {
       enterTimeText = enterTimeText + "" + ev.key;
       setHtmlClass("editing");
       updateEnteredTimeText () ;
    } else {
        
        switch ( ev.key ) {
            
            case "/"://numkeypad
            case '"':
                
                html.classList.toggle("paused");
                lastTimeText="";
                togglePIPMode.lastContent="";
                if (html.classList.contains("paused")) {
                    pausedAt = Date.now();
                    writeNumber("pausedAt",pausedAt);
                    endsAt = seekEndsAt;
                    const pauseAccumText = secToStr(pauseAcum / oneSecond);
                    extraTimeDisp.textContent = "+ "+pauseAccumText+" pauses";
                    if (server_conn) {
                        server_conn.send(JSON.stringify({
                            setVariableValues:{
                                default:secToStr(defaultDuration/1000),
                                pausing:true,
                                pauses:pauseAccumText,
                                paused:'0:00'}}));
                    }
                } else {
                    let pausedMsec = pausedAt ? timeNow-pausedAt : 0;
                    pausedAt = undefined;
                    seekEndsAt += pausedMsec;
                    pauseAcum += pausedMsec;
                    writeNumber("pausedAt",pausedAt);
                    writeNumber("pauseAcum",pauseAcum);

                    const pauseAccumText = secToStr(pauseAcum / oneSecond);
    
                    extraTimeDisp.textContent = "+ "+pauseAccumText+" pauses";
             
                    endsAt = seekEndsAt;
                    endsDisp.textContent = local24HourTime ( new Date(seekEndsAt) );
                    if (server_conn) {
                      server_conn.send(JSON.stringify({
                        setVariableValues:{
                            default:secToStr(defaultDuration/1000),
                            endsAt:endsDisp.textContent,
                            pausing:false,
                            pauses:pauseAccumText,
                            paused:'0:00'}}));
                    }
                    
                }
                
                
                
                break;
                
            case "Tab":  //numkeypad 
            case "'": 
                
                clearHtmlClass("paused");
                pausedAt = undefined;
                pauseAcum = 0;
                writeNumber("pausedAt",pausedAt);
                writeNumber("pauseAcum",pauseAcum);
                extraTimeDisp.textContent = "";
                
                seekEndsAt = startedAt + thisDuration;
                endsAt = seekEndsAt;
                endsDisp.textContent = local24HourTime( new Date(seekEndsAt) ) ;

                if (server_conn) {
                    server_conn.send(JSON.stringify({
                        setVariableValues:{
                            endsAt:endsDisp.textContent,
                            pauses:'0:00',
                            paused:'0:00'}}));
                }
                    
                break;
            
            case ".":
                 if ( (enterTimeText !== "") && (enterTimeText.indexOf(".") <0 ) ) {
                     
                     enterTimeText = enterTimeText + ev.key;
                     setHtmlClass("editing");
                     updateEnteredTimeText () ;
                     
                }
                break;
                
            case ":":
                if (enterHoursText === "") {
                    enterHoursText = enterTimeText;
                    enterTimeText  = "";
                    setHtmlClass("editing");
                    dispNextMins.textContent = secToStr((Number(enterHoursText) * 3600) + (Number(enterTimeText) * 60));
                }
                break;
            case "Backspace" :
                if (enterTimeText !== "" ) {
                    enterTimeText = enterTimeText.substr(0,enterTimeText.length-1);
                    updateEnteredTimeText () ;
                } else {
                    clearHtmlClass("editing");
                    dispNextMins.textContent = secToStr(defaultDuration/1000);
                    
                }
                break;
            case "Enter" : 
                
                if (controlling) {
                      lastUpdateTick = 0;
                      endsAt = seekEndsAt;
                      clearRemainClass("adjusting") ;
                      clearRemainClass("adjustingDown") ;
                      keyDisp.textContent = tabCount+" tabs open";
                      writeNumber("endsAt",endsAt);
                 } else {      
                    saveEditedTime();
                 }                
                
                break;
                
            //case "-":    
            case "ArrowDown" : {
                
                //if (controlling && ev.key==="-") break;
                
                if (!html.classList.contains("editing") ) {
                    if (shifting) {
                        bumpStart(factor);
                    } else {
                        bumpEnd(0-seekEndDelta,0-endDelta);
                    }
                    durationDisp.textContent = secToStr((seekEndsAt-startedAt) / 1000);
                    displayUpdate();
                } 
                else
                {
                       
                }
                break;
            }


            case "q":
            case "Q":
                if (controlling) {
                    if (is_nwjs()) {
                         require('nw.gui').App.quit();
                    }
                }

                break;
            
            //case "+":
            case "ArrowUp" : {
                 //if (controlling && ev.key==="+") break;
                 
                 if (!html.classList.contains("editing") ) {
                    if (shifting) {
                       bumpStart(0-factor);
                    } else {
                       bumpEnd(seekEndDelta,endDelta);
                    }
                    durationDisp.textContent = secToStr((seekEndsAt-startedAt) / 1000);
                    displayUpdate();
                 }
                 else {
                     
                 }
                break;
            }
            
            case "ArrowLeft": 
                bumpStart(0-factor);
                bumpEnd(0-seekEndDelta,0-endDelta);
                
                durationDisp.textContent = secToStr((seekEndsAt-startedAt) / 1000);
                displayUpdate();
            
            break; 
            case "ArrowRight": 
                bumpStart(factor);setHtmlClass
                bumpEnd(seekEndDelta,endDelta);
                
                durationDisp.textContent = secToStr((seekEndsAt-startedAt) / 1000);
                displayUpdate();
                
            break;
            case "Shift" : {
                shifting = true; 
                setHtmlClass("shifting");
                

                break;
            }
            
            case "Control" : 
                controlling = true; 
                setHtmlClass("controlling");
                break ;
              
            case "i":
            case "I":
                if (controlling && shifting) {
                  //  ev.preventDefault();
                }
                break;  
            case "F":
            case "f":  
                if (fs_api.isFullscreen()) {
                    fs_api.exitFullscreen();
                } else {
                     fs_api.enterFullscreen();  
                 } 
                  break;
                  
            case "b":
            case "B": {
                const toggledState = html.classList.contains("showbar") ? 0 : 1;
                html.classList.toggle("showbar");
                writeNumber("showbar",toggledState);
                
                break;
             }
            case "*":// numkey pad use
            case " ":
                const preserve_default = defaultDuration;
                
                 if (controlling) {
                      lastUpdateTick = 0;
                      endsAt = seekEndsAt;
                      clearRemainClass("adjusting") ;
                      clearRemainClass("adjustingDown") ;
                      keyDisp.textContent = tabCount+" tabs open";
                      lastTimeText="";
                      writeNumber("endsAt",endsAt);
                 } else {      
                    saveEditedTime();
                    
                    if (shifting)  
                       extendDefaultToCurrentTimer();
                    else
                       restartTimer();
                       
                    if (defaultDuration !== preserve_default) {
                        defaultDuration = preserve_default;
                        dispNextMins.textContent = secToStr(defaultDuration/1000);
                        clearHtmlClass("editing");
                        writeNumber("defaultDuration",defaultDuration);
                    }
                    
                 }
                break;
                
            case "m":
            case "M":
                html.classList.toggle("showmessages");
                writeNumber("showmessages",html.classList.contains("showmessages") ? 1 : 0);
                togglePIPMode.lastContent="";
                lastTimeText = "";
                break;
                
            case "t":
            case "T": {
                const toggledState = html.classList.contains("showtimenow") ? 0 : 1;
                html.classList.toggle("showtimenow");
                writeNumber("showtimenow",toggledState);
                break;
            }

            case "o":
            case "O":

                togglePIPMode();
                break;

            case "p":
            case "P":
                
                if (window.location.search !== "?presenter" &&  tabCount === 1) {
                    html.classList.toggle("reduced");
                    const isPres = html.classList.contains("reduced");
                    runMode = isPres ? "presenter":"controller";

                    if (server_conn) {
                        server_conn.send(JSON.stringify({setVariableValues:{showpresenter: isPres ? '1' : '0' }}));
                    }

                   
                    
        
            
                }
                html.classList[ html.classList.contains("reduced") ? "remove" : "add"]("showbuttons");
                break;

            case "s":
            case "S":
                
                if (ev.ctrlKey) {
                    if (stylesheet1_obj) {
                        if (ev.shiftKey) {
                            stylesheet1_obj.reset();
                            if (stylesheet1_obj.editing) {
                               stylesheet1_obj.editToggle();
                            }
                        } else {
                            stylesheet1_obj.editToggle();
                        }
                    }
                    ev.preventDefault();
                
                } else {
                
                    if (window.location.search !== "?presenter" &&  tabCount === 1) {
                        html.classList.add("reduced");
                        html.classList.add("showbuttons");
                        runMode = "presenter";
                        if (!fs_api.isFullscreen()) {
                          fs_api.enterFullscreen();  
                          }

                        if (server_conn) {
                            server_conn.send(JSON.stringify({setVariableValues:{showpresenter: '1' }}));
                        }
                    }
                }
                break;
                
            case "x":
            case "X": // extend current timer to default time
               extendDefaultToCurrentTimer();
                break;
                
            case "c":
            case "C":
                
                    
                html.classList.add("edit_custom_message");
                html.classList.remove("show_custom_message");
                custom_message.innerText="custom message";
                custom_message.contentEditable=true;
                custom_message.focus();
                ev.preventDefault();
                
                break;

            case "R":
            case "r":

                if (!controlling) {
                    ev.preventDefault();
                    if (!isSingleScreenMode() && !(runMode === "presenter" && tabCount===1)) {
                        openTimerWindow(tabCount>1);
                    }
                }
                break;

      
    }}
}


function isSingleScreenMode() {
    if ( window.location.search.startsWith("?presenter") )  {
        return false;
    }
    return html.classList.contains("reduced") && 
           html.classList.contains("showbuttons") &&
           runMode === "presenter";
}

    function saveEditedTime(){
        if ( !  (  (enterTimeText === "" ) || (enterTimeText === "" ) ) ) {
            defaultDuration = ((Number(enterHoursText) * 3600) + (Number(enterTimeText) * 60) ) * 1000;
            
            if (Date.now()-startedAt<0) { 
                // if editing a future start time
                thisDuration = defaultDuration;
            }
            enterTimeText  = "";
            enterHoursText = "";
            
            dispNextMins.textContent = secToStr(defaultDuration/1000);
            clearHtmlClass("editing");
            writeNumber("defaultDuration",defaultDuration);

            if (server_conn) {
                server_conn.send(JSON.stringify({setVariableValues:{default:dispNextMins.textContent}}));
            }

            
         }
    }
        
    function onDocKeyUp(ev){
          switch ( ev.key ) {
            case "Shift"   : 
                shifting = false; 
                clearHtmlClass("shifting");
                break ;
            case "Control" : 
                controlling = false; 
                clearHtmlClass("controlling");
                break ;
          }
    }


    function bumpStart(factor){
        startedAt += factor;   
        startedDisp.textContent = local24HourTime( new Date(startedAt) );
        writeNumber("startedAt",startedAt);
        lastTimeText="";
        if (server_conn) {
            server_conn.send(JSON.stringify({setVariableValues:{startedAt:startedDisp.textContent}}));
        }
    }
    
    function bumpEnd(seekEndDelta,endDelta) {
       seekEndsAt += seekEndDelta;
       endsAt     += endDelta;
       
       thisDuration = seekEndsAt-startedAt;
    
       endsDisp.textContent    = local24HourTime( new Date(seekEndsAt) );
       writeNumber("seekEndsAt",seekEndsAt);
       lastTimeText="";
       if (server_conn) {
        server_conn.send(JSON.stringify({setVariableValues:{endsAt:endsDisp.textContent}}));
       }
   }


    function setBarPct(pct) {
        progress.style.width  = pct + '%';
        localStorage.setItem("barpct",pct.toString());
    }
    
    function setBar(elapsed,total) {
        let pct = Math.floor((elapsed/total) *100);
        setBarPct(pct);
    }
       
  
  function readNumber(nm,def) {
      let str =  localStorage.getItem(nm);
      return str ? Number (str) : def;
  }
  
  function writeNumber(nm,val) {
      if (val===undefined) {
          localStorage.removeItem(nm);
      } else {
          localStorage.setItem(nm,val.toString());
      }

      if (server_conn && ["showtimenow","showmessages","showbar"].indexOf(nm)>=0) {
        const vars = {};
        vars[nm]=val.toString()||'0';
        server_conn.send(JSON.stringify({setVariableValues:vars})); 
      }
  }

  function secToStr(sec) {
      let prefix = sec < 0 ? "-" : "";
      if (sec<0) {
          sec=0-sec;
      }
      let min = Math.trunc(sec / 60 ) % 60;
      let hr  = Math.trunc(sec / 3600 );
      let sx  = Math.trunc(sec % 60);
      
     
      let sx_  = (sx < 10 ? "0" : "") + sx.toString();
      if (hr < 1 ) {
           let min_ = min.toString();
           return prefix + min_+":"+sx_;
      }
      let min_ = (min < 10 ? "0" : "") + min.toString();
      let hr_  = hr.toString();
      return prefix+hr_+":"+min_+":"+sx_;
  }

  function local24HourTime(dt) {
     const parts = dt.toString().split(':');
     parts[0] = parts[0].split(' ').pop();
     parts[2] = parts[2].split(' ')[0];
     return parts.join(':');
  }
  
  function timeNowStr() {
      let when = new Date();
      return local24HourTime(when);
  }
  
  function setRemainClass(cls) {
      if ( ! remainDisp.classList.contains(cls) )remainDisp.classList.add(cls);
  }

  function clearRemainClass(cls) {
      if ( remainDisp.classList.contains(cls) ) remainDisp.classList.remove(cls);
  }
  
  function toggleRemainClass(cls) {
       remainDisp.classList.toggle(cls);
  }


  function setHtmlClass(cls) {
      if ( ! html.classList.contains(cls) ) html.classList.add(cls);
  }

  function clearHtmlClass(cls) {
      if ( html.classList.contains(cls) ) html.classList.remove(cls);
  }
  
 
  function onTimerWinUnload(){
      localStorage.removeItem (timerWin.tab_id);
      timerWin=undefined;
  }
  
  function onControlUnload () {
     if (timerWin) {
        timerWin.close();
        timerWin = undefined;
     }
     localStorage.removeItem (tab_id);
     localStorage.removeItem ("controller_"+tab_id);
  }
  

  function is_nwjs(){
    try{
        return (typeof require('nw.gui') !== "undefined");
    } catch (e){
        return false;
    }
}

if (
    (runMode !== 'presenter') && 
    (location.protocol === 'http:' && !location.hostname.endsWith('.com')) &&
    (typeof openLongPollPoster === 'function') ) {
    restartLongPoll();
}


function restartLongPoll() {


     server_conn = openLongPollPoster( readNumber('lastLongPollId',0),function(message,lastId){    
       const {error,cmd,code} = message;
       processServerMessage(error,cmd,message,code);    
       writeNumber('lastLongPollId',server_conn.lastId);
     });

    // processServerMessage(undefined,'opened');    
}

function getTimerColors(){
    if (server_conn) {
        const msg =  {
            setTimerColors: {
    
            } 
        };
        let shouldSend=false;
        (msg.names||getCustomColorNames()).forEach(function(n){
            const color = getCustomColor(n);
            if (color) {
                msg.setTimerColors[n]=color;
                shouldSend=true;
            }
        });
        if (shouldSend) {
            server_conn.send(JSON.stringify(msg));
        }
    }
}

function processServerMessage(err,cmd,msg,code) {
    console.log(err,cmd,msg,code);
    switch (cmd) {
        case "keys": {
            msg.keys.forEach(function(key) {
                if (key.startsWith('~')) {
                    onDocKeyUp({key:key.substring(1),preventDefault: function (){}});
                } else {
                    onDocKeyDown({key:key,preventDefault: function (){}});
                }
               
            });
            break;
        }

        case "customMessage" : {


                   
            html.classList.remove("edit_custom_message");
            html.classList.remove("show_custom_message");
            custom_message.innerText = msg.text.trim();
            custom_message.contentEditable=false;
            

            if (custom_message.innerText.length>0) {
                html.classList.add("show_custom_message");                    
            }
            localStorage.setItem("custom_message",custom_message.innerText);
            break;
        }

        case "setTimerColor" : {

            const oldColor = setCustomColor(msg.name,msg.color);


            break;
        }

        case "setTimerColors" : {

            setCustomColors(msg.colors);
            
            break;
        }

        case "getTimerColor" : {
            if (server_conn&& msg.name) {
                const msg =  {
                    setTimerColors: {
            
                    } 
                };
                const color = getCustomColor(msg.name);
                if (color) {
                    msg.setTimerColors[msg.name]=color;
                    server_conn.send(JSON.stringify(msg));
                }
            }
            break;
        }

        case "getTimerColors" : {
            getTimerColors();
            
            break;
        }

     

        case "presenter" : {
            if (runMode !== "presenter") {
                location.replace("/?presenter");
            }
            break;
        }

        case "control" : {
            if (runMode === "presenter") {
                location.replace("/");
            }
            break;
        }

        case "opened": {
            if (server_conn) {
                console.log("sending startup values",dispNextMins.textContent);
                let pausedMsec = pausedAt ?  Date.now()-pausedAt : 0;
                 
                server_conn.send(JSON.stringify({setVariableValues:{
                    default:secToStr(defaultDuration/1000),
                    endsAt:endsDisp.textContent,
                    startedAt:startedDisp.textContent,
                    showtimenow:localStorage.getItem('showtimenow')||'0',
                    showbar:localStorage.getItem('showbar')||'0',
                    showmessages:localStorage.getItem('showmessages')||'0',
                    paused: secToStr(pausedMsec / 1000),
                    pauses: secToStr((pausedMsec+pauseAcum) / 1000),
                }}));
                lastTimeText="";
                togglePIPMode.lastContent = "";
                getTimerColors();
            }

            break;
        }
    }
} 

function setupPip(sourceId,targetId,width,height,font,fgQuery,htmlClass,toplineQry,toplinefont) {
    const target = document.getElementById(targetId);
    if (!target.requestPictureInPicture) return null;
    
    const content = document.getElementById(sourceId);
    const fgEl = fgQuery ? document.querySelector(fgQuery) : content;
    const topLineEl = toplineQry ? document.querySelector(toplineQry) : null;
    const bg = getInheritedBackgroundColor(fgEl);
    togglePictureInPicture.lastContent = "";
    const source = document.createElement('canvas');
    source.width = width;
    source.height = height;
    
    target.style.position = 'absolute';
    target.style.bottom=0;
    target.style.right=0;
    target.style.opacity=0;
    
    const ctx = source.getContext('2d');
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    anim();
  
    const stream = source.captureStream();
    target.srcObject = stream;
    
    togglePictureInPicture.enterPIP = enterPIP;
    togglePictureInPicture.exitPIP  = exitPIP;

    return togglePictureInPicture;
    
    function anim() {
        const str = content.textContent;
        if ( togglePictureInPicture.lastContent!==str) { 
            ctx.fillStyle = getInheritedBackgroundColor(fgEl);
            ctx.fillRect( 0, 0, source.width, source.height );
            ctx.fillStyle = getInheritedColor(fgEl);
            ctx.font = font;
            ctx.fillText( str, source.width / 2, source.height / 2 );
            if (topLineEl) {            
                ctx.font = toplinefont;
                const text = window.getComputedStyle(topLineEl,':before')['content'];
                if (text !== 'none') {            
                    ctx.fillText( text.replace(/^\"|\"$/g,''), source.width / 2,32,source.width);
                }
            }
            togglePictureInPicture.lastContent = str;
        }
        requestAnimationFrame( anim );
    }
  
    function togglePictureInPicture() {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        html.classList.remove(htmlClass);
      } else if (document.pictureInPictureEnabled) {
        target.requestPictureInPicture();
        html.classList.add(htmlClass);
      }
    }
    
    function enterPIP() {
     if (document.pictureInPictureElement) {
        html.classList.add(htmlClass);
        return false;
      } else if (document.pictureInPictureEnabled) {
        target.requestPictureInPicture();
        html.classList.add(htmlClass);
        return true;
      }
    }
    
    function exitPIP() {
     if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
        html.classList.remove(htmlClass);
        return true;
      } else if (document.pictureInPictureEnabled) {
        html.classList.remove(htmlClass);
        return false;
      }
    }



  }


  function getInheritedBackgroundColor(el) {
    // get default style for current browser
    var defaultStyle = getDefaultBackground() // typically "rgba(0, 0, 0, 0)"
    
    // get computed color for el
    var backgroundColor = window.getComputedStyle(el).backgroundColor
    
    // if we got a real value, return it
    if (backgroundColor != defaultStyle) return backgroundColor
  
    // if we've reached the top parent el without getting an explicit color, return default
    if (!el.parentElement) return defaultStyle
    
    // otherwise, recurse and try again on parent element
    return getInheritedBackgroundColor(el.parentElement)
  }
  
  function getDefaultBackground() {
    // have to add to the document in order to use getComputedStyle
    var div = document.createElement("div")
    document.head.appendChild(div)
    var bg = window.getComputedStyle(div).backgroundColor
    document.head.removeChild(div)
    return bg
  }


  function getInheritedColor(el) {
    // get default style for current browser
    var defaultStyle = getDefaultColor() // typically "rgba(0, 0, 0, 0)"
    
    // get computed color for el
    var color = window.getComputedStyle(el).color
    
    // if we got a real value, return it
    if (color != defaultStyle) return color
  
    // if we've reached the top parent el without getting an explicit color, return default
    if (!el.parentElement) return defaultStyle
    
    // otherwise, recurse and try again on parent element
    return getInheritedColor(el.parentElement);
  }
  
  function getDefaultColor() {
    // have to add to the document in order to use getComputedStyle
    var div = document.createElement("div")
    document.head.appendChild(div)
    var bg = window.getComputedStyle(div).color
    document.head.removeChild(div)
    return bg
  }


  function getCustomColor(name) {
    return window.getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`);
  }

  function setCustomColor(name,newColor,notify) {
   
     let shouldSend = false;

     const current =  getCustomColor(name);
     if (current==='') return null;
     if (current===newColor) return false;
     document.documentElement.style.setProperty(`--color-${name}`, newColor);

    if (notify!==false && server_conn) {
        const msg = {
            setTimerColors: {
    
            } 
        };

        msg.setTimerColors[name] = newColor;
        server_conn.send(JSON.stringify(msg));
    }

     return current;
  }

  function getCustomColorNames() {
    return Array.from(document.styleSheets)
    .filter(
      sheet =>
        sheet.href === null || sheet.href.startsWith(window.location.origin)
    )
    .reduce(
      (acc, sheet) =>
        (acc = [
          ...acc,
          ...Array.from(sheet.cssRules).reduce(
            (def, rule) =>
              (def =
                rule.selectorText === ":root"
                  ? [
                      ...def,
                      ...Array.from(rule.style).filter(name =>
                        name.startsWith("--")
                      )
                    ]
                  : def),
            []
          )
        ]),
      []
    ).map(function(n){
        return n.replace(/^--color-/,'');
    });
  }

  function getCustomColors (names) {
    const result = {};
    (names||getCustomColorNames()).forEach(function(n){
        result[n]=getCustomColor(n);
    });
    return result;
  }

  function setCustomColors(colors,notify) {
    const changed = {};
    const msg = notify!==false && server_conn ? {
        setTimerColors: {

        } 
    }: false;
    let shouldSend = false;
    Object.keys(colors).forEach(function(n){
        const newColor = colors[n];
        const was =  setCustomColor(n,newColor,false);
        if (was) {
            changed[n]=was;
            if (msg) {
                msg.setTimerColors[n] = newColor;
                shouldSend=true;
            }
        }
    });

    if (shouldSend) {
        server_conn.send(JSON.stringify(msg));
     }

    return changed;
  }