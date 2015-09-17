[![NoSQL gömülü veritabanı](https://www.totaljs.com/exports/nosql-logo.png)](https://github.com/petersirka/nosql)

node.js NoSQL gömülü veritabanı
===============================

> __DİKKAT__: yeni sürümdeki binaryfile özeliği eski sürümlerle uyumlu değildir 

* __YENİ:__ View lar için otomatik güncelleme
* __YENİ:__ imaj dosyaları için boyut bilgileri
* __YENİ:__ DB ye custom özeliği eklendi
* __YENİ:__ DB ye description özeliği eklendi
* Fonksiyon depolar (stored function)
* Temel işlemler için log tutar (changelog)
* Dosyaları destekler (insert, read, remove)
* JavaScript de kodlandı
* Küçük ve etkili gömülü veritabanı
* Implements a small concurrency model
* Veriler metin dosyası olarak, bir dosyaya kaydedilir
* Kolay düzenlenir örneğin notepad ile
* Etkili, hızlı, basit
* Kayıtları kolayca filitreler
* Asenkron komutları destekler (insert, read, update, remove, drop, count, clear)
* View ları destekler
* __Tek Dosya__

__DİKKAT__: YENİ versiyon __v3.0.0__ da callback fonksiyonlarının tümü güncellendi. Tümüne err parametresi eklendi.

## Kurulum

```
$ sudo npm install -g nosql

// yada

$ npm install nosql
```

## EK ARAÇLAR

```js
var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

// --- WRITE

nosql.description('My users database.');
nosql.custom({ key: '3493893' });

// --- READ

var description = nosql.description();
var custom = nosql.custom();

console.log(description);
console.log(custom.key);

// --- OTHER

// Database date created
nosql.created;

if (!nosql.isReady) {
    // BEKLEMELİSİN :-)
}

nosql.on('load', function() {
   // Hazırım
});

```

## STORED FUNCTIONS

> version +1.0.3-0

```js
var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

// Depolanmış fonksiyon oluşturma
// nosql.stored.create(name, function, [callback], [changes]);
nosql.stored.create('counter', function(nosql, next, params) {

	// nosql === nosql embedded database object

	nosql.update(function(doc) {
		doc.counter = (doc.counter || 0) + 1;
		return doc;
	}, function() {
		// next calls callback function in nosql.stored.execute();
		next();
	});

}, 'insert new counter function');

// Depolanmış fonksiyonu silme
// nosql.stored.remove(name, [callback], [changes]);
nosql.stored.remove('counter');

//  Tüm depolanmış fonksiyonları silme
// nosql.stored.clear([callback]);
nosql.stored.clear();

// Depolanmış fonksiyonu çalıştırma
// nosql.stored.execute(name, [params], [callback], [changes]);
nosql.stored.execute('counter', function() {
	console.log('counter DONE.');
});

// or

nosql.stored.execute('counter', { increment: 1 });

```

## CHANGELOG

```js
var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql');

nosql.insert({ name: 'Peter' }, 'insert new user');
nosql.update(..., 'update all users where age > 20');

nosql.binary.insert(..., 'new user photo');
```

###	Changelog: /users/petersirka/desktop/database.changes

```plain
2013-04-23 18:08:37 | insert new user
2013-04-23 19:12:21 | update all users where age > 20
2013-04-23 20:01:02 | new user photo
```

## node.js

```js

var nosql = require('nosql').load('/users/petersirka/desktop/database.nosql', '/users/petersirka/desktop/binary-files-directory/');
// nosq.load(filename, [path-to-binary-directory]);

// KAYIT EKLEME
// nosql.insert(doc, [fnCallback], [changes]);
// ============================================================================

var callback = function(err, count) {
	// optional
};

nosql.insert({ firstName: 'Peter', lastName: 'Širka', age: 28 }, callback, 'new registered user: Peter Širka');
nosql.insert({ firstName: 'Fero', lastName: 'Samo', age: 40 }, callback);
nosql.insert({ firstName: 'Juraj', lastName: 'Hundo', age: 28 }, callback);

// TOPLU KAYIT EKLEME
// nosql.insert(array, fnCallback);
// ============================================================================

var callback = function(err, count) {
	console.log('INSERTED: ' + count);
};

nosql.insert([{ firstName: 'Peter', lastName: 'Širka', age: 28 }, { firstName: 'Fero', lastName: 'Samo', age: 40 }, { firstName: 'Juraj', lastName: 'Hundo', age: 28 }], callback);

// KAYIT GÜNCELLEME
// nosql.update(fnUpdate, [fnCallback], [changes]);
// ============================================================================

var callback = function(err, count) {
	// updated count
};

nosql.update(function(doc) {

	if (doc.name === 'Peter')
		doc.name = 'Jano';

	// if return null or undefined - document will be removed
	// if return {Object}, document will be replaced

	return doc;
}, callback);

// ÇOKLU KAYIT GÜNCELLEME
// nosql.prepare(fnUpdate, [fnCallback], [changes]);
// nosql.update();
// ============================================================================

nosql.prepare(function(doc) {
	if (doc.name === 'Peter')
		doc.name = 'Jano';
	return doc;
});

nosql.prepare(function(doc) {

	if (doc.index === 2320)
		doc.name = 'Peter';

	// if return null or undefined - document will be removed
	// if return {Object}, document will be replaced

	return doc;
});

nosql.update();

// KAYIT OKUMA
// nosql.all(fnMap, fnCallback, [itemSkip], [itemTake]);
// nosql.one(fnMap, fnCallback);
// nosql.top(max, fnMap, fnCallback);
// nosql.each(fnCallback);
// ----------------------------------------------------------------------------
// DİKKAT: ÇOK RAM KULLANIR VE YAVAŞ ÇALIŞIR, VİEW KULLANIN
// nosql.sort(fnMap, fnSort, fnCallback, [itemSkip], [itemTake]);
// ============================================================================

var callback = function(err, selected) {

	var users = [];
	selected.forEach(function(o) {
		users.push(o.firstName + ' ' + o.lastName);
	});

	// how to sort?
	// use Array.sort() function

	console.log('Users between 25 and 35 years old: ' + users.join(', '));
});

var map = function(doc) {
	if (doc.age > 24 && doc.age < 36)
		return doc;
};

nosql.all(map, callback);
nosql.one(map, function(doc) {});
nosql.top(5, map, callback);
nosql.each(function(doc, offset) {});

// KAYIT SİLME
// nosql.remove(fnFilter, [fnCallback], [changes]);
// ============================================================================

var callback = function(err, count) {
	// removed count
});

var filter = function(doc) {
	return doc.age > 24 && doc.age < 36;
};

nosql.remove(filter, callback);

// HAZIRLANMIŞ SORGULAR (VIEWS)
// nosql.views.all(name, fnCallback, [itemSkip], [itemTake], [fnMap]);
// nosql.views.one(name, [fnMap], fnCallback);
// nosql.views.top(name, top, fnCallback, [fnMap]);

// DİKKAT:
// Hazırlanmış bir sorgu(view) oluşturulduğunda, içeriği otomatik olarak bir dosyaya kaydedilir ve tekrar oluşturulursa dosya güncellenir.
// nosql.views.create(name, fnMap, fnSort, [fnCallback], [fnUpdate], [changes]);
// nosql.views.drop(name, [fnCallback], [changes]);
// ============================================================================

var map = function(doc) {
	if (doc.age > 20 && doc.age < 30)
		return doc;
};

var sort = function(a, b) {
	if (a.age > b.age)
		return 1;
	return -1;
};

nosql.views.all('young', function(err, documents, count) {
	// view file not created
	// documents === empty
}, 0, 10);

nosql.views.create('young', map, sort, function(err, count) {

	// hazır sorgu oluşunca filitrelenmiş ve sıralanmış database#young.db doyası oluşur 

	nosql.views.all('young', function(err, documents, count) {
		console.log(documents);
		console.log('From total ' + count + ' documents');
	}, 0, 10);

	nosql.views.top('young', 5, function(err, documents) {
		console.log(documents);
	});

	nosql.views.one('young', function(doc) {

		if (doc.age === 24)
			return doc;

	}, function(err, document) {
		console.log(document);
	});

});

// DOSYALAR
// nosql.binary.insert(name, contentType, buffer/base64/stream, [callback], [changes]); - return file ID
// nosql.binary.update(id, name, contentType, buffer/base64/stream, [callback], [changes]); - return file ID
// nosql.binary.read(id, fnCallback);
// nosql.binary.remove(id, [fnCallback], [changes]);
// ============================================================================

fs.readFile('/users/petersirka/desktop/picture.jpg', function(err, data) {

	// senkron fonksiyon
	var id = nosql.binary.insert('picture.jpg', 'image/jpeg', data);

	console.log(id);

	// result: 1365699379204dab2csor
	// nosql.binary.read(id, .......);

});

nosql.binary.read('1365699379204dab2csor', function(err, stream, header) {

	// DİKKAT:
	// if you have problem with "pipe" then enable [pipeProblem] argument.
	// nosql.binary.read('id', fn, true);

	if (err)
		return;

	// header.name;   - file name
	// header.size;   - file size
	// header.type;   - content type
	// header.width;  - image width
	// header.height; - image height

	stream.pipe(fs.createWriteStream('/users/petersirka/dekstop/picture-database.jpg'));

	// or

	stream.pipe(httpResponse);
});

nosql.binary.remove('1365699379204dab2csor', function(err, isRemoved) {
	console.log(isRemoved === true);
});


// DİĞER İŞLEMLER
// ============================================================================

// veri tabanını durdurma ve tekrar çalıştırma
nosql.pause(); // durdur
nosql.resume(); //devam et

// veri tabanını silme(yoketme)
// nosql.drop([fnCallback]);

// veri tabanını sıfırlama(içini boşaltma)
// nosql.clear([fnCallback]);

// OLAYLAR
// ============================================================================

nosql.on('load', function() {});
nosql.on('error', function(err, source) {});
nosql.on('pause/resume', function(pause) {});
nosql.on('insert', function(begin, count) {});
nosql.on('update/remove', function(countUpdate, countRemove) {});
nosql.on('all', function(begin, count) {});
nosql.on('one', function(begin, count) {});
nosql.on('top', function(begin, count) {});
nosql.on('each', function(begin, count) {});
nosql.on('view', function(begin, name, count) {});
nosql.on('view/create', function(begin, name, count) {});
nosql.on('view/drop', function(begin, name) {});
nosql.on('view/refresh', function(begin, name, count) {});
nosql.on('clear', function(begin, success) {});
nosql.on('drop', function(begin, success) {});
nosql.on('complete', function(old_status) {});
nosql.on('change', function(description) {});
nosql.on('stored', function(name) {});
nosql.on('stored/load', function() {});
nosql.on('stored/clear', function() {});
nosql.on('stored/save', function(name) {});

```

## Değişim geçmişi(Changelog)

> version +1.0.2-0

```js

// EKLEME  
nosql.changelog.insert('my change');
nosql.changelog.insert(['my change 1', 'my change 2', 'my change 3']);

// SIFIRLAMA
nosql.changelog.clear([fnCallback]);

// OKUMA
nosql.changelog.read(function(err, lines) {
	console.log(lines.join('\n'));
});

```

## Nasıl Yapılır(İp uçları)

```js
// ============================================================================
// Nasıl Çanlı bir view yapılır ? 
// ============================================================================

function addUser() {
	// ...
	// ...
	nosql.insert(user, function() {

		// view ı tazele ,yeniden oluştur
		nosql.views.create('user', yourGlobalUser.filter, yourGlobalUser.sort);

	});
	// aynı işlemi remove ve update de de yapmak lazım
	
	// en iyisi aşağıdaki olaylara bağlamak olabilir
			nosql.on('insert', function(begin, count) {});
			nosql.on('update/remove', function(countUpdate, countRemove) {}); 
			
	
}

// ============================================================================
// Genel toplam nasıl alınır ?
// ============================================================================

function sumarize() {
	// ...
	// ...

	var sum = 0;
	nosql.each(function(doc) {

		if (doc.type === 'product')
			sum += doc.price;

	}, function(err) {
		console.log('Price of all products:', sum);
	});
}

// ============================================================================
// Kayıt sayısı nasıl okunur?
// ============================================================================

nosql.count(function(user) {
	return user.age > 10 && user.age < 30;
}, function(err, count) {
	console.log('Count of users between 10 and 30 years old:', count);
});

yada 

nosql.$$count( "doc.age > 10 && doc.age < 30" )(function(err, count) {
	console.log('Count of users between 10 and 30 years old:', count);
});



// ============================================================================
// Kayıtlar nasıl sayfa sayfa okunur ?
// ============================================================================

// İPUCU: bir view oluşturun 

var userSkip = 10;
var userTake = 30;

nosql.views.all('users', function(err, users, count) {

	console.log(users);

	var pageCount = count / userTake;

	if (pageCount % userTake !== 0)
		pageCount++;

	console.log('Total pages:', pageCount);
	console.log('Total users:', count);

}, userSkip, userTake);

// veya view i filitreleyin

nosql.views.all('users', function(err, users, count) {
	console.log(users);
	console.log('Total users:', count);
}, userSkip, userTake, 'user.age > 10 && user.age < 30');

// view kullanmadan:

nosql.all(function(user) {
	if (user.age > 10 && user.age < 30)
		return user;
}, function(err, users) {
	console.log(users);
}, userSkip, userTake);

// view kullanmadan sıralnmış:
// YAVAŞ VE ÇOK RAM TÜKETEN KÖTÜ BİR ÇÖZÜM

nosql.sort(function(user) {
	if (user.age > 10 && user.age < 30)
		return user;
}, function(a, b) {
	if (a.age < b.age)
		return -1;
	return 1;
} function(err, users, count) {
	console.log(users);
	console.log('Total users:', count);
}, userSkip, userTake);

```

## (Generators) Fonksiyon veren fonksiyonlar dönen fonksiyon callback parametrelidir

```javascript
// nosql.$$all(fnMap, [itemSkip], [itemTake]);
// nosql.$$one(fnMap);
// nosql.$$top(max, fnMap);
// nosql.$$each();
// nosql.$$count(fnMap);
// nosql.$$insert(doc, [changes]);
// nosql.$$update(fnUpdate, [changes]);
// nosql.$$prepare(fnUpdate, [changes]);
// nosql.$$sort(fnMap, fnSort, [itemSkip], [itemTake]);
// nosql.$$remove(fnFilter, [changes]);
// nosql.views.$$all(name, [itemSkip], [itemTake], [fnMap]);
// nosql.views.$$one(name, [fnMap]);
// nosql.views.$$top(name, top, [fnMap]);
// nosql.views.$$create(name, fnMap, fnSort, [fnUpdate], [changes]);
// nosql.views.$$drop(name, [changes]);
// nosql.binary.$$insert(name, contentType, buffer/base64, [changes]); - return file ID
// nosql.binary.$$update(id, name, contentType, buffer/base64, [changes]); - return file ID
// nosql.binary.$$read(id);
// nosql.binary.$$remove(id, [changes]);
```

## MIT Lisansı

Copyright (c) 2012-2013 Peter Širka <petersirka@gmail.com>

Hiçbir ücret talep edilmeden burada işbu yazılımın bir kopyasını ve belgelendirme dosyalarını (“Yazılım”) elde eden herkese verilen izin; kullanma, kopyalama, değiştirme, birleştirme, yayımlama, dağıtma, alt lisanslama, ve/veya yazılımın kopyalarını satma eylemleri de dahil olmak üzere ve bununla kısıtlama olmaksızın, yazılımın sınırlama olmadan ticaretini yapmak için verilmiş olup, bunları yapmaları için yazılımın sağlandığı kişilere aşağıdakileri yapmak koşuluyla sunulur:

Yukarıdaki telif hakkı bildirimi ve işbu izin bildirimi yazılımın tüm kopyalarına veya önemli parçalarına eklenmelidir. 

YAZILIM “HİÇBİR DEĞİŞİKLİK YAPILMADAN” ESASINA BAĞLI OLARAK, TİCARETE ELVERİŞLİLİK, ÖZEL BİR AMACA UYGUNLUK VE İHLAL OLMAMASI DA DAHİL VE BUNUNLA KISITLI OLMAKSIZIN AÇIKÇA VEYA ÜSTÜ KAPALI OLARAK HİÇBİR TEMİNAT OLMAKSIZIN SUNULMUŞTUR. HİÇBİR KOŞULDA YAZARLAR VEYA TELİF HAKKI SAHİPLERİ HERHANGİ BİR İDDİAYA, HASARA VEYA DİĞER YÜKÜMLÜLÜKLERE KARŞI, YAZILIMLA VEYA KULLANIMLA VEYA YAZILIMIN BAŞKA BAĞLANTILARIYLA İLGİLİ, BUNLARDAN KAYNAKLANAN VE BUNLARIN SONUCU BİR SÖZLEŞME DAVASI, HAKSIZ FİİL VEYA DİĞER EYLEMLERDEN SORUMLU DEĞİLDİR.

## Yazanlar

- [Peter Širka](https://github.com/petersirka/)
- [Aboubakr Gasmi](https://github.com/g13013)
- [Thomas Moyse](https://github.com/t8g)
- [opatry](https://github.com/opatry)
- [Brian Woodward](https://github.com/doowb)

## Tavsiyeler

[total.js web application framework](https://github.com/totaljs/framework)
