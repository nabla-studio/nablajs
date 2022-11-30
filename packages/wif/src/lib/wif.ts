// Porting of: https://github.com/bitcoinjs/wif/blob/master/index.js
import { sha256 } from '@noble/hashes/sha256';
import { base58check as _base58check } from '@scure/base';

const base58check = _base58check(buf =>
	Uint8Array.from(sha256.create().update(buf).digest()),
);

export const decodeRaw = (buffer: Uint8Array, version: number) => {
	if (version !== undefined && buffer[0] !== version) {
		throw new Error('Invalid network version');
	}

	// uncompressed
	if (buffer.length === 33) {
		return {
			version: buffer[0],
			privateKey: buffer.slice(1, 33),
			compressed: false,
		};
	}

	// invalid length
	if (buffer.length !== 34) {
		throw new Error('Invalid WIF length');
	}

	// invalid compression flag
	if (buffer[33] !== 0x01) {
		throw new Error('Invalid compression flag');
	}

	return {
		version: buffer[0],
		privateKey: buffer.slice(1, 33),
		compressed: true,
	};
};

export const decode = (data: string, version: number) => {
	return decodeRaw(base58check.decode(data), version);
};

export const encodeRaw = (
	version: number,
	privateKey: Buffer,
	compressed: boolean,
) => {
	if (privateKey.length !== 32) {
		throw new TypeError('Invalid privateKey length');
	}

	const result = Buffer.alloc(compressed ? 34 : 33);
	result.writeUInt8(version, 0);

	privateKey.copy(result, 1);

	if (compressed) {
		result[33] = 0x01;
	}

	return result;
};

export const encode = (
	version: number,
	privateKey: Buffer,
	compressed = false,
) => {
	return base58check.encode(encodeRaw(version, privateKey, compressed));
};
