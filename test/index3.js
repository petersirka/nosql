var fs = require('fs');
var filename = '/users/petersirka/desktop/test/aaa';
var directory = '/users/petersirka/desktop/test/binary/';
var nosql = require('../index');
var db = nosql.load(filename, directory, false);
var assert = require('assert');

fs.readFile('/users/petersirka/desktop/logo.jpg', function(err, data) {
	console.log(db.binary.insert('logo.jpg', 'image/jpg', data, 'IMPORT LOGO'));
});