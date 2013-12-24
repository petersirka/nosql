var fs = require('fs');
var filename = '/users/petersirka/desktop/test/aaa';
var directory = '/users/petersirka/desktop/test/binary/';
var nosql = require('../index');
var db = nosql.load(filename, directory, true);
var assert = require('assert');

fs.readFile('/users/petersirka/desktop/4dc8ba185cf9b8cc332bb7318be73fc5.jpeg', function(err, data) {
	//console.log(db.binary.insert('4dc8ba185cf9b8cc332bb7318be73fc5.jpeg', 'image/jpg', data, 'IMPORT PHOTO'));
	//console.log(db.binary.update('1383983838218nhxjq0k9', 'levik-anna-maria.jpg', 'image/jpg', data, 'IMPORT PHOTO'));
});