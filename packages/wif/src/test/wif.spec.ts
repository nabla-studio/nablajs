import { encode, decode } from '../lib/wif';
import { valid, invalid } from './data.testdata';

describe('WIF Testing', () => {
	for (const f of valid) {
		it(`encode/encodeRaw returns ${f.WIF} for ${f.privateKeyHex.slice(
			0,
			20,
		)}... (${f.version})`, () => {
			const privateKey = Buffer.from(f.privateKeyHex, 'hex');
			const actual = encode(f.version, privateKey, f.compressed);

			expect(actual).toEqual(f.WIF);
		});
	}

	for (const f of valid) {
		it(`decode/decodeRaw returns ${f.privateKeyHex.slice(0, 20)}... (${
			f.version
		}) for ${f.WIF}`, () => {
			const actual = decode(f.WIF, f.version);

			expect(actual.version).toEqual(f.version);
			expect(Buffer.from(actual.privateKey).toString('hex')).toEqual(
				f.privateKeyHex,
			);
			expect(actual.compressed).toEqual(f.compressed);
		});
	}

	for (const f of invalid.encode) {
		it(`throws ${f.exception} for ${f.privateKeyHex}`, () => {
			expect(() => encode(f.version, Buffer.from(f.privateKeyHex, 'hex'))).toThrow(
				new RegExp(f.exception),
			);
		});
	}

	for (const f of invalid.decode) {
		it(`throws ${f.exception} for ${f.WIF}`, () => {
			expect(() => decode(f.WIF, f.version)).toThrow(new RegExp(f.exception));
		});
	}

	for (const f of valid) {
		it(`decode/encode for ${f.WIF}`, () => {
			const decoded = decode(f.WIF, f.version);
			const actual = encode(
				decoded.version,
				Buffer.from(decoded.privateKey),
				decoded.compressed,
			);

			expect(actual).toEqual(f.WIF);
		});
	}
});
