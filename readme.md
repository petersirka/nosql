[![NoSQL embedded database](http://partialjs.com/exports/nosql-logo.png)](https://github.com/petersirka/nosql)

node.js NoSQL embedded database
===============================

* __NEW:__ Supports stored functions
* __NEW:__ Supports changelog (insert, update, remove, drop, create)
* __NEW:__ Supports Binary files (insert, read, remove)
* Written in JavaScript
* Small and effective embedded database
* Implements small concurrency model
* Data are saved to one file as text file
* Easy editing in e.g. notepad
* Quick, simple, effective
* Easy filtering of documents
* Asynchronous insert, read, update, remove, drop, count, clear
* Supports Views
* __No dependencies__
* [Documentation](http://www.partialjs.com/documentation/nosql/)
* [News on Twitter - @partialjs](https://twitter.com/partialjs)
* [E-shop via NoSQL embedded database](http://eshop.partialjs.com)
* [Blog via NoSQL embedded database](http://blog.partialjs.com/)
* Implemented in [partial.js / web application framework](http://www.partialjs.com)

## Installation

```
$ sudo npm install -g nosql

// or

$ npm install nosql
```

## NEW: STORED FUNCTIONS

> version +1.0.3-0

```js
var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

// Create a new stored function
// nosql.stored.create(name, function, [callback], [changes]);
nosql.stored.create('counter', function(nosql, next, params) {
	
	// nosql === nosql embedded database object

	nosql.update(function(doc) {
		doc.counter = (doc.counter || 0) + 1;
		return doc;
	}, function() {
		// next calls callback function in nosql.stored.execute();
		next();
	});

}, 'insert new counter function');

// Remove a stored function
// nosql.stored.remove(name, [callback], [changes]);
nosql.stored.remove('counter');

// Remove all stored functions
// nosql.stored.clear([callback]);
nosql.stored.clear();

// Execute a stored function
// nosql.stored.execute(name, [params], [callback], [changes]);
nosql.stored.execute('counter', function() {
	console.log('counter DONE.');
});

// or

nosql.stored.execute('counter', { increment: 1 });

```

## NEW: CHANGELOG

```js
var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

nosql.insert({ name: 'Peter' }, 'insert new user');
nosql.update(..., 'update all users where age > 20');

nosql.binary.insert(..., 'new user photo');
```

###	Changelog: /users/petersirka/desktop/database.changes

```plain
2013-04-23 18:08:37 | insert new user
2013-04-23 19:12:21 | update all users where age > 20
2013-04-23 20:01:02 | new user photo
```

## node.js

```js

var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql', '/users/petersirka/desktop/binary-files-directory/');
// nosq.load(filename, [path-to-binary-directory]);

// INSERT DOCUMENT
// nosql.insert(doc, [fnCallback], [changes]);
// ============================================================================

var callback = function(count) {
	// optional
};

nosql.insert({ firstName: 'Peter', lastName: 'Širka', age: 28 }, callback, 'new registered user: Peter Širka');
nosql.insert({ firstName: 'Fero', lastName: 'Samo', age: 40 }, callback);
nosql.insert({ firstName: 'Juraj', lastName: 'Hundo', age: 28 }, callback);

// BULK INSERT DOCUMENTS
// nosql.insert(array, fnCallback);
// ============================================================================

var callback = function(count) {
	console.log('INSERTED: ' + count);
};

nosql.insert([{ firstName: 'Peter', lastName: 'Širka', age: 28 }, { firstName: 'Fero', lastName: 'Samo', age: 40 }, { firstName: 'Juraj', lastName: 'Hundo', age: 28 }], callback);

// UPDATE DOCUMENTS
// nosql.update(fnUpdate, [fnCallback], [changes]);
// ============================================================================

var callback = function(count) {
	// updated count	
};

nosql.update(function(doc) {
	
	if (doc.name === 'Peter')
		doc.name = 'Jano';

	// if return null or undefined - document will be removed
	// if return {Object}, document will be replaced

	return doc;
}, callback);

// MULTIPLE UPDATE DOCUMENTS
// nosql.prepare(fnUpdate, [fnCallback], [changes]);
// nosql.update();
// ============================================================================

nosql.prepare(function(doc) {
	if (doc.name === 'Peter')
		doc.name = 'Jano';
	return doc;
});

nosql.prepare(function(doc) {
	
	if (doc.index === 2320)
		doc.name = 'Peter';

	// if return null or undefined - document will be removed
	// if return {Object}, document will be replaced

	return doc;
});

nosql.update();

// READ DOCUMENTS
// nosql.all(fnFilter, fnCallback, [itemSkip], [itemTake]);
// nosql.one(fnFilter, fnCallback);
// nosql.top(max, fnFilter, fnCallback);
// nosql.each(fnCallback);
// ----------------------------------------------------------------------------
// IMPORTANT: SLOWLY AND RAM KILLER, USE VIEWS
// nosql.sort(fnFilter, fnSort, fnCallback, [itemSkip], [itemTake]);
// ============================================================================

var callback = function(selected) {
	
	var users = [];
	selected.forEach(function(o) {
		users.push(o.firstName + ' ' + o.lastName);
	});

	// how to sort?
	// use Array.sort() function

	console.log('Users between 25 and 35 years old: ' + users.join(', '));
});

var filter = function(doc) {
	return doc.age > 24 && doc.age < 36;
};

nosql.all(filter, callback);
nosql.one(filter, function(doc) {});
nosql.top(5, filter, callback);
nosql.each(function(doc, offset) {});

// FILTER can be a string
// eval is bad, but sometimes is very helpful
// ============================================================================
nosql.all('doc.age > 24 && doc.age < 36');

// REMOVE DOCUMENTS
// nosql.remove(fnFilter, [fnCallback], [changes]);
// ============================================================================

var callback = function(count) {
	// removed count
});

var filter = function(doc) {
	return doc.age > 24 && doc.age < 36;
};

nosql.remove(filter, callback);

// VIEWS
// nosql.view.all(name, fnCallback, [itemSkip], [itemTake], [fnFilter]);
// nosql.view.one(name, [fnFilter], fnCallback);
// nosql.view.top(name, top, fnCallback, [fnFilter]);
// nosql.view.create(name, fnFilter, fnSort, [fnCallback], [fnUpdate], [changes]);
// nosql.view.drop(name, [fnCallback], [changes]);
// ============================================================================

var filter = function(doc) {
	return doc.age > 20 && doc.age < 30;
};

var sort = function(a, b) {
	if (a.age > b.age)
		return 1;
	return -1;
};

nosql.view.all('young', function(documents, count) {
	// view file not created
	// documents === empty
}, 0, 10);

nosql.view.create('young', filter, sort, function(count) {	
	
	// view was created (database create new view file database#young.db with filtered and sorted documents)

	nosql.view.all('young', function(documents, count) {
		console.log(documents);
		console.log('From total ' + count + ' documents');
	}, 0, 10);

	nosql.view.top('young', 5, function(documents) {
		console.log(documents);
	});

	nosql.view.one('young', 'doc.age === 25', function(document) {
		console.log(document);
	});

});

// BINARY FILES
// nosql.binary.insert(name, contentType, buffer/base64, [callback], [chnages]); - return file ID
// nosql.binary.read(id, fnCallback);
// nosql.binary.remove(id, [fnCallback], [changes]);
// ============================================================================

fs.readFile('/users/petersirka/desktop/picture.jpg', function(err, data) {

	// sync function
	var id = nosql.binary.insert('picture.jpg', 'image/jpeg', data);

	console.log(id);

	// result: database#1365699379204dab2csor
	// nosql.binary.read(id, .......);

});

nosql.binary.read('database#1365699379204dab2csor', function(err, stream, header) {
	
	if (err)
		return;

	// header.name; - file name
	// header.size; - file size
	// header.type; - content type

	stream.pipe(fs.createWriteStream('/users/petersirka/dekstop/picture-database.jpg'));
	
	// or
	
	stream.pipe(httpResponse);
});

nosql.binary.remove('database#1365699379204dab2csor', function(isRemoved) {
	console.log(isRemoved === true);
});


// OTHERS
// ============================================================================

// Pause or Resume database operations
nosql.pause();
nosql.resume();

// Drop database
// nosql.drop([fnCallback]);

// Clear / Truncate database
// nosql.clear([fnCallback]);

// EVENTS
// ============================================================================

nosql.on('error', function(err, source) {});
nosql.on('pause/resume', function(pause) {});
nosql.on('insert', function(begin, count) {});
nosql.on('update/remove', function(countUpdate, countRemove) {});
nosql.on('all', function(begin, count) {});
nosql.on('one', function(begin, count) {});
nosql.on('top', function(begin, count) {});
nosql.on('each', function(begin, count) {});
nosql.on('view', function(begin, name, count) {});
nosql.on('view/create', function(begin, name, count) {});
nosql.on('view/drop', function(begin, name) {});
nosql.on('clear', function(begin, success) {});
nosql.on('drop', function(begin, success) {});
nosql.on('complete', function(old_status) {});
nosql.on('change', function(description) {});
nosql.on('stored', function(name) {});
nosql.on('stored/load', function() {});
nosql.on('stored/clear', function() {});
nosql.on('stored/save', function(name) {});

```

## Changelog

> version +1.0.2-0

```js

// INSERT
nosql.changelog.insert('my change');
nosql.changelog.insert(['my change 1', 'my change 2', 'my change 3']);

// CLEAR CHANGELOG
nosql.changelog.clear([fnCallback]);

// READ CHANGELOG
nosql.changelog.read(function(lines) {
	console.log(lines.join('\n'));
});

```

## Tips

```js

// ============================================================================
// How to create live view?
// ============================================================================

function addUser() {
	// ...
	// ...
	nosql.insert(user, function() {

		// refresh view
		nosql.view.create('user', yourGlobalUser.filter, yourGlobalUser.sort);

	});
}

// ============================================================================
// How to summarize prices?
// ============================================================================

function sumarize() {
	// ...
	// ...

	var sum = 0;
	nosql.each(function(doc) {

		if (doc.type === 'product')
			sum += doc.price;

	}, function() {
		console.log('Price of all products:', sum);
	});
}

// ============================================================================
// How to get documents count?
// ============================================================================

nosql.count('user.age > 10 && user.age < 30', function(count) {
	console.log('Count of users between 10 and 30 years old:', count);
});

// ============================================================================
// How to paging documents?
// ============================================================================

// TIP: create a view

var userSkip = 10;
var userTake = 30;

nosql.view.all('users', function(users, count) {	
	
	console.log(users);

	var pageCount = count / userTake;

	if (pageCount % userTake !== 0)
		pageCount++;

	console.log('Total pages:', pageCount);
	console.log('Total users:', count);

}, userSkip, userTake);

// or filtering in view

nosql.view.all('users', function(users, count) {	
	console.log(users);
	console.log('Total users:', count);
}, userSkip, userTake, 'user.age > 10 && user.age < 30');

// Without view:

nosql.all('user.age > 10 && user.age < 30', function(users) {	
	console.log(users);
}, userSkip, userTake);

// Without view (sorted):
// SLOWLY AND RAM KILLER

nosql.sort('user.age > 10 && user.age < 30', function(a, b) {
	if (a.age < b.age)
		return -1;
	return 1;
} function(users, count) {	
	console.log(users);
	console.log('Total users:', count);
}, userSkip, userTake);

```

## The MIT License

Copyright (c) 2012-2013 Peter Širka <petersirka@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Recommend

[partial.js web application framework](https://github.com/petersirka/partial.js)

## Contact

[www.petersirka.sk](http://www.petersirka.sk)
