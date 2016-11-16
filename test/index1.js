const filename = 'aaaa.nosql';
const nosql = require('../index');
const db = nosql.load(filename);
const Fs = require('fs');

/*
db.insert({ name: 'Peter ' });
db.insert({ name: 'Lucia' });
db.insert({ name: 'Igor' });
db.insert({ name: 'Stano' });
db.insert({ name: 'Jozef' });
*/

db.view('name').fields('name');

// db.update({ name: 'Jozef', age: 33 }).where('name', 'Jozef');