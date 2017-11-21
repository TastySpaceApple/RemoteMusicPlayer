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
/****
Max7219 digit:
0b0ABCDEFG
  -- A --
|         |
F         B
|         |
  -- G --
|         |
E         C
|         |
  -- D --

DIGITS representations from AcidHub @ https://github.com/Acidhub/RPimax7219
*/
var DIGITS = {
	     '': 0x00,
			 ' ': 0x00,
			 '-': 0x01,
			 '_': 0x08,
			 '0': 0x7e,
			 '1': 0x30,
			 '2': 0x6d,
			 '3': 0x79,
			 '4': 0x33,
			 '5': 0x5b,
			 '6': 0x5f,
			 '7': 0x70,
			 '8': 0x7f,
			 '9': 0x7b,
			 'a': 0x7d,
			 'b': 0x1f,
			 'c': 0x0d,
			 'd': 0x3d,
			 'e': 0x6f,
			 'f': 0x47,
			 'g': 0x7b,
			 'h': 0x17,
			 'i': 0x10,
			 'j': 0x18,
			 // 'k': cant represent
			 'l': 0x06,
			 // 'm': cant represent
			 'n': 0x15,
			 'o': 0x1d,
			 'p': 0x67,
			 'q': 0x73,
			 'r': 0x05,
			 's': 0x5b,
			 't': 0x0f,
			 'u': 0x1c,
			 'v': 0x1c,
			 // 'w': cant represent
			 // 'x': cant represent
			 'y': 0x3b,
			 'z': 0x6d,
			 'A': 0x77,
			 'B': 0x7f,
			 'C': 0x4e,
			 'D': 0x7e,
			 'E': 0x4f,
			 'F': 0x47,
			 'G': 0x5e,
			 'H': 0x37,
			 'I': 0x30,
			 'J': 0x38,
			 // 'K': cant represent
			 'L': 0x0e,
			 // 'M': cant represent
			 'N': 0x76,
			 'O': 0x7e,
			 'P': 0x67,
			 'Q': 0x73,
			 'R': 0x46,
			 'S': 0x5b,
			 'T': 0x0f,
			 'U': 0x3e,
			 'V': 0x3e,
			 // 'W': cant represent
			 // 'X': cant represent
			 'Y': 0x3b,
			 'Z': 0x6d,
			 ',': 0x80,
			 '.': 0x80,
			 ':' : 0b00000110
	 }
function setDigit(position, digit, dot){
  if(!dot) dot = 0;
  if(typeof(digit) == 'string')
    digit = DIGITS[digit] || 0;
  digit = digit | dot << 7;
  write([position + 0x01, digit])
}
function show(digits){
	for(var i=0; i<digits.length;i++){
		setDigit(i, digits[i]);
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
  while(fractionPart.length < lenFraction) fractionPart = '0' + fractionPart;
  for(var i=lenWhole+lenFraction; i>=0; i--){
		if(i > lenFraction)
			setDigit(i-1, wholePart[lenWhole - (i - lenFraction)], i-1 === lenFraction && show_decimal)
		else
			setDigit(i-1, fractionPart[lenFraction- i]);
	}
}
var messageTimer = null;
var messageDone = function(){};
var messageCanceled = function(){};
function showMessage(message, speed, fit){
	//if(messageTimer != null) throw "Scrolling message already active";
	if(messageTimer != null) {messageCanceled(); clearInterval(messageTimer);}
	if(fit == undefined) fit = 8;
	message = message.replace(/w/g, 'uu')
	message = message.replace(/W/g, 'UU');
	message = message.replace(/M/g, 'NN');
	message = message.split('');
	var buffer = [];
	for(var i=0; i<fit;i++){ buffer.push(''); message.push(''); }
	var indexInMessage = 0;
  function interval(){
		buffer.pop();
		buffer.unshift(message[indexInMessage]);
		show(buffer);
		if(++indexInMessage >= message.length){
			clearInterval(messageTimer);
			messageDone();
			messageTimer = null;
		}
	}
	messageTimer = setInterval(interval, speed || 500);

	return new Promise(function(resolve, reject){
		messageDone = resolve;
		messageCanceled = reject;
	});
}
init();
show(['','','','','','','','']);
module.exports = {init: init,
	setDigit: setDigit,
	showMessage: showMessage,
	showNumber: showNumber
};
