// Copyright Peter Širka, Web Site Design s.r.o. (www.petersirka.sk)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// DB PRIORITY

// 1. insert
// 2. update/remove
// 3. each
// 4. read (all, top, one)

var fs = require('fs');
var path = require('path');
var events = require('events');
var encoding = 'utf8';

var STATUS_UNKNOWN = 0;
var STATUS_READING = 1;
var STATUS_WRITING = 2;
var STATUS_LOCKING = 3;
var STATUS_PENDING = 4;

var MAX_WRITESTREAM = 2;
var MAX_READSTREAM  = 4;

if (typeof(setImmediate) === 'undefined') {
	setImmediate = function(cb) {
		process.nextTick(cb);
	};
}

/*
	Database
	@filename {String}
*/
function Database(filename) {
	
	this.status_prev = STATUS_UNKNOWN;
	this.status = STATUS_UNKNOWN;
	this.current = '';

	this.countRead  = 0;
	this.countWrite = 0;

	this.pendingRead  = [];
	this.pendingEach  = [];
	this.pendingLock  = [];
	this.pendingDrop  = [];
	this.pendingWrite = [];

	this.isPending = false;

	this.filename = filename;
	this.filenameTemp = filename + 'tmp';
	this.directory = path.dirname(filename);
};

Database.prototype = new events.EventEmitter;

/*
	Write data to database
	@doc {Object}
	@fnCallback {Function} :: optional, params: @doc {Object}
	return {Database}
*/
Database.prototype.insert = function(doc, fnCallback) {
	var self = this;
	self.bulk([doc], fnCallback);
	return self;
};

/*
	Write bulk data to database
	@arr {Array of Object}
	@fnCallback {Function} :: optional, params: count {Number}
	return {Database}
*/
Database.prototype.bulk = function(arr, fnCallback) {
	var self = this;

	if (self.status === STATUS_LOCKING|| self.status === STATUS_PENDING || self.countWrite >= MAX_WRITESTREAM) {

		arr.forEach(function(o) {
			self.pendingWrite.push(o);
		});
				
		if (fnCallback)
			fnCallback(-1);

		return self;
	}

	var builder = [];

	arr.forEach(function(doc) {

		if (typeof(doc) !== 'string')
			doc = JSON.stringify(doc);

		builder.push(doc);
	});

	if (builder.length === 0) {
		self.next();
		return;
	}

	self.emit('insert', true, builder.length);

	self.status = STATUS_WRITING;
	self.countWrite++;

	fs.appendFile(self.filename, builder.join('\n') + '\n', { encoding: encoding }, function(err) {

		if (err)
			self.emit('error', err, 'insert-stream');

		self.countWrite--;
		self.next();
		
		self.emit('insert', false, builder.length);

		if (fnCallback)
			setImmediate(function() { fnCallback(doc); });

	});

	return self;
};

function onBuffer(buffer, fnItem, fnBuffer, fnCancel) {

	var index = buffer.indexOf('\n');
	
	if (index === -1) {
		fnBuffer(buffer);
		return;
	}

	var json = fnBuffer(buffer.substring(0, index));

	try
	{
		fnItem(null, JSON.parse(json), fnCancel, json);
	} catch (ex) {
		fnItem(ex, null, fnCancel, json);
	}

	onBuffer(buffer.substring(index + 1), fnItem, fnBuffer, fnCancel);
};

/*
	Read data from database
	@fnFilter {Function} :: params: @doc {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @selected {Array of Object}
	@itemSkip {Number} :: optional
	@itemTake {Number} :: optional
	@isScalar {Boolean} :: optional, default is false 
	return {Database}
*/
Database.prototype.read = function(fnFilter, fnCallback, itemSkip, itemTake, isScalar, name) {
	
	var self = this;
	var skip = itemSkip || 0;
	var take = itemTake || 0;

	if (self.status === STATUS_LOCKING || self.status === STATUS_PENDING || self.countRead >= MAX_READSTREAM) {
		
		self.pendingRead.push(function() {
			self.read(fnFilter, fnCallback, itemSkip, itemTake, isScalar);
		});

		return self;
	}

	var reader = fs.createReadStream(self.filename);

	if (typeof(fnCallback) === 'undefined') {		
		fnCallback = fnFilter;
		fnFilter = function() { return true; };
	}

	if (typeof(fnFilter) === 'string')
		fnFilter = eval('(function(doc){' + (fnFilter.indexOf('return ') === -1 ? 'return ' : '') + fnFilter + '})');

	if (fnFilter === null)
		fnFilter = function() { return true; };

	self.emit(name || 'read', true);

	// opened streams
	self.countRead++;
	self.status = STATUS_READING;

	var selected = [];
	var current = '';
	var count = 0;
	var isCanceled = false;

	var fnCancel = function() {
		isCanceled = true;
	};

	var fnBuffer = function(buffer) {
		current += buffer;
		return current;
	};

	var fnItem = function(err, doc, cancel) {

		if (isCanceled)
			return;

		// clear buffer;
		current = '';

		if (err || !fnFilter(doc))
			return;

		count++;

		if (skip > 0 && count <= skip)
			return;

		if (!isScalar)
			selected.push(doc);

		if (take > 0 && selected.length === take)
			cancel();
	};

	reader.on('data', function(buffer) {
		
		if (isCanceled)
			return;
		
		onBuffer(buffer.toString(), fnItem, fnBuffer, fnCancel);
	});

	reader.on('end', function() {
		self.countRead--;
		self.next();
		setImmediate(function() {
			self.emit(name || 'read', false);
			fnCallback(isScalar ? count : selected);
		});
	});

	reader.on('error', function(err) {
		self.emit('error', err, 'read-stream');
		self.countRead--;
		self.next();
		setImmediate(function() {
			self.emit(name || 'read', false);
			fnCallback(isScalar ? count : []);
		});
	});

	return self;
};

/*
	Read data from database
	@fnFilter {Function} :: must return {Boolean};
	@fnCallback {Function} :: params: @doc {Array of Object}
	@itemSkip {Number} :: optional, default 0
	@itemTake {Number} :: optional, default 0
	return {Database}
*/
Database.prototype.all = function(fnFilter, fnCallback, itemSkip, itemTake) {
	return this.read(fnFilter, fnCallback, itemSkip, itemTake, false, 'all');
};

/*
	Read data from database
	@fnFilter {Function} :: must return {Boolean};
	@fnCallback {Function} :: params: @doc {Object}
	return {Database}
*/
Database.prototype.one = function(fnFilter, fnCallback) {

	var cb = function(selected) {
		fnCallback(selected[0] || null);
	};

	return this.read(fnFilter, cb, 0, 1, false, 'one');
};

/*
	Read TOP data from database
	@fnFilter {Function} :: must return {Boolean};
	@fnCallback {Function} :: params: @doc {Object}
	return {Database}
*/
Database.prototype.top = function(max, fnFilter, fnCallback) {
	return this.read(fnFilter, fnCallback, 0, max, false, 'top');
};

/*
	Scalar
	@fnFilter {Function} :: params: @doc {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @count {Number}
	return {Database}
*/
Database.prototype.scalar = function(fnFilter, fnCallback) {
	return this.read(fnFilter, fnCallback, 0, 0, true, 'scalar');
};

/*
	Read data from database
	@fnDocument {Function} :: params: @doc {Object}, @offset {Number}
	@fnCallback {Function} :: optional
	return {Database}
*/
Database.prototype.each = function(fnDocument, fnCallback) {
	
	var self = this;

	if (self.status === STATUS_LOCKING || self.status === STATUS_PENDING || self.countRead >= MAX_READSTREAM) {

		if (fnDocument)
			self.pendingEach.push({ item: fnDocument, callback: fnCallback });

		return self;
	}

	var operation = [];

	if (fnDocument)
		operation.push({ item: fnDocument, callback: fnCallback });

	self.pendingEach.forEach(function(fn) {
		operation.push(fn);
	});

	if (operation.length === 0) {
		self.next();
		return self;
	}

	var reader = fs.createReadStream(self.filename);

	// opened streams
	self.countRead++;
	self.status = STATUS_READING;

	var current = '';
	var count = 0;

	self.pendingEach = [];

	var fnBuffer = function(buffer) {
		current += buffer;
		return current;
	};

	var fnItem = function(err, doc, cancel) {

		// clear buffer;
		current = '';

		if (err) {
			self.emit('error', err);
			return;
		}

		operation.forEach(function(fn) {
			try
			{
			
				fn.item(doc, count);
			
			} catch (e) {
				self.emit('error', e);
			}
		});

		count++;
	};

	self.emit('each', true);

	reader.on('data', function(buffer) {
		onBuffer(buffer.toString(), fnItem, fnBuffer);
	});

	reader.on('end', function() {
		self.countRead--;
		self.next();

		setImmediate(function() { 
			self.emit('each', false);
			operation.forEach(function(fn) {
				if (fn.callback)
					fn.callback();
			});
		});
	});

	reader.on('error', function(err) {

		self.emit('error', err, 'each-stream');
		self.emit('each', false);
		self.countRead--;
		self.next();

		setImmediate(function() { 
			operation.forEach(function(fn) {
				if (fn.callback)
					fn.callback();
			});
		});

	});

	return self;
};

/*
	Read and sort data from database
	@fnFilter {Function} :: return TRUE OR FALSE
	@fnSort {Function} :: for array.sort()
	@itemSkip {Number}
	@itemTake {Number}
	@fnCallback {Function} :: params: @doc {Object}, @count {Number}
	return {Database}
*/
Database.prototype.sort = function(fnFilter, fnSort, itemSkip, itemTake, fnCallback) {

	var self = this;
	var selected = [];
	var count = 0;

	if (typeof(fnFilter) === 'string')
		fnFilter = eval('(function(doc){' + (fnFilter.indexOf('return ') === -1 ? 'return ' : '') + fnFilter + '})');	

	itemTake = itemTake || 30;
	itemSkip = itemSkip || 0;

	var onCallback = function() {
		selected.sort(fnSort);

		if (itemSkip > 0 || itemTake > 0)
			selected = selected.slice(itemSkip, itemSkip + itemTake);

		fnCallback(selected, count);
	};

	var onItem = function(doc) {

		if (!fnFilter(doc))
			return;

		count++;
		selected.push(doc);
	};

	self.each(onItem, onCallback);
	return self;
};
.
/*
	Drop database
	@fnCallback {Function} :: params: @dropped {Boolean}
	return {Database}
*/
Database.prototype.drop = function(fnCallback) {

	var self = this;

	if (typeof(fnCallback) === 'undefined')
		fnCallback = null;

	self.pendingDrop.push(fnCallback);

	if (self.status !== STATUS_UNKNOWN)
		return self;

	self.status = STATUS_LOCKING;

	var operation = [];
	
	self.pendingDrop.forEach(function(o) {
		if (o !== null)
			operation.push(o);
	});

	self.emit('drop', true, false);
	self.pendingDrop = [];

	fs.exists(self.filename, function(exists) {

		if (!exists) {
			
			self.next();

			setImmediate(function() { 
				self.emit('drop', false, true);
				operation.forEach(function(fn) {
					fn();
				});
			});			
			
			return;
		}

		fs.unlink(self.filename, function(err) {
			
			if (err)
				self.emit('error', err, 'drop');

			self.next();

			setImmediate(function() { 
				self.emit('drop', false, err === null);
				operation.forEach(function(fn) {
					fn(err === null);
				});
			});
		});
	});

	return self;
};

/*
	Internal function
	@fnFilter {Function}
	@fnCallback {Function}
	return {Database}
*/
function updatePrepare(fnUpdate, fnCallback, type) {

	if (typeof(fnUpdate) === 'string')
		fnUpdate = eval('(function(doc){' + (fnUpdate.indexOf('return ') === -1 ? 'return ' : '') + fnUpdate + '})');

	return { filter: fnUpdate, callback: fnCallback, count: 0, type: type };
};

/*
	Update multiple documents
	fnUpdate {Function} :: params: @doc {Object} and must return updated @doc;
	fnCallback {Function} :: optional
	return {Database}
*/
Database.prototype.update = function(fnUpdate, fnCallback, type) {
	var self = this;

	if (self.status !== STATUS_UNKNOWN) {
	
		if (typeof(fnUpdate) !== 'undefined')
			self.pendingLock.push(updatePrepare(fnUpdate, fnCallback, type || 'update'));
		
		return self;
	}

	var operation = [];

	if (typeof(fnUpdate) !== 'undefined')
		operation.push(updatePrepare(fnUpdate, fnCallback, type || 'update'));

	self.pendingLock.forEach(function(fn) {
		operation.push(fn);
	});

	if (operation.length === 0) {
		self.next();
		return;
	}

	self.status = STATUS_LOCKING;

	fs.renameSync(self.filename, self.filenameTemp);

	var reader = fs.createReadStream(self.filenameTemp);
	var writer = fs.createWriteStream(self.filename);
	var current = '';
	var operationLength = operation.length;

	var countDelete = 0;
	var countUpdate = 0;

	self.emit('update/remove', true, 0, 0);
	self.pendingLock = [];

	var fnWrite = function(json) {
		writer.write(json + '\n');
	};

	var fnBuffer = function(buffer) {
		current += buffer;
		return current;
	};

	var fnItem = function(err, doc, cancel, json) {

		// clear buffer;
		current = '';

		var skip = false;
		var value = null;

		for (var i = 0; i < operationLength; i++) {
			
			var fn = operation[i];
			value = fn.filter(doc) || null;

			if (value === null)
				break;
		}

		if (value === null) {
			self.emit('delete', doc);
			countDelete++;
			return;
		}

		var updated = JSON.stringify(value);
		if (updated !== json) {
			self.emit('update', value);
			countUpdate++;
		}

		fnWrite(updated);
	};

	reader.on('data', function(buffer) {
		onBuffer(buffer.toString(), fnItem, fnBuffer);
	});

	reader.on('end', function() {

		operation.forEach(function(o) {

			if (o.type === 'update') {
				o.count = countUpdate;
				return;
			}

			if (o.type === 'delete')
				o.count = countDelete;
		});

		fs.unlink(self.filenameTemp, function(err) {

			if (err)
				self.emit('error', err, 'update/remove-rename-file');

			self.emit('update/remove', false, countUpdate, countDelete);

			operation.forEach(function(o) {
				if (o.callback)
					(function(cb,count) { setImmediate(function() { cb(count); }); })(o.callback, o.count);
			});
			
			self.next();
		});
	});

	reader.on('error', function(err) {

		self.emit('error', err, 'update/remove-stream');
		self.emit('update/remove', false, countUpdate, countDelete);

		operation.forEach(function(o) {
			if (o.callback)
				(function(cb, o) { setImmediate(function() { cb(); }); })(o.callback, o.count);
		});

		self.next();
	});

	return self;
};

/*
	Update multiple documents
	fnUpdate {Function} :: params: @doc {Object} and must return updated @doc;
	fnCallback {Function} :: optional
	return {Database}
*/
Database.prototype.prepare = function(fnUpdate, fnCallback) {
	var self = this;

	if (typeof(fnUpdate) !== 'undefined')
		self.pendingLock.push(updatePrepare(fnUpdate, fnCallback, 'update'));

	return self;
};

Database.prototype.updateFlush = function() {
	var self = this;
	self.update();
	return self;	
};

/*
	Remove data from database
	@fnFilter {Function} :: params: @obj {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @err {Error}, @countRemoved {Number}
	return {Database}
*/
Database.prototype.remove = function(fnFilter, fnCallback) {

	var self = this;

	if (typeof(fnFilter) === 'string')
		fnFilter = eval('(function(doc){' + (fnFilter.indexOf('return ') === -1 ? 'return ' : '') + fnFilter + '})');

	var filter = function(item) {

		if (fnFilter(item))
			return null;

		return item;
	};

	self.update(filter, fnCallback, 'delete');
	return self;
};

Database.prototype.pause = function() {	
	var self = this;

	self.isPending = true;

	if (self.status === STATUS_UNKNOWN) {
		self.status = STATUS_PENDING;
		self.emit('pause');
	}

	return self;
};

Database.prototype.resume = function() {
	var self = this;
	self.isPending = false;
	self.emit('resume');
	self.next();
	return self;
};

Database.prototype.view = function(filename, fnFilter, fnSort, fnCallback) {

	var self = this;
	var selected = [];

	if (typeof(fnFilter) === 'string')
		fnFilter = eval('(function(doc){' + (fnFilter.indexOf('return ') === -1 ? 'return ' : '') + fnFilter + '})');	

	var writer = fs.createWriteStream(filename);

	var onCallback = function() {
		selected.sort(fnSort);

		
		selected.forEach(function(o) {
			writer.write(JSON.stringify(o) + '\n');
		});

		fnCallback(filename, selected.length);
	};

	var onItem = function(doc) {

		if (!fnFilter(doc))
			return;

		selected.push(doc);
	};

	self.each(onItem, onCallback);
	return self;
};

/*
	Internal function
*/
Database.prototype.next = function() {

	var self = this;

	if (self.isPending) {
		if (self.status !== STATUS_PENDING) {
			self.status = STATUS_PENDING;
			self.emit('pause');
		}
		return;
	}
	
	self.status_prev = self.status;
	self.status = STATUS_UNKNOWN;

	// ReadStream is open, ... waiting for close
	if (self.countRead > 0) {
		self.status = STATUS_READING;
		return;
	}

	// WriteStream is open, ... waiting for close
	if (self.countWrite > 0) {
		self.status = STATUS_WRITING;
		return;
	}

	if (self.pendingWrite.length > 0) {
		self.bulk(self.pendingWrite);
		self.pendingWrite = [];
	}

	// large operation (truncate file)
	if (self.pendingLock.length > 0) {
		self.update();
		return;
	}

	if (self.pendingEach.length > 0) {
		self.each();
		return;
	}

	// read data
	if (self.pendingRead.length > 0) {

		var max = self.pendingRead.length;

		if (max > MAX_READSTREAM)
			max = MAX_READSTREAM;

		for (var i = 0; i < max; i++)
			self.pendingRead.shift()();

		return;
	}

	if (self.pendingDrop.length > 0) {
		self.drop();
		return;
	}

	setImmediate(function() {
		self.emit('complete', self.status_prev);
	});
};

exports.database = Database;
exports.load = exports.open = exports.nosql = function(filename) {
	return new Database(filename);
}