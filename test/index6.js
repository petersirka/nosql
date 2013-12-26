var fs = require('fs');
var filename = '/users/petersirka/desktop/test/paste_db';
var directory = '/users/petersirka/desktop/test/binary_files';
var nosql = require('../index');
var db = nosql.load(filename, directory, true);
var assert = require('assert');

/*
fs.readFile('/users/petersirka/desktop/b.png', function(err, data) {
	console.log(db.binary.update('1388077627679gsr1kyb9', 'Capture čsšťč decran 2013-12-26 a 15.03.22.png', 'image/png', data, 'IMPORT PHOTO'));
});
*/
/*
fs.readFile('/users/petersirka/desktop/Capture d’écran 2013-12-26 à 15.03.22.png', function(err, data) {
	console.log(db.binary.insert('Capture d’écran 2013-12-26 à 15.03.22.png', 'image/png', data, 'IMPORT PHOTO'));
});
*/

/*
fs.readFile('/users/petersirka/desktop/Capture d’écran 2013-12-26 à 15.03.22.png', function(err, data) {
	console.log(db.binary.insert('Capture d’écran 2013-12-26 à 15.03.22.png', 'image/png', data, 'IMPORT PHOTO'));
});
*/

/*
fs.readFile('/users/petersirka/desktop/a.png', function(err, data) {
	console.log(db.binary.insert('1234567890123456789012345678901234567890123456789012345678901234567890.png', 'image/png', data, 'IMPORT PHOTO'));
});
*/

db.binary.read('1388077627679gsr1kyb9', function(err, stream, info) {
	console.log(info);
	stream.pipe(fs.createWriteStream('/users/petersirka/desktop/bbb.png'));
});


// 1388073922148i1wcdi
/*
db.binary.read('1388077450740ii0jxlxr', function(err, stream) {
	stream.pipe(fs.createWriteStream('/users/petersirka/desktop/aaa.png'));
});
*/

// 1388074075564eyvnp14i = {"name":"a.png","size":508155,"type":"image/png","width":575,"height":572} 74 1927
// 1388074138744pjk0529  = {"name":"Capture d’écran 2013-12-26 à 15.03.22.png","size":508155,"type":"image/png","width":575,"height":572} 112 1889
// 1388074232426nl1bgldi = {"name":"1234567890123456789012345678901234567890123456789012345678901234567890.png","size":508155,"type":"image/png","width":575,"height":572} 143 1858

// #{"name":"Capture d’écran 2013-12-26 à 15.03.22.png","size":508155,"type":"image/png","width":575,"height":572}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            #
// #{"name":"a.png","size":508155,"type":"image/png","width":575,"height":572}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      #

// #{"name":"a.png","size":508155,"type":"image/png","width":575,"height":572}#
// #{"name":"Capture d’écran 2013-12-26 à 15.03.22.png","size":508155,"type":"image/png","width":575,"height":572}#

// 1388074973601zw5vzpvi