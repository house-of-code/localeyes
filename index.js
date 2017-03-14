'use strict';

const keyd = require('keyd');

let configured;

module.exports = exports = function LocalEyes(locales, options) {

	if (typeof locales === 'undefined' && typeof options === 'undefined') {
		return configured;
	}

	if (!(this instanceof LocalEyes)) return new LocalEyes(locales, options);

	options = options || {};

	this.locales = locales;
	this.defaultLanguage = options.defaultLanguage || Object.keys(locales)[0];

	configured = this;

	this._locale = (accepts) => {
		return (accepts || '')
			.split(/, ?/)
			.map((accept) => this.locales[accept.split(/; ?/)[0]] )
			.filter(locale => locale)[0] || this.locales[this.defaultLanguage];
	};

	this.lang = (accepts) => {

		const locale = this._locale(accepts);

		return {
			get: (keypath, ...args) => {

				let res = keyd(locale.strings).get(keypath);

				if (!res) return keypath;

				let m;

				while (typeof res.match === 'function' && (m = res.match(/\${(?:([a-z]+):)?([0-9]+)(?::(.+))?}/i))) {
					let [r,t,i,p] = m;
					res = res.replace(r, (t ? locale.transforms[t](args[i], p) : args[i]));
				}

				return res;

			},
			strings: locale.strings
		};

	};

	if (typeof window !== 'undefined') {
		this.browser = () => {
			return this.lang(navigator.language || navigator.userLanguage);
		};
	}

	this.all = function(keypath, ...args) {
		return Object.keys(this.locales).reduce((result, language) => {
			let ret = result;
			ret[language] = this.lang(language).get(keypath, ...args);
			return ret;
		}, {});
	};

	this.languages = Object.keys(this.locales);

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
			let missing = scanNext(locales[locale].strings, locales[this.defaultLanguage].strings, []);
			if (missing.length > 0) {
				console.warn(`WARN: Missing translations for ${locale}:`);
				missing.forEach((missing) => {
					console.warn(`  ${missing}`);
				});
			}
		});

	}

};
