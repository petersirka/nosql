[![NoSQL embedded database](http://partialjs.com/exports/nosql-logo.png)](https://github.com/petersirka/nosql)

node.js NoSQL embedded database
===============================

* Written in JavaScript
* Small and effective embedded database
* Data are saved to one file as text file
* Easy editing in e.g. notepad
* Quick, simple, effective
* Easy filtering of documents
* Asynchronous insert, read, update, remove, drop
* Supports Views
* __No dependencies__
* [Documentation](http://www.partialjs.com/documentation/nosql/)


## Installation

```
$ sudo npm install -g nosql

// or

$ npm install nosql
```

## node.js

```js

var nosql = require('nosql').load('/users/petersirka/desktop/database');

// INSERT DOCUMENT
// nosql.insert(doc, fnCallback);
// ============================================================================

var callback = function(doc, count) {
	// optional
};

nosql.insert({ firstName: 'Peter', lastName: 'Širka', age: 28 }, callback);
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
// nosql.update(fnUpdate, fnCallback);
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
// nosql.prepare(fnUpdate, fnCallback);
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
// nosql.remove(fnFilter, fnCallback);
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
// nosql.view.create(name, fnFilter, fnSort, fnCallback, [fnUpdate]);
// nosql.view.drop(name, fnCallback);
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
	
	// view was created (database create new view file young.nosql-view with filtered and sorted documents)

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

// OTHERS
// ============================================================================


// Pause or Resume database operations
nosql.pause();
nosql.resume();

// Drop database
// nosql.drop(fnCallback);

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
nosql.on('complete', function(old_status) {});
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

function addUser() {
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
// How to count documents?
// ============================================================================

nosql.count('user.age > 10 && user.age < 30', function(count) {
	console.log('Count of users between 10 and 30 years old:', count);
});

// ============================================================================
// How to pagination documents?
// ============================================================================

// TIP: create a view

var userSkip = 10;
var userTake = 30;

nosql.view.all('users', function(users, count) {	
	
	console.log(users);
	console.log('From total:', count);

	// in the first page you know to calculate, how many pages of documents are in database
	var pages = count / userTake;

	if (pages % userTake !== 0)
		pages++;

	console.log('Total pages: ', pages);

}, userSkip, userTake);

// or filtering in view

nosql.view.all('users function(users, count) {	
	console.log(users);
	console.log('From total:', count);
}, userSkip, userTake, 'user.age > 10 && user.age < 30');

// Without view:

nosql.all('user.age > 10 && user.age < 30', function(users) {	
	console.log(users);
}, userSkip, userTake);

// Without view (sorted):

nosql.sort('user.age > 10 && user.age < 30', function(a, b) {
	if (a.age < b.age)
		return -1;
	return 1;
} function(users, count) {	
	console.log(users);
	console.log('From total:', count);
}, userSkip, userTake);


// View benefits:
// - in callback are params: sorted array and total count of documents in view
// - view is readonly

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
