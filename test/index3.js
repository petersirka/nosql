var fs = require('fs');
var filename = '/users/petersirka/desktop/test/aaa';
var directory = '/users/petersirka/desktop/test/binary/';
var nosql = require('../index');
var db = nosql.load(filename, directory, true);
var assert = require('assert');

fs.readFile('/users/petersirka/desktop/logo.jpg', function(err, data) {
	//console.log(db.binary.insert('logo.jpg', 'image/jpg', data, 'IMPORT LOGO'));
	console.log(db.binary.update('aaa#1383983838218nhxjq0k9', '1395253_4947897474548_1323418430_n.jpg', 'image/jpg', data, 'IMPORT LOGO'));
});