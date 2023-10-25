
if (window.name!=="timer_control_boot") {
    window.name = "timer_control_boot";
    location.replace(location.href);
} else {
    window.onclick = openTimerWindow;
    document.body.onkeydown = openTimerWindow;
}
function openTimerWindow() {
    window.open("timer.html", 'timer_control_window');
}
