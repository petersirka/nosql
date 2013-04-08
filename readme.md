node.js NoSQL embedded database
===============================

* written in JavaScript
* data are saved to one file as text file
* easy editing in e.g. notepad
* quick, simple, effective
* insert, update, read, remove
* easy filtering documents
* asynchronous write & read
* __no dependencies__

## Installation

```
$ sudo npm install -g nosql

// or

$ npm install nosql
```

## node.js

```js

var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

// INSERT
// nosql.insert(doc, fnCallback);
// ============================================================================

var callback = function(err, doc) {
	// optional
};

nosql.insert({ firstName: 'Peter', lastName: 'Širka', age: 28 }, callback);
nosql.insert({ firstName: 'Fero', lastName: 'Samo', age: 40 }, callback);
nosql.insert({ firstName: 'Juraj', lastName: 'Hundo', age: 28 }, callback);

// UPDATE
// nosql.update(fnUpdate, fnCallback);
// ============================================================================

nosql.update(function(doc) {
	
	if (doc.name === 'Peter')
		doc.name = 'Jano';

	return doc;
});

// BULK INSERT
// nosql.bulk(array, fnCallback);
// ============================================================================

var callback = function(err, count) {
	console.log('INSERTED: ' + count);
};

nosql.bulk([{ firstName: 'Peter', lastName: 'Širka', age: 28 }, { firstName: 'Fero', lastName: 'Samo', age: 40 }, { firstName: 'Juraj', lastName: 'Hundo', age: 28 }], callback);

// READ DATA
// nosql.all(fnFilter, fnCallback, itemSkip, itemTake);
// nosql.one(fnFilter, fnCallback);
// nosql.top(max, fnFilter, fnCallback);
// nosql.each(fnCallback);
// ============================================================================

var callback = function(err, selected) {
	
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
nosql.one(filter, function(err, doc) {});
nosql.top(5, filter, callback);
nosql.each(function(err, doc, offset) {});

// FILTER can be a string
// eval is bad, but sometimes is very helpful
// ============================================================================
nosql.all('doc.age > 24 && doc.age < 36');

// REMOVE
// nosql.remove(fnFilter, fnCallback);
// ============================================================================

var callback = function(err, count) {
	console.log('Removed ' + count + ' documents');
});

var filter = function(doc) {
	return doc.age > 24 && doc.age < 36;
};

nosql.remove(filter, callback);

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