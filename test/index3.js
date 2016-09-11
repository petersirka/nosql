var fs = require('fs');
var os = require('os');
var path = require('path');
var filename = path.join(os.tmpdir(), "test");
var directory = path.join(os.tmpdir(), "binary");
var nosql = require('../index');
var db = nosql.load(filename, directory, true);
var assert = require('assert');

//fs.readFile('/users/petersirka/desktop/4dc8ba185cf9b8cc332bb7318be73fc5.jpeg', function(err, data) {
	//console.log(db.binary.insert('4dc8ba185cf9b8cc332bb7318be73fc5.jpeg', 'image/jpg', data, 'IMPORT PHOTO'));
	// db.binary.read('1388069017562j2hdunmi', function(err, stream) {
		// stream.pipe(fs.createWriteStream('/users/petersirka/desktop/fotka.jpeg'));
	// });
	//console.log(db.binary.update('1383983838218nhxjq0k9', 'levik-anna-maria.jpg', 'image/jpg', data, 'IMPORT PHOTO'));
//});