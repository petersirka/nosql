// Copyright 2012-2016 (c) Peter Širka <petersirka@gmail.com>
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'Juny', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const regexpTRIM = /^[\s]+|[\s]+$/g;
const regexpDATEFORMAT = /yyyy|yy|M+|d+|HH|H|hh|h|mm|m|ss|s|a|ww|w/g;
const regexpDiacritics = /[^\u0000-\u007e]/g;
const regexpINTEGER = /(^\-|\s-)?[0-9]+/g;
const DIACRITICSMAP = {};
const NODEVERSION = parseFloat(process.version.toString().replace('v', '').replace(/\./g, ''));

var DIACRITICS=[{b:' ',c:'\u00a0'},{b:'0',c:'\u07c0'},{b:'A',c:'\u24b6\uff21\u00c0\u00c1\u00c2\u1ea6\u1ea4\u1eaa\u1ea8\u00c3\u0100\u0102\u1eb0\u1eae\u1eb4\u1eb2\u0226\u01e0\u00c4\u01de\u1ea2\u00c5\u01fa\u01cd\u0200\u0202\u1ea0\u1eac\u1eb6\u1e00\u0104\u023a\u2c6f'},{b:'AA',c:'\ua732'},{b:'AE',c:'\u00c6\u01fc\u01e2'},{b:'AO',c:'\ua734'},{b:'AU',c:'\ua736'},{b:'AV',c:'\ua738\ua73a'},{b:'AY',c:'\ua73c'},{b:'B',c:'\u24b7\uff22\u1e02\u1e04\u1e06\u0243\u0181'},{b:'C',c:'\u24b8\uff23\ua73e\u1e08\u0106C\u0108\u010a\u010c\u00c7\u0187\u023b'},{b:'D',c:'\u24b9\uff24\u1e0a\u010e\u1e0c\u1e10\u1e12\u1e0e\u0110\u018a\u0189\u1d05\ua779'},{b:'Dh',c:'\u00d0'},{b:'DZ',c:'\u01f1\u01c4'},{b:'Dz',c:'\u01f2\u01c5'},{b:'E',c:'\u025b\u24ba\uff25\u00c8\u00c9\u00ca\u1ec0\u1ebe\u1ec4\u1ec2\u1ebc\u0112\u1e14\u1e16\u0114\u0116\u00cb\u1eba\u011a\u0204\u0206\u1eb8\u1ec6\u0228\u1e1c\u0118\u1e18\u1e1a\u0190\u018e\u1d07'},{b:'F',c:'\ua77c\u24bb\uff26\u1e1e\u0191\ua77b'}, {b:'G',c:'\u24bc\uff27\u01f4\u011c\u1e20\u011e\u0120\u01e6\u0122\u01e4\u0193\ua7a0\ua77d\ua77e\u0262'},{b:'H',c:'\u24bd\uff28\u0124\u1e22\u1e26\u021e\u1e24\u1e28\u1e2a\u0126\u2c67\u2c75\ua78d'},{b:'I',c:'\u24be\uff29\u00cc\u00cd\u00ce\u0128\u012a\u012c\u0130\u00cf\u1e2e\u1ec8\u01cf\u0208\u020a\u1eca\u012e\u1e2c\u0197'},{b:'J',c:'\u24bf\uff2a\u0134\u0248\u0237'},{b:'K',c:'\u24c0\uff2b\u1e30\u01e8\u1e32\u0136\u1e34\u0198\u2c69\ua740\ua742\ua744\ua7a2'},{b:'L',c:'\u24c1\uff2c\u013f\u0139\u013d\u1e36\u1e38\u013b\u1e3c\u1e3a\u0141\u023d\u2c62\u2c60\ua748\ua746\ua780'}, {b:'LJ',c:'\u01c7'},{b:'Lj',c:'\u01c8'},{b:'M',c:'\u24c2\uff2d\u1e3e\u1e40\u1e42\u2c6e\u019c\u03fb'},{b:'N',c:'\ua7a4\u0220\u24c3\uff2e\u01f8\u0143\u00d1\u1e44\u0147\u1e46\u0145\u1e4a\u1e48\u019d\ua790\u1d0e'},{b:'NJ',c:'\u01ca'},{b:'Nj',c:'\u01cb'},{b:'O',c:'\u24c4\uff2f\u00d2\u00d3\u00d4\u1ed2\u1ed0\u1ed6\u1ed4\u00d5\u1e4c\u022c\u1e4e\u014c\u1e50\u1e52\u014e\u022e\u0230\u00d6\u022a\u1ece\u0150\u01d1\u020c\u020e\u01a0\u1edc\u1eda\u1ee0\u1ede\u1ee2\u1ecc\u1ed8\u01ea\u01ec\u00d8\u01fe\u0186\u019f\ua74a\ua74c'}, {b:'OE',c:'\u0152'},{b:'OI',c:'\u01a2'},{b:'OO',c:'\ua74e'},{b:'OU',c:'\u0222'},{b:'P',c:'\u24c5\uff30\u1e54\u1e56\u01a4\u2c63\ua750\ua752\ua754'},{b:'Q',c:'\u24c6\uff31\ua756\ua758\u024a'},{b:'R',c:'\u24c7\uff32\u0154\u1e58\u0158\u0210\u0212\u1e5a\u1e5c\u0156\u1e5e\u024c\u2c64\ua75a\ua7a6\ua782'},{b:'S',c:'\u24c8\uff33\u1e9e\u015a\u1e64\u015c\u1e60\u0160\u1e66\u1e62\u1e68\u0218\u015e\u2c7e\ua7a8\ua784'},{b:'T',c:'\u24c9\uff34\u1e6a\u0164\u1e6c\u021a\u0162\u1e70\u1e6e\u0166\u01ac\u01ae\u023e\ua786'}, {b:'Th',c:'\u00de'},{b:'TZ',c:'\ua728'},{b:'U',c:'\u24ca\uff35\u00d9\u00da\u00db\u0168\u1e78\u016a\u1e7a\u016c\u00dc\u01db\u01d7\u01d5\u01d9\u1ee6\u016e\u0170\u01d3\u0214\u0216\u01af\u1eea\u1ee8\u1eee\u1eec\u1ef0\u1ee4\u1e72\u0172\u1e76\u1e74\u0244'},{b:'V',c:'\u24cb\uff36\u1e7c\u1e7e\u01b2\ua75e\u0245'},{b:'VY',c:'\ua760'},{b:'W',c:'\u24cc\uff37\u1e80\u1e82\u0174\u1e86\u1e84\u1e88\u2c72'},{b:'X',c:'\u24cd\uff38\u1e8a\u1e8c'},{b:'Y',c:'\u24ce\uff39\u1ef2\u00dd\u0176\u1ef8\u0232\u1e8e\u0178\u1ef6\u1ef4\u01b3\u024e\u1efe'}, {b:'Z',c:'\u24cf\uff3a\u0179\u1e90\u017b\u017d\u1e92\u1e94\u01b5\u0224\u2c7f\u2c6b\ua762'},{b:'a',c:'\u24d0\uff41\u1e9a\u00e0\u00e1\u00e2\u1ea7\u1ea5\u1eab\u1ea9\u00e3\u0101\u0103\u1eb1\u1eaf\u1eb5\u1eb3\u0227\u01e1\u00e4\u01df\u1ea3\u00e5\u01fb\u01ce\u0201\u0203\u1ea1\u1ead\u1eb7\u1e01\u0105\u2c65\u0250\u0251'},{b:'aa',c:'\ua733'},{b:'ae',c:'\u00e6\u01fd\u01e3'},{b:'ao',c:'\ua735'},{b:'au',c:'\ua737'},{b:'av',c:'\ua739\ua73b'},{b:'ay',c:'\ua73d'}, {b:'b',c:'\u24d1\uff42\u1e03\u1e05\u1e07\u0180\u0183\u0253\u0182'},{b:'c',c:'\uff43\u24d2\u0107\u0109\u010b\u010d\u00e7\u1e09\u0188\u023c\ua73f\u2184'},{b:'d',c:'\u24d3\uff44\u1e0b\u010f\u1e0d\u1e11\u1e13\u1e0f\u0111\u018c\u0256\u0257\u018b\u13e7\u0501\ua7aa'},{b:'dh',c:'\u00f0'},{b:'dz',c:'\u01f3\u01c6'},{b:'e',c:'\u24d4\uff45\u00e8\u00e9\u00ea\u1ec1\u1ebf\u1ec5\u1ec3\u1ebd\u0113\u1e15\u1e17\u0115\u0117\u00eb\u1ebb\u011b\u0205\u0207\u1eb9\u1ec7\u0229\u1e1d\u0119\u1e19\u1e1b\u0247\u01dd'}, {b:'f',c:'\u24d5\uff46\u1e1f\u0192'},{b:'ff',c:'\ufb00'},{b:'fi',c:'\ufb01'},{b:'fl',c:'\ufb02'},{b:'ffi',c:'\ufb03'},{b:'ffl',c:'\ufb04'},{b:'g',c:'\u24d6\uff47\u01f5\u011d\u1e21\u011f\u0121\u01e7\u0123\u01e5\u0260\ua7a1\ua77f\u1d79'},{b:'h',c:'\u24d7\uff48\u0125\u1e23\u1e27\u021f\u1e25\u1e29\u1e2b\u1e96\u0127\u2c68\u2c76\u0265'},{b:'hv',c:'\u0195'},{b:'i',c:'\u24d8\uff49\u00ec\u00ed\u00ee\u0129\u012b\u012d\u00ef\u1e2f\u1ec9\u01d0\u0209\u020b\u1ecb\u012f\u1e2d\u0268\u0131'}, {b:'j',c:'\u24d9\uff4a\u0135\u01f0\u0249'},{b:'k',c:'\u24da\uff4b\u1e31\u01e9\u1e33\u0137\u1e35\u0199\u2c6a\ua741\ua743\ua745\ua7a3'},{b:'l',c:'\u24db\uff4c\u0140\u013a\u013e\u1e37\u1e39\u013c\u1e3d\u1e3b\u017f\u0142\u019a\u026b\u2c61\ua749\ua781\ua747\u026d'},{b:'lj',c:'\u01c9'},{b:'m',c:'\u24dc\uff4d\u1e3f\u1e41\u1e43\u0271\u026f'},{b:'n',c:'\u24dd\uff4e\u01f9\u0144\u00f1\u1e45\u0148\u1e47\u0146\u1e4b\u1e49\u019e\u0272\u0149\ua791\ua7a5\u043b\u0509'},{b:'nj', c:'\u01cc'},{b:'o',c:'\u24de\uff4f\u00f2\u00f3\u00f4\u1ed3\u1ed1\u1ed7\u1ed5\u00f5\u1e4d\u022d\u1e4f\u014d\u1e51\u1e53\u014f\u022f\u0231\u00f6\u022b\u1ecf\u0151\u01d2\u020d\u020f\u01a1\u1edd\u1edb\u1ee1\u1edf\u1ee3\u1ecd\u1ed9\u01eb\u01ed\u00f8\u01ff\ua74b\ua74d\u0275\u0254\u1d11'},{b:'oe',c:'\u0153'},{b:'oi',c:'\u01a3'},{b:'oo',c:'\ua74f'},{b:'ou',c:'\u0223'},{b:'p',c:'\u24df\uff50\u1e55\u1e57\u01a5\u1d7d\ua751\ua753\ua755\u03c1'},{b:'q',c:'\u24e0\uff51\u024b\ua757\ua759'}, {b:'r',c:'\u24e1\uff52\u0155\u1e59\u0159\u0211\u0213\u1e5b\u1e5d\u0157\u1e5f\u024d\u027d\ua75b\ua7a7\ua783'},{b:'s',c:'\u24e2\uff53\u015b\u1e65\u015d\u1e61\u0161\u1e67\u1e63\u1e69\u0219\u015f\u023f\ua7a9\ua785\u1e9b\u0282'},{b:'ss',c:'\u00df'},{b:'t',c:'\u24e3\uff54\u1e6b\u1e97\u0165\u1e6d\u021b\u0163\u1e71\u1e6f\u0167\u01ad\u0288\u2c66\ua787'},{b:'th',c:'\u00fe'},{b:'tz',c:'\ua729'},{b:'u',c:'\u24e4\uff55\u00f9\u00fa\u00fb\u0169\u1e79\u016b\u1e7b\u016d\u00fc\u01dc\u01d8\u01d6\u01da\u1ee7\u016f\u0171\u01d4\u0215\u0217\u01b0\u1eeb\u1ee9\u1eef\u1eed\u1ef1\u1ee5\u1e73\u0173\u1e77\u1e75\u0289'}, {b:'v',c:'\u24e5\uff56\u1e7d\u1e7f\u028b\ua75f\u028c'},{b:'vy',c:'\ua761'},{b:'w',c:'\u24e6\uff57\u1e81\u1e83\u0175\u1e87\u1e85\u1e98\u1e89\u2c73'},{b:'x',c:'\u24e7\uff58\u1e8b\u1e8d'},{b:'y',c:'\u24e8\uff59\u1ef3\u00fd\u0177\u1ef9\u0233\u1e8f\u00ff\u1ef7\u1e99\u1ef5\u01b4\u024f\u1eff'},{b:'z',c:'\u24e9\uff5a\u017a\u1e91\u017c\u017e\u1e93\u1e95\u01b6\u0225\u0240\u2c6c\ua763'}];

for (var i=0; i <DIACRITICS.length; i+=1)
	for (var chars=DIACRITICS[i].c,j=0;j<chars.length;j+=1)
		DIACRITICSMAP[chars[j]]=DIACRITICS[i].b;

DIACRITICS = null;

var CONTENTTYPES = {
	'aac': 'audio/aac',
	'ai': 'application/postscript',
	'appcache': 'text/cache-manifest',
	'avi': 'video/avi',
	'bin': 'application/octet-stream',
	'bmp': 'image/bmp',
	'coffee': 'text/coffeescript',
	'css': 'text/css',
	'csv': 'text/csv',
	'doc': 'application/msword',
	'docx': 'application/msword',
	'dtd': 'application/xml-dtd',
	'eps': 'application/postscript',
	'exe': 'application/octet-stream',
	'geojson': 'application/json',
	'gif': 'image/gif',
	'gzip': 'application/x-gzip',
	'htm': 'text/html',
	'html': 'text/html',
	'ico': 'image/x-icon',
	'ics': 'text/calendar',
	'ifb': 'text/calendar',
	'jpe': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'jpg': 'image/jpeg',
	'js': 'text/javascript',
	'json': 'application/json',
	'jsx': 'text/jsx',
	'less': 'text/css',
	'm4a': 'audio/mp4a-latm',
	'm4v': 'video/x-m4v',
	'manifest': 'text/cache-manifest',
	'md': 'text/x-markdown',
	'mid': 'audio/midi',
	'midi': 'audio/midi',
	'mov': 'video/quicktime',
	'mp3': 'audio/mpeg',
	'mp4': 'video/mp4',
	'mpe': 'video/mpeg',
	'mpeg': 'video/mpeg',
	'mpg': 'video/mpeg',
	'mpga': 'audio/mpeg',
	'mtl': 'text/plain',
	'mv4': 'video/mv4',
	'obj': 'text/plain',
	'ogg': 'application/ogg',
	'ogv': 'video/ogg',
	'package': 'text/plain',
	'pdf': 'application/pdf',
	'png': 'image/png',
	'ppt': 'application/vnd.ms-powerpoint',
	'pptx': 'application/vnd.ms-powerpoint',
	'ps': 'application/postscript',
	'rar': 'application/x-rar-compressed',
	'rtf': 'text/rtf',
	'sass': 'text/css',
	'scss': 'text/css',
	'sh': 'application/x-sh',
	'stl': 'application/sla',
	'svg': 'image/svg+xml',
	'swf': 'application/x-shockwave-flash',
	'tar': 'application/x-tar',
	'tif': 'image/tiff',
	'tiff': 'image/tiff',
	'txt': 'text/plain',
	'wav': 'audio/x-wav',
	'webm': 'video/webm',
	'webp': 'image/webp',
	'woff': 'application/font-woff',
	'woff2': 'application/font-woff2',
	'xht': 'application/xhtml+xml',
	'xhtml': 'application/xhtml+xml',
	'xls': 'application/vnd.ms-excel',
	'xlsx': 'application/vnd.ms-excel',
	'xml': 'application/xml',
	'xpm': 'image/x-xpixmap',
	'xsl': 'application/xml',
	'xslt': 'application/xslt+xml',
	'zip': 'application/zip'
};

exports.getContentType = function(ext) {
	if (ext[0] === '.')
		ext = ext.substring(1);
	return CONTENTTYPES[ext.toLowerCase()] || 'application/octet-stream';
};

exports.getExtension = function(filename) {
	var index = filename.lastIndexOf('.');
	return index !== -1 && filename.indexOf('/', index - 1) === -1 ? filename.substring(index + 1) : '';
};

exports.getName = function(path) {
	var l = path.length - 1;
	var c = path[l];
	if (c === '/' || c === '\\')
		path = path.substring(0, l);
	var index = path.lastIndexOf('/');
	if (index !== -1)
		return path.substring(index + 1);
	index = path.lastIndexOf('\\');
	if (index !== -1)
		return path.substring(index + 1);
	return path;
};

function rnd() {
	return Math.floor(Math.random() * 65536).toString(36);
}

exports.GUID = function(max) {
	max = max || 40;
	var str = '';
	for (var i = 0; i < (max / 3) + 1; i++)
		str += rnd();
	return str.substring(0, max);
};

exports.streamer = function(beg, end, callback) {

	if (typeof(end) === 'function') {
		callback = end;
		end = undefined;
	}

	var indexer = 0;
	var buffer = exports.createBufferSize(0);

	beg = exports.createBuffer(beg, 'utf8');
	if (end)
		end = exports.createBuffer(end, 'utf8');

	if (!end) {
		var length = beg.length;
		return function(chunk) {

			if (!chunk)
				return;

			buffer = Buffer.concat([buffer, chunk]);

			var index = buffer.indexOf(beg);
			if (index === -1)
				return;

			while (index !== -1) {
				callback(buffer.toString('utf8', 0, index + length), indexer++);
				buffer = buffer.slice(index + length);
				index = buffer.indexOf(beg);
				if (index === -1)
					return;
			}
		};
	}

	var blength = beg.length;
	var elength = end.length;
	var bi = -1;
	var ei = -1;
	var is = false;

	return function(chunk) {

		if (!chunk)
			return;

		buffer = Buffer.concat([buffer, chunk]);

		if (!is) {
			bi = buffer.indexOf(beg);
			if (bi === -1)
				return;
			is = true;
		}

		if (is) {
			ei = buffer.indexOf(end, bi + blength);
			if (ei === -1)
				return;
		}

		while (bi !== -1) {
			callback(buffer.toString('utf8', bi, ei + elength), indexer++);
			buffer = buffer.slice(ei + elength);
			is = false;
			bi = buffer.indexOf(beg);
			if (bi === -1)
				return;
			is = true;
			ei = buffer.indexOf(end, bi + blength);
			if (ei === -1)
				return;
		}
	};
};

if (!String.prototype.padLeft) {
	String.prototype.padLeft = function(max, c) {
		var self = this;
		var len = max - self.length;
		if (len < 0)
			return self;
		if (c === undefined)
			c = ' ';
		while (len--)
			self = c + self;
		return self;
	};
}


if (!String.prototype.padRight) {
	String.prototype.padRight = function(max, c) {
		var self = this;
		var len = max - self.length;
		if (len < 0)
			return self;
		if (c === undefined)
			c = ' ';
		while (len--)
			self += c;
		return self;
	};
}

String.prototype.parseDateExpiration = function() {
	var self = this;

	var arr = self.split(' ');
	var dt = new Date();
	var length = arr.length;

	for (var i = 0; i < length; i += 2) {

		var num = arr[i].parseInt();
		if (num === 0)
			continue;

		var type = arr[i + 1] || '';
		if (type === '')
			continue;

		dt = dt.add(type, num);
	}

	return dt;
};

Date.prototype.add = function(type, value) {

	var self = this;

	if (type.constructor === Number)
		return new Date(self.getTime() + (type - type%1));

	if (value === undefined) {
		var arr = type.split(' ');
		type = arr[1];
		value = (arr[0] || '').parseInt();
	}

	var dt = new Date(self.getTime());

	switch(type) {
		case 's':
		case 'ss':
		case 'sec':
		case 'second':
		case 'seconds':
			dt.setSeconds(dt.getSeconds() + value);
			return dt;
		case 'm':
		case 'mm':
		case 'minute':
		case 'min':
		case 'minutes':
			dt.setMinutes(dt.getMinutes() + value);
			return dt;
		case 'h':
		case 'hh':
		case 'hour':
		case 'hours':
			dt.setHours(dt.getHours() + value);
			return dt;
		case 'd':
		case 'dd':
		case 'day':
		case 'days':
			dt.setDate(dt.getDate() + value);
			return dt;
		case 'w':
		case 'ww':
		case 'week':
		case 'weeks':
			dt.setDate(dt.getDate() + (value * 7));
			return dt;
		case 'M':
		case 'MM':
		case 'month':
		case 'months':
			dt.setMonth(dt.getMonth() + value);
			return dt;
		case 'y':
		case 'yyyy':
		case 'year':
		case 'years':
			dt.setFullYear(dt.getFullYear() + value);
			return dt;
	}
	return dt;
};

Number.prototype.format = function(decimals, separator, separatorDecimal) {

	var self = this;
	var num = self.toString();
	var dec = '';
	var output = '';
	var minus = num[0] === '-' ? '-' : '';
	if (minus)
		num = num.substring(1);

	var index = num.indexOf('.');

	if (typeof(decimals) === 'string') {
		var tmp = separator;
		separator = decimals;
		decimals = tmp;
	}

	if (separator === undefined)
		separator = ' ';

	if (index !== -1) {
		dec = num.substring(index + 1);
		num = num.substring(0, index);
	}

	index = -1;
	for (var i = num.length - 1; i >= 0; i--) {
		index++;
		if (index > 0 && index % 3 === 0)
			output = separator + output;
		output = num[i] + output;
	}

	if (decimals || dec.length) {
		if (dec.length > decimals)
			dec = dec.substring(0, decimals || 0);
		else
			dec = dec.padRight(decimals || 0, '0');
	}

	if (dec.length && separatorDecimal === undefined)
		separatorDecimal = separator === '.' ? ',' : '.';

	return minus + output + (dec.length ? separatorDecimal + dec : '');
};

Date.prototype.format = function(format) {

	var self = this;
	var half = false;

	if (format && format[0] === '!') {
		half = true;
		format = format.substring(1);
	}

	if (!format)
		return self.getFullYear() + '-' + (self.getMonth() + 1).toString().padLeft(2, '0') + '-' + self.getDate().toString().padLeft(2, '0') + 'T' + self.getHours().toString().padLeft(2, '0') + ':' + self.getMinutes().toString().padLeft(2, '0') + ':' + self.getSeconds().toString().padLeft(2, '0') + '.' + self.getMilliseconds().toString().padLeft(3, '0') + 'Z';

	var h = self.getHours();

	if (half) {
		if (h >= 12)
			h -= 12;
	}

	return format.replace(regexpDATEFORMAT, function(key) {
		switch (key) {
			case 'yyyy':
				return self.getFullYear();
			case 'yy':
				return self.getFullYear().toString().substring(2);
			case 'MMM':
				var m = MONTHS[self.getMonth()];
				return m.substring(0, 3);
			case 'MMMM':
				var m = MONTHS[self.getMonth()];
				return m;
			case 'MM':
				return (self.getMonth() + 1).toString().padLeft(2, '0');
			case 'M':
				return (self.getMonth() + 1);
			case 'ddd':
				var m = DAYS[self.getDay()];
				return m.substring(0, 3);
			case 'dddd':
				var m = DAYS[self.getDay()];
				return m;
			case 'dd':
				return self.getDate().toString().padLeft(2, '0');
			case 'd':
				return self.getDate();
			case 'HH':
			case 'hh':
				return h.toString().padLeft(2, '0');
			case 'H':
			case 'h':
				return self.getHours();
			case 'mm':
				return self.getMinutes().toString().padLeft(2, '0');
			case 'm':
				return self.getMinutes();
			case 'ss':
				return self.getSeconds().toString().padLeft(2, '0');
			case 's':
				return self.getSeconds();
			case 'w':
			case 'ww':
				var tmp = new Date(+self);
				tmp.setHours(0, 0, 0);
				tmp.setDate(tmp.getDate() + 4 - (tmp.getDay() || 7));
				tmp = Math.ceil((((tmp - new Date(tmp.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
				return key === 'ww' ? tmp.toString().padLeft(2, '0') : tmp;
			case 'a':
				var a = 'AM';
				if (self.getHours() >= 12)
					a = 'PM';
				return a;
		}
	});
};

String.prototype.parseInt = function(def) {
	var str = this.trim();
	var num = +str;
	return isNaN(num) ? (def || 0) : num;
};

if (!String.prototype.trim) {
	String.prototype.trim = function() {
		return this.replace(regexpTRIM, '');
	};
}

String.prototype.isJSONDate = function() {
	var l = this.length - 1;
	return l > 22 && l < 30 && this[l] === 'Z' && this[10] === 'T' && this[4] === '-' && this[13] === ':' && this[16] === ':';
};

Array.prototype.random = function() {

	var self = this;
	var random = (Math.floor(Math.random() * 100000000) * 10).toString();
	var index = 0;
	var old = 0;

	self.sort(function() {

		var c = random[index++];

		if (c === undefined) {
			c = random[0];
			index = 0;
		}

		if (old > c) {
			old = c;
			return -1;
		}

		if (old === c) {
			old = c;
			return 0;
		}

		old = c;
		return 1;
	});

	return self;
};

Array.prototype.limit = function(max, fn, callback, index) {

	if (index === undefined)
		index = 0;

	var current = [];
	var self = this;
	var length = index + max;

	for (var i = index; i < length; i++) {
		var item = self[i];

		if (item !== undefined) {
			current.push(item);
			continue;
		}

		if (!current.length) {
			callback && callback();
			return self;
		}

		fn(current, () => callback && callback(), index, index + max);
		return self;
	}

	if (!current.length) {
		callback && callback();
		return self;
	}

	fn(current, function() {

		if (length < self.length) {
			self.limit(max, fn, callback, length);
			return;
		}

		callback && callback();
	}, index, index + max);

	return self;
};

Array.prototype.quicksort = Array.prototype.orderBy = function(name, asc, maxlength) {

	var length = this.length;
	if (!length || length === 1)
		return this;

	if (typeof(name) === 'boolean') {
		asc = name;
		name = undefined;
	}

	if (maxlength === undefined)
		maxlength = 3;

	if (asc === undefined)
		asc = true;

	var self = this;
	var type = 0;
	var field = name ? self[0][name] : self[0];

	switch (typeof(field)) {
		case 'string':
			if (field.isJSONDate())
				type = 4;
			else
				type = 1;
			break;
		case 'number':
			type = 2;
			break;
		case 'boolean':
			type = 3;
			break;
		default:
			if (field instanceof Date)
				type = 4;
			else
				return self;
			break;
	}

	shellsort(self, function(a, b) {

		var va = name ? a[name] : a;
		var vb = name ? b[name] : b;

		// String
		if (type === 1) {
			if (va && vb)
				return asc ? va.substring(0, maxlength).removeDiacritics().localeCompare(vb.substring(0, maxlength).removeDiacritics()) : vb.substring(0, maxlength).removeDiacritics().localeCompare(va.substring(0, maxlength).removeDiacritics());
			return 0;
		} else if (type === 2) {
			if (va > vb)
				return asc ? 1 : -1;
			else if (va < vb)
				return asc ? -1 : 1;
			return 0;
		} else if (type === 3) {
			if (va === true && vb === false)
				return asc ? 1 : -1;
			else if (va === false && vb === true)
				return asc ? -1 : 1;
			return 0;
		} else if (type === 4) {
			if (!va || !vb)
				return 0;
			if (!va.getTime)
				va = new Date(va);
			if (!vb.getTime)
				vb = new Date(vb);
			if (va.getTime() > vb.getTime())
				return asc ? 1 : -1;
			else if (va.getTime() < vb.getTime())
				return asc ? -1 : 1;
			return 0;
		}

		return 0;
	});

	return self;
};

String.prototype.removeDiacritics = function() {
	return this.replace(regexpDiacritics, c => DIACRITICSMAP[c] || c);
};

String.prototype.startsWith = function(text, ignoreCase) {
	var self = this;
	var length = text.length;
	var tmp;

	if (ignoreCase === true) {
		tmp = self.substring(0, length);
		return tmp.length === length && tmp.toLowerCase() === text.toLowerCase();
	}

	if (ignoreCase)
		tmp = self.substr(ignoreCase, length);
	else
		tmp = self.substring(0, length);

	return tmp.length === length && tmp === text;
};


String.prototype.endsWith = function(text, ignoreCase) {
	var self = this;
	var length = text.length;
	var tmp;

	if (ignoreCase === true) {
		tmp = self.substring(self.length - length);
		return tmp.length === length && tmp.toLowerCase() === text.toLowerCase();
	}

	if (ignoreCase)
		tmp = self.substr((self.length - ignoreCase) - length, length);
	else
		tmp = self.substring(self.length - length);

	return tmp.length === length && tmp === text;
};

Array.prototype.wait = function(onItem, callback, thread) {

	var self = this;
	var init = false;

	// INIT
	if (!onItem.$index) {
		onItem.$pending = 0;
		onItem.$index = 0;
		init = true;
		if (typeof(callback) === 'number') {
			var tmp = thread;
			thread = callback;
			callback = tmp;
		}
	}

	if (thread === undefined)
		thread = 1;

	var item = thread === true ? self.shift() : self[onItem.$index];
	onItem.$index++;

	if (item === undefined) {
		if (onItem.$pending)
			return self;
		callback && callback();
		onItem.$index = 0;
		return self;
	}

	onItem.$pending++;
	onItem.call(self, item, function() {
		setImmediate(function() {
			onItem.$pending--;
			self.wait(onItem, callback, thread);
		});
	});

	if (!init || thread === true)
		return self;

	for (var i = 1; i < thread; i++)
		self.wait(onItem, callback, 0);

	return self;
};

String.prototype.parseInt2 = function(def) {
	var num = this.match(regexpINTEGER);
	return num ? +num : def || 0;
};

String.prototype.hash = function() {
	return string_hash(this);
};

function string_hash(s) {
	var hash = 0, i, char;
	if (s.length === 0)
		return hash;
	var l = s.length;
	for (i = 0; i < l; i++) {
		char = s.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
}

// =============================================
// SHELL SORT IMPLEMENTATION OF ALGORITHM
// =============================================

function _shellInsertionSort(list, length, gapSize, fn) {
	var temp, i, j;
	for (i = gapSize; i < length; i += gapSize ) {
		j = i;
		while(j > 0 && fn(list[j - gapSize], list[j]) === 1) {
			temp = list[j];
			list[j] = list[j - gapSize];
			list[j - gapSize] = temp;
			j -= gapSize;
		}
	}
}

function shellsort(arr, fn) {
	var length = arr.length;
	var gapSize = Math.floor(length / 2);
	while(gapSize) {
		_shellInsertionSort(arr, length, gapSize, fn);
		gapSize = Math.floor(gapSize / 2);
	}
	return arr;
}

if (NODEVERSION > 699) {
	exports.createBufferSize = (size) => Buffer.alloc(size || 0);
	exports.createBuffer = (val, type) => Buffer.from(val || '', type);
} else {
	exports.createBufferSize = (size) => new Buffer(size || 0);
	exports.createBuffer = (val, type) => new Buffer(val || '', type);
}
