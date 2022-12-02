import { encode } from '@nabla-studio/wif';
import { hexToBytes } from '@noble/hashes/utils';
import { stringToBytes } from '@scure/base';
import { HDKey } from '@scure/bip32';
import { entropyToMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { BIP85_APPLICATIONS } from './types';

export class BIP85Child {
	constructor(
		private readonly entropy: string,
		private readonly type: BIP85_APPLICATIONS,
	) {}

	toEntropy(): string {
		if (this.type === BIP85_APPLICATIONS.XPRV) {
			return this.entropy.slice(64, 128);
		} else {
			return this.entropy;
		}
	}

	toMnemonic(): string {
		if (this.type !== BIP85_APPLICATIONS.BIP39) {
			throw new Error('BIP85Child type is not BIP39');
		}

		return entropyToMnemonic(hexToBytes(this.entropy), wordlist);
	}

	toWIF(): string {
		if (this.type !== BIP85_APPLICATIONS.WIF) {
			throw new Error('BIP85Child type is not WIF');
		}

		const buf = hexToBytes(this.entropy);

		return encode(128, buf, true);
	}

	toXPRV(): string {
		if (this.type !== BIP85_APPLICATIONS.XPRV) {
			throw new Error('BIP85Child type is not XPRV');
		}

		const chainCode = hexToBytes(this.entropy.slice(0, 64));
		const privateKey = hexToBytes(this.entropy.slice(64, 128));

		const hdkey = new HDKey({
			privateKey,
			chainCode,
			versions: {
				// reference: https://github.com/bitcoinjs/bip32/blob/1123a9f82bfbe71028e545e39973d93b86fa7197/ts-src/bip32.ts#L106
				public: 0x0488b21e,
				private: 0x0488ade4,
			},
		});

		return hdkey.privateExtendedKey;
	}
}
