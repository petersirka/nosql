var fs = require('fs');
var os = require('os');
var path = require('path');
var filename = path.join(os.tmpdir(), "test");
var nosql = require('../index');
var db = nosql.load(filename);
var assert = require('assert');

// it should be possible to drop the db
db.insert({ hello: "world" }, function (err) {
    assert(!err);
    db.drop(function (err) {
        assert(!err);
        db.all(function (doc) {
            return doc;
        }, function (err, docs) {
            assert(docs.length === 0);
        });

    });

});
