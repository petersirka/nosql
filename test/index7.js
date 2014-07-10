var fs = require('fs');
var filename = '/users/petersirka/desktop/test/aaa';
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