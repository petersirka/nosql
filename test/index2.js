var fs = require('fs');
var filename = '/users/petersirka/desktop/test/test.nosql';

var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');


setTimeout(function() {
	db.views.create('test', function(doc) {
		if (doc.index > 10 && doc.index < 1000)
			return doc;
	}, function(a,b) {
		if (a.index > b.index)
			return 1;
		return -1;
	}, function(count) {
		console.log(count);
	}, 'create view');

}, 1000);

setTimeout(function() {

for (var i = 0; i < 10000; i++)
	db.insert({ index: i }, i.toString());

}, 2000);

setTimeout(function() {

db.views.all('test', function(selected, count) {
	console.log(selected, count);
}, function(f) {
	if (f.index > 10 && f.index < 20) {		
		f.kokotar = true;
		return f;
	}
});

}, 3000);