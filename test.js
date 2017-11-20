var spi = require('spi-device');
var max7219 = spi.open(0, 0, function (err) {
	console.log(err);
	var message = [{
		sendBuffer: new Buffer([0x00, 0x00, 0x00, 0x00,
					0x00, 0x00, 0x00, 0x00]),
		receiveBuffer: new Buffer(3),
		byteLength: 3,
		speedHz: 20000
	}]
	max7219.transfer(message, function(err, message){
		if(err) throw err;
	});
})
