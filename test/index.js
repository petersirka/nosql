var fs = require('fs');
var filename = '/users/petersirka/desktop/test.nosql';
var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

var write = true;
var read = true;
var remove = false;

var indexComplete = 0;
var indexInsert = 0;

db.on('insert', function(count) {
	console.log('insert ---> ', count);
});

db.on('error', function(err, name) {
	console.log('error ---> ', err, name);
});

db.on('pause', function() {
	console.log('PAUSE');
	setTimeout(function() {
		db.resume();
	}, 4000);
});

db.on('resume', function() {
	console.log('RESUME');
});

db.on('each', function() {
	console.log('each ---> ');
});

db.on('complete', function(status) {
	console.log('complete --> ', status);
});

if (write) {
	if (fs.existsSync(filename))
		fs.unlinkSync(filename);

	for (var i = 0; i < 100000; i++)
		db.insert({ index: i });
}

if (read) {
	setTimeout(function() {

		db.pause();
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
				console.log(o);
		});

	}, 500);
}

db.one('doc.index === 89080', function(doc) {
	console.log(doc);
});

/*
setTimeout(function() {
	db.update(function(o) {
		if (o.index > 10 && o.index < 20)
			o.index = 10000;
		return o;
	});
}, 2000);*/

setTimeout(function() {
	db.scalar(null, function(count) {
		console.log('scalar -––> ', count);
	});
}, 1500);

if (remove) {
	setTimeout(function() {
		db.remove('doc.index > 105', function(count) {
			console.log('remove ---> ', count);
		});
	}, 5000);
}