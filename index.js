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

var fs = require('fs');
var encoding = 'utf8';

/*
	Database
	@filename {String}
*/
function Database(filename) {
	this.pending = [];
	this.filename = filename;
	this.filenameTemp = filename + '.tmp';
	this.isLocked = false;
	this.isScalar = false;
	this.count = 0;
	this.current = '';
	this.selected = [];
};

/*
	Write data to database
	@obj {Object}
	@fnCallback {Function} :: optional, params: @err {Error}, @obj {Object}
	return {Database}
*/
Database.prototype.write = function(obj, fnCallback) {

	var self = this;

	if (self.isLocked) {
		self.pending.push(function() {
			self.write(obj, fnCallback);
		});
		return self;
	}

	self.isLocked = true;
	fs.appendFile(self.filename, JSON.stringify(obj) + '\n', { encoding: encoding }, function(err) {
		self.isLocked = false;
		fnCallback && fnCallback(err, obj);
		self.next();
	});

	return self;
};

/*
	Write bulk data to database
	@arr {Array of Object}
	@fnCallback {Function} :: optional, params: @err {Error}, @count {Number}
	return {Database}
*/
Database.prototype.writeBulk = function(arr, fnCallback) {
	var self = this;

	if (self.isLocked) {
		self.pending.push(function() {
			self.writeBulk(arr, fnCallback);
		});
		
		return self;
	}

	self.isLocked = true;

	var builder = [];

	arr.forEach(function(o) {
		builder.push(JSON.stringify(o));
	});

	fs.appendFile(self.filename, builder.join('\n') + '\n', { encoding: encoding }, function(err) {
		self.isLocked = false;
		fnCallback && fnCallback(err, arr.length);
		self.next();
	});

	return self;
};

/*
	Internal function
	@data {String}
	@fnFilter {Function}
*/
Database.prototype.readValue = function(data, fnFilter) {

	var self = this;
	var index = data.indexOf('\n');

	if (index === -1) {
		self.current += data;
		return;
	}

	self.current += data.substring(0, index);
	
	var obj = JSON.parse(self.current); 

	if (fnFilter(obj)) {
		if (self.isScalar)
			self.count++;
		else			
			self.selected.push(obj);
	}

	self.current = '';
	self.readValue(data.substring(index + 1), fnFilter);
};

/*
	Read data from database
	@fnFilter {Function} :: params: @obj {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @err {Error}, @selected {Array of Object}
	@isScalar {Boolean} :: optional, default is false 
	return {Database}
*/
Database.prototype.read = function(fnFilter, fnCallback, isScalar) {
	
	var self = this;

	if (self.isLocked) {
		self.pending.push(function() {
			self.read(fnFilter, fnCallback, isScalar);
		});
		return self;
	}

	var reader = fs.createReadStream(self.filename);
	self.selected = [];

	if (typeof(fnCallback) === 'undefined') {		
		fnCallback = fnFilter;
		fnFilter = function() { return true; };
	}

	if (typeof(fnCallback) === 'boolean') {
		isScalar = fnCallback;
		fnCallback = fnFilter;
		fnFilter = function() { return true; };
	};

	self.isScalar = isScalar;

	reader.on('data', function(buffer) {
		var data = buffer.toString();
		self.readValue(data, fnFilter);
	});

	reader.on('end', function() {
		fnCallback(null, self.isScalar ? self.count : self.selected);
		self.selected = [];
		self.next();
	});

	reader.on('error', function(err) {
		fnCallback(err, self.isScalar ? self.count : []);
		self.selected = [];
		self.next();
	});

	self.current = '';
	reader.resume();

	return self;
};

/*
	Scalar
	@fnFilter {Function} :: params: @obj {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @err {Error}, @count {Number}
	return {Database}
*/
Database.prototype.scalar = function(fnFilter, fnCallback) {
	return this.read(fnFilter, fnCallback, true);
};

/*
	Internal function
	@data {String}
	@fnFilter {Function}
	@fnWrite {Function}
*/
Database.prototype.removeValue = function(data, fnFilter, fnWrite) {

	var self = this;
	var index = data.indexOf('\n');

	if (index === -1) {
		self.current += data;
		return;
	}

	self.current += data.substring(0, index);
	
	var obj = JSON.parse(self.current); 

	if (!fnFilter(obj))
		fnWrite(obj);
	else
		self.count++;

	self.current = '';
	self.removeValue(data.substring(index + 1), fnFilter, fnWrite);
};

/*
	Remove data from database
	@fnFilter {Function} :: params: @obj {Object}, return TRUE | FALSE
	@fnCallback {Function} :: params: @err {Error}, @countRemoved {Number}
	return {Database}
*/
Database.prototype.remove = function(fnFilter, fnCallback) {

	var self = this;

	if (self.isLocked) {
		self.pending.push(function() {
			self.read(fnFilter, fnCallback);
		});
		return self;
	}

	var reader = fs.createReadStream(self.filename);
	var writer = fs.createWriteStream(self.filenameTemp);

	self.isLocked = true;

	var fnWrite = function(obj) {
		writer.write(JSON.stringify(obj) + '\n');
	};

	reader.on('data', function(buffer) {
		var data = buffer.toString();
		self.removeValue(data, fnFilter, fnWrite);
	});

	reader.on('end', function() {
		fnCallback && fnCallback(null, self.count);
		fs.rename(self.filenameTemp, self.filename, function(err) {
			self.isLocked = false;
			self.next();
		});
	});

	reader.on('error', function(err) {
		self.isLocked = false;
		fnCallback(err, self.count);
		self.next();
	});

	self.count = 0;
	self.current = '';
	reader.resume();
	return self;
};

/*
	Internal function
*/
Database.prototype.next = function() {

	var self = this;
	if (self.pending.length === 0)
		return;

	var fn = self.pending.shift();
	fn();
};

exports.database = Database;
exports.load = exports.open = exports.nosql = function(filename) {
	return new Database(filename);
}