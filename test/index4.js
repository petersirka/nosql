var fs = require('fs');
var filename = '/users/petersirka/desktop/aaa';
var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

var write = true;
var read = true;
var remove = true;

var indexComplete = 0;
var indexInsert = 0;

db.on('insert', function(count) {
	console.log('insert ---> ', count);
});

db.on('error', function(err, name) {
	console.log('error ---> ', err, name);
});

db.on('drop', function(a) {
	console.log('DROP', a);
});

db.on('update/remove', function(beg, countUpdate, countDelete) {
	console.log('update/remove ---> ', beg, countUpdate, countDelete);
});

db.on('update', function(doc) {
	console.log('THIS UPDATED', doc);
});

db.on('resume', function() {
	console.log('RESUME');
});

db.on('each', function(status) {
	console.log('each ---> ', status);
});

db.on('complete', function(status) {
	console.log('complete --> ', status);
});

db.on('change', function(description) {
	console.log('change --> ', description);
});


if (fs.existsSync(filename + '.nosql'))
	fs.unlinkSync(filename + '.nosql');

for (var i = 0; i < 100000; i++)
	db.insert({ index: i });

db.insert({ index: 100001 }, 'super');


setTimeout(function() {
	db.remove(function(item) {
		return true;
	}, function(count) {
		console.log('REMOVED:', count);
	}, 'remove doc.index > 105');
}, 4000);
