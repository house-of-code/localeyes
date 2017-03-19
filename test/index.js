'use strict';

const localeyes = require('../'),
	expect = require('chai').expect;

const locales = {
	en: {
		strings: {
			my: {
				localized: {
					key: '${cap:0} is a ${1} cool test!'
				}
			},
			this: 'this',
			very: 'very'
		},
		transforms: {
			cap: (val) => {
				return val.substr(0,1).toUpperCase() + val.substr(1);
			}
		}
	},
	da: {
		strings: {
			my: {
				localized: {
					key: '${cap:0} er en ${1} sej test!'
				}
			},
			this: 'dette',
			very: 'meget'
		},
		transforms: {
			cap: (val) => {
				return val.substr(0,1).toUpperCase() + val.substr(1);
			}
		}
	}
};

it ('should come back with instance of LocalEyes', () => {
	const localize = localeyes(locales);
	expect(localize).to.be.instanceof(localeyes);
	expect(localize.languages).to.be.an('Array').of.length(2);
});

it ('should come back with already configured instance of LocalEyes', () => {
	const localize = localeyes();
	expect(localize).to.be.instanceof(localeyes);
	expect(localize.languages).to.be.an('Array').of.length(2);
});

it ('should come back with languages', () => {
	expect(localeyes().lang('en').language).to.equal('en');
	expect(localeyes().lang('da').language).to.equal('da');
});

it ('should come back with string translated to danish', () => {
	expect(localeyes().lang('da').get('my.localized.key', 'this', 'very')).to.equal('Dette er en meget sej test!');
});

it ('should come back with default language if language not found', () => {
	expect(localeyes().lang('se').get('my.localized.key', 'this', 'very')).to.equal('This is a very cool test!');
});

it ('should come back with keypath if string is not found', () => {
	expect(localeyes().lang('en').get('non.existing.key')).to.equal('non.existing.key');
});

it ('should come back with all languages', () => {
	let res = localeyes().all('my.localized.key', 'this', 'very');
	expect(res).to.be.an('object').with.property('en').to.equal('This is a very cool test!');
	expect(res).to.be.an('object').with.property('da').to.equal('Dette er en meget sej test!');
});
