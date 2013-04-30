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

if (write) {

	if (fs.existsSync(filename + '.nosql'))
		fs.unlinkSync(filename + '.nosql');

	for (var i = 0; i < 100000; i++)
		db.insert({ index: i });

	db.insert({ index: 100001 }, 'super');
}

if (read) {
	setTimeout(function() {

		db.read('doc.index > 0 && doc.index < 5', function(selected) {
			
			var str = '';
			
			selected.sort(function(a,b) {
				if (a.index < b.index)
					return -1;
				return 1;
			});

			selected.forEach(function(o) {
				str += o.index + '';
			});

			assert.ok(str === '234', 'read');

			console.log(selected);			
		}, 1, 3);

		db.read('doc.index > 100 && doc.index < 105', function(selected) {
			console.log(selected);
		}, 1, 3);

		db.each(function(o) {
			if (o.index === 4300)
				console.log('>>> ', o);
		});

	}, 500);
}


db.one('doc.index === 89080', function(doc) {
	console.log(doc);
});

setTimeout(function() {
	db.top(5, 'doc.index < 15', function(selected) {
		console.log('TOP', selected);
	});
}, 500);

setTimeout(function() {
	
	db.update(function(o) {
		
		if (o.index > 10 && o.index < 20)
			o.index = 10000;
		
		return o;
	}, function() {
		console.log('UPDATED');
	}, 'Index > 10 && Index < 20');

}, 5000);

/*
setTimeout(function() {
	db.drop(function() {
		console.log('DROPPED');
	});
}, 7000);
*/

setTimeout(function() {
	db.count(null, function(count) {
		console.log('count');
	});
}, 2000);


if (remove) {
	setTimeout(function() {
		db.remove('doc.index > 105', function() {
			console.log('remove');
		}, 'remove doc.index > 105');
	}, 4000);
}

setTimeout(function() {

	console.log('');
	console.log('CHANGELOG:');
	console.log('');
	db.changelog.read(function(lines) {
		console.log(lines);
	});

	db.clear(function() {
		console.log('clear');
		db.insert({r: true});
	}, 'clear');

}, 7000);