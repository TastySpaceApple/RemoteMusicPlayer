var SPI = require('spi');
var spi = new SPI.Spi('/dev/spidev0.0',
	{'mode': SPI.MODE['MODE_0'],
 	 'bitOrder': false });
spi.open();

function write(buf){
  var txbuf = new Buffer(buf);
  var rxbuf = new Buffer([0x00, 0x00]);
  spi.transfer(txbuf, rxbuf, function(device, buf) {

  })
}

function init(){
  write([0xB, 7])
  write([0x9, 0])
  write([0xF, 0])
  write([0XC, 1])
}
var DIGITS = {
  '0': 0b01111110,
  '1': 0b00110000,
  '2': 0b01101101,
  '3': 0b01111001,
  '4': 0b00110011,
  '5': 0b01011011,
  '6': 0b01011111,
  '7': 0b01110000,
  '8': 0b01111111,
  '9': 0b01111011
}
function setDigit(position, digit, dot){
  if(!dot) dot = 0;
  if(typeof(digit) == 'string')
    digit = DIGITS[digit] || 0;
  digit = digit | dot << 7;
  console.log(digit)
  write([position + 0x01, digit])
}
function show(digits){
	for(var i=0; i<digits.length;i++){
		setDigit(i+1, buf[i]);
	}
}
function showNumber(number, show_decimal, fit){
	if(show_decimal == undefined) show_decimal = true;
	if(fit == undefined) fit = 8;
	var wholePart = Math.floor(number).toString();
	var fractionPart = (number - Math.floor(number));
	var lenWhole = wholePart.length;
	var lenFraction = fit - lenWhole;
	fractionPart = Math.floor(fractionPart * Math.pow(10, lenFraction))
	fractionPart = fractionPart == 0 ? '' : fractionPart.toString();
  for(var i=fit-1; i>=0; i--){
		if(i >= lenFraction)
			setDigit(i+1, wholePart[i - lenFraction], i === lenFraction && show_decimal)
		else
			setDigit(i+1, lenFraction[i - lenWhole]);
	}
}
var messageTimer = null;
function showMessage(message, fit){
	if(messageTimer != null) throw "Scrolling message already active";
	if(fit == undefined) fit = 8;
	message = message.split('');
	var buffer = [];
	for(var i=0; i<fit;i++){ buffer.push(0); message.push(''); }
	var indexInMessage = 0;
  function interval(){
		buffer.unshift(message[indexInMessage]).pop();
		show(buffer);
		if(++indexInMessage >= message.length){
			clearInterval(messageTimer);
			messageTimer = null;
		}
	}
	messageTimer = setInterval(interval, 1000);
}
showMessage('123456');
module.exports = {init: init,
	setDigit: setDigit,
	showMessage: showMessage,
	showNumber: showNumber
};
