const filename = 'aaaa.nosql';
const nosql = require('../index');
const db = nosql.load(filename);

db.insert({ name: 'peter' });