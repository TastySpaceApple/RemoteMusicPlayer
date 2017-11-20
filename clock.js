var led = require('./led')
var blink = false;
function loop(){
  blink = !blink;
  led.showNumber(getHoursLeft(), blink);
}
function getHoursLeft(){
  var m = new Date(2080, 0, 1) - new Date();
  return m * 1000 * 3600;
}
setInterval(loop, 1000);
