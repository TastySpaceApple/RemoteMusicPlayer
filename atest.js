var SPI = require('spi');
var spi = new SPI.Spi('/dev/spidev0.0', 
	{'mode': SPI.MODE['MODE_0'],
 	 'bitOrder': false });
spi.open();

var txbuf = new Buffer([ 0x0F, 0x01 ]);
var rxbuf = new Buffer([ 0x00, 0x00 ]);

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
//write([5 + 0x01, 0x7e])
setDigit(6, '2', 1);
module.exports = {init:init, setDigit:setDigit};
