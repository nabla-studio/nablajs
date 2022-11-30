import { HDKey } from '@scure/bip32';
import {
	mnemonicToSeed,
	entropyToMnemonic,
	validateMnemonic,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { sha512 } from '@noble/hashes/sha512';
import { hmac } from '@noble/hashes/hmac';
import { BIP85Child } from './bip85-child';
import {
	assertIsTypeOf,
	assertValidIndex,
	assertOutOfRange,
	assertIsDefined,
} from './utils';
import {
	BIP39_LANGUAGES,
	BIP85_WORD_LENGTHS,
	BIP85_DERIVATION_PATH,
	BIP85_APPLICATIONS,
	BIP85_KEY,
	BIP85_ENTROPY_LENGTHS,
} from './types';

export class BIP85 {
	private node: HDKey;

	constructor(node: HDKey) {
		this.node = node;
	}

	deriveBIP39(
		language: BIP39_LANGUAGES,
		words: BIP85_WORD_LENGTHS,
		index = 0,
	): BIP85Child {
		assertValidIndex(index);

		assertIsTypeOf<number>(language, 'number');

		assertOutOfRange(language, 0, 8);

		let entropyLength: BIP85_ENTROPY_LENGTHS = 16;

		switch (words) {
			case 12:
				entropyLength = 16;
				break;
			case 18:
				entropyLength = 24;
				break;
			case 24:
				entropyLength = 32;
				break;
			default:
				throw new Error('BIP39 invalid mnemonic length');
		}

		const entropy = this.derive(
			`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.BIP39}'/${language}'/${words}'/${index}'`,
			entropyLength,
		);

		return new BIP85Child(entropy, BIP85_APPLICATIONS.BIP39);
	}

	deriveWIF(index = 0): BIP85Child {
		assertValidIndex(index);

		const entropy = this.derive(
			`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.WIF}'/${index}'`,
			32,
		);

		return new BIP85Child(entropy, BIP85_APPLICATIONS.WIF);
	}

	deriveXPRV(index = 0): BIP85Child {
		assertValidIndex(index);

		const entropy = this.derive(
			`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.XPRV}'/${index}'`,
			64,
		);

		return new BIP85Child(entropy, BIP85_APPLICATIONS.XPRV);
	}

	deriveHex(numBytes: number, index = 0): BIP85Child {
		assertValidIndex(index);

		assertIsTypeOf<number>(numBytes, 'number');

		assertOutOfRange(numBytes, 16, 64);

		const entropy = this.derive(
			`m/${BIP85_DERIVATION_PATH}'/${BIP85_APPLICATIONS.HEX}'/${numBytes}'/${index}'`,
			numBytes,
		);

		return new BIP85Child(entropy, BIP85_APPLICATIONS.HEX);
	}

	derive(path: string, bytesLength = 64): string {
		const childNode = this.node.derive(path);

		// Child derived from root key always has private key
		assertIsDefined(childNode.privateKey);

		const hash = hmac(sha512, Buffer.from(BIP85_KEY), childNode.privateKey);

		const truncatedHash = hash.slice(0, bytesLength);

		const childEntropy: string = Buffer.from(truncatedHash).toString('hex');

		return childEntropy;
	}

	static fromBase58(bip32seed: string): BIP85 {
		const node = HDKey.fromExtendedKey(bip32seed);

		if (node.depth !== 0) {
			throw new Error('Expected master, got child');
		}

		return new BIP85(node);
	}

	static fromSeed(bip32seed: Buffer): BIP85 {
		const node = HDKey.fromMasterSeed(Buffer.from(bip32seed));

		if (node.depth !== 0) {
			throw new Error('Expected master, got child');
		}

		return new BIP85(node);
	}

	static fromEntropy(entropy: string, password = '') {
		const mnemonic = entropyToMnemonic(Buffer.from(entropy), wordlist);

		return BIP85.fromMnemonic(mnemonic, password);
	}

	static async fromMnemonic(mnemonic: string, password = '') {
		if (!validateMnemonic(mnemonic, wordlist)) {
			throw new Error('Invalid mnemonic');
		}

		const seed = await mnemonicToSeed(mnemonic, password);

		return BIP85.fromSeed(Buffer.from(seed));
	}
}
