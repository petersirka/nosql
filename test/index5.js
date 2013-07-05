var filename = '/users/petersirka/desktop/aaa.nosql';
var nosql = require('../index');
var db = nosql.load(filename);

// db.insert({ name: 'Peter' });
/*
db.stored.create('rename', function(nosql, next) {
	
	nosql.all(function(selected) {
		console.log(selected);
	});

	next('NOOOO');
});
*/

//db.stored.clear();
db.stored.execute('rename', function(a) {
	console.log(a);
});