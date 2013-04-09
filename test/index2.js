var fs = require('fs');
var filename = '/users/petersirka/desktop/test';

var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

/*
for (var i = 0; i < 100000; i++)
	db.insert({ index: i });
*/
/*
setTimeout(function() {
	db.view.create('test', 'doc.index > 10 && doc.index < 50000', function(a,b) {
		if (a.index > b.index)
			return 1;
		return -1;
	}, function(count) {
		console.log(count);
	});

}, 1000);*/

db.view.all('test', function(selected, count) {
	console.log(selected, count);
}, 50, 10);
