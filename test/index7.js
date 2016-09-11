var fs = require('fs');
var os = require('os');
var path = require('path');
var filename = path.join(os.tmpdir(), "test");
var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

var write = true;
var read = true;
var remove = true;

var indexComplete = 0;
var indexInsert = 0;

db.all(function(docs, count) {
    console.log(docs, count);
});