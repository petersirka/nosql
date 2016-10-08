Node.js NoSQL embedded database
===============================

[![NPM version][npm-version-image]][npm-url] [![NPM quality][npm-quality]](http://packagequality.com/#?package=nosql) [![NPM downloads][npm-downloads-image]][npm-url] [![MIT License][license-image]][license-url]

---

__IMPORTANT__: the new version __v4.0__ has new methods than older version. The structure of database file __is same__.

---

* __NEW__: [Online NoSQL embedded database explorer](https://nosql.totaljs.com)
* [__Documentation__](https://docs.totaljs.com/latest/en.html#api~Database)
* Supports views
* Supports backuping with filtering
* Supports binary files
* Supports simple filtering
* [News on Twitter - @totalframework](https://twitter.com/totalframework)
* Uses [Total.js framework](http://www.totaljs.com)

## Installation

```
$ sudo npm install -g nosql

// or

$ npm install nosql
```

## Usage

- [NoSQL Documentation](https://docs.totaljs.com/latest/en.html#api~Database)

```javascript
var NoSQL = require('nosql');
var db = NoSQL.load('/path/to/datbase.nosql');

// db === Database instance <https://docs.totaljs.com/latest/en.html#api~Database>

db.find().make(function(fitler) {
	filter.where('age', '>', 20);
	filter.where('removed', false);
	filter.callback(function() {
		console.log(err, response);
	});
});
```


## Contributors

- Author: [Peter Širka](https://github.com/petersirka/)

## You must see it

[Total.js framework](https://github.com/totaljs/framework)

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat
[license-url]: license.txt

[npm-url]: https://npmjs.org/package/nosql
[npm-version-image]: https://img.shields.io/npm/v/nosql.svg?style=flat
[npm-downloads-image]: https://img.shields.io/npm/dm/nosql.svg?style=flat
[npm-quality]: http://npm.packagequality.com/shield/nosql.svg
