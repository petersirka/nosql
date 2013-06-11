var fs = require('fs');
var filename = '/users/petersirka/desktop/test.nosql';

var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

for (var i = 0; i < 10000; i++)
	db.insert({ index: i }, i.toString());

setTimeout(function() {
	db.view.create('test', 'doc.index > 10 && doc.index < 1000', function(a,b) {
		if (a.index > b.index)
			return 1;
		return -1;
	}, function(count) {
		console.log(count);
	}, 'create view');

}, 1000);

setTimeout(function() {

db.view.all('test', function(selected, count) {
	console.log(selected, count);
}, function(f) {
	return f.index > 10 && f.index < 20;
});

}, 2000);