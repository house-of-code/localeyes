'use strict';

const keyd = require('keyd');

let configured;

module.exports = exports = function LocalEyes(locales, options) {

	if (typeof locales === 'undefined' && typeof options === 'undefined') {
		return configured;
	}

	if (!(this instanceof LocalEyes)) return new LocalEyes(locales, options);

	options = options || {};

	let _locales = locales;
	const _defaultLanguage = options.defaultLanguage || Object.keys(locales)[0];

	this.defaultLanguage = _defaultLanguage;

	Object.keys(_locales).forEach((language) => {
		_locales[language]._identifier = language;
	});

	configured = this;

	const _locale = (accepts) => {
		return (accepts || '')
			.split(/, ?/)
			.map((accept) => _locales[accept.split(/; ?/)[0]] )
			.filter(locale => locale)[0] || _locales[_defaultLanguage];
	};

	function Locale(accepts) {

		if (!(this instanceof Locale)) return new Locale(accepts);

		const locale = _locale(accepts);

		this.get = (keypath, ...args) => {

			let res = keyd(locale.strings).get(keypath);

			if (typeof res === 'undefined') {
				if (typeof this.defaultValue === 'undefined') return keypath;
				return this.defaultValue;
			}

			if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0])) {
				args = args[0];
			}

			let m;

			while (typeof res.match === 'function' && (m = res.match(/\${(?:([a-z]+):)?([0-9a-z_\-]+)(?::(.+))?}/i))) {
				let [r,t,i,p] = m;
				i = args[i];
				if (i && typeof i === 'string') i = this.get(i);
				res = res.replace(r, (t ? locale.transforms[t](i, p) : i));
			}

			return res;

		};

		this.strings = locale.strings;
		this.language = locale._identifier;

		this.default = (value) => {
			this.defaultValue = value;
			return this;
		};

	}

	this.lang = Locale;

	if (typeof window !== 'undefined') {
		this.browser = this.lang(navigator.language || navigator.userLanguage);
	}

	this.all = function(keypath, ...args) {
		return Object.keys(_locales).reduce((result, language) => {
			let ret = result;
			ret[language] = this.lang(language).get(keypath, ...args);
			return ret;
		}, {});
	};

	this.languages = Object.keys(_locales);

	if (options.warnMissing) {

		let scanNext = (strings, reference, keypath) => {
			return Object.keys(reference)
				.map(key => {
					let keys = keypath.concat(key);
					if (typeof strings[key] !== typeof reference[key]) return keys.join('.');
					if (typeof reference[key] === 'object') {
						return scanNext(strings[key], reference[key], keys);
					}
				})
				.filter(keys => keys)
				.reduce((memo, item) => memo.concat(item), []);
		};
		Object.keys(locales).slice(1).forEach((locale) => {
			let missing = scanNext(locales[locale].strings, locales[_defaultLanguage].strings, []);
			if (missing.length > 0) {
				console.warn(`WARN: Missing translations for ${locale}:`);
				missing.forEach((missing) => {
					console.warn(`  ${missing}`);
				});
			}
		});

	}

};
