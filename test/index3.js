var fs = require('fs');
var filename = '/users/petersirka/desktop/aaa';
var directory = '/users/petersirka/desktop/binary/';
var nosql = require('../index');
var db = nosql.load(filename, directory, false);
var assert = require('assert');

fs.readFile('/users/petersirka/desktop/logo.png', function(err, data) {
	console.log(db.binary.insert('logo.png', 'image/png', data, 'IMPORT LOGO'));
});