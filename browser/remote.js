
if (window.name!=="remote_timer_boot") {
    window.name = "remote_timer_boot";
    location.replace(location.href);
} else {
    window.onclick = openTimerWindow;
    document.body.onkeydown = openTimerWindow;
}

function openTimerWindow() {
    open("timer.html?presenter", 'remote_timer_window', "location=0");
}
