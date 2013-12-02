var filename = '/users/petersirka/desktop/test/aaa.nosql';
var nosql = require('../index');
var db = nosql.load(filename);

// db.insert({ name: 'Peter' });
/*
db.stored.create('rename', function(nosql, next, params) {
	
	nosql.all(function(selected) {
		console.log(selected);
	});

	console.log('params', params);
});
*/
//db.stored.remove('rename');

//db.stored.clear();

/*
db.stored.execute('rename', { str: 'TEST' }, function(a) {
	console.log(a);
});
*/
/*
db.views.create('test', function(doc) {
	return doc.firstname;
});

db.stored.create('OK', function(nosql, next, params) {
	console.log('OK');
	next();
});
*/
db.on('ready', function() {
	console.log('OK');
});