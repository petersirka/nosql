var fs = require('fs');
var filename = '/users/petersirka/desktop/test.nosql';
var filenameview = '/users/petersirka/desktop/test-view.nosql';
var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

if (fs.existsSync(filename))
	fs.unlinkSync(filename);

for (var i = 0; i < 100000; i++)
	db.insert({ index: i });

setTimeout(function() {

	db.view(filenameview, 'doc.index > 10 && doc.index < 20', function(a,b) {
		if (a.index > b.index)
			return 1;
		return -1;
	}, function(filename, count) {
		console.log(filename, count);
	});

}, 1000);