'use strict';

const localeyes = require('../'),
	expect = require('chai').expect;

const locales = {
	en: {
		strings: {
			my: {
				localized: {
					key: 'This is a ${cool:0:very} test!'
				}
			}
		},
		transforms: {
			cool: (val, arg) => {
				return `${arg} ${val}`;
			}
		}
	},
	da: {
		strings: {
			my: {
				localized: {
					key: 'Dette er en ${sej:0:meget} test!'
				}
			}
		},
		transforms: {
			sej: (val, arg) => {
				if (val == 'cool') val = 'sej';
				return `${arg} ${val}`;
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

it ('should come back with string translated to danish', () => {
	expect(localeyes().lang('da').get('my.localized.key', 'cool')).to.equal('Dette er en meget sej test!');
});

it ('should come back with default language if language not found', () => {
	expect(localeyes().lang('se').get('my.localized.key', 'cool')).to.equal('This is a very cool test!');
});

it ('should come back with keypath if string is not found', () => {
	expect(localeyes().lang('en').get('non.existing.key')).to.equal('non.existing.key');
});
