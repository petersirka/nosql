require('total.js');

const Nosql = require('total.js/nosql');
const Path = require('path');

exports.load = function(filename) {
	return Nosql.load(Path.basename(filename, Path.extname(filename)), filename.substring(0, filename.length - Path.extname(filename).length));
};