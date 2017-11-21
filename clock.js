var led = require('./led')
var blink = false;
var timer;
function loop(){
  blink = !blink;
  led.showNumber(getHoursLeft(), blink);
}
function getHoursLeft(){
  var m = new Date(2080, 0, 1) - new Date();
  return m / 1000 / 3600;
}
function start(){
  timer = setInterval(loop, 1000);
}
function pause(){
  clearInterval(timer);
}
module.exports = {
  start : start
  pause: pause
}
