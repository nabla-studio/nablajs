import { encode } from '@nabla-studio/wif';
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

		return entropyToMnemonic(Buffer.from(this.entropy), wordlist);
	}

	toWIF(): string {
		if (this.type !== BIP85_APPLICATIONS.WIF) {
			throw new Error('BIP85Child type is not WIF');
		}

		const buf = Buffer.from(this.entropy, 'hex');

		return encode(128, buf, true);
	}

	toXPRV(): string {
		if (this.type !== BIP85_APPLICATIONS.XPRV) {
			throw new Error('BIP85Child type is not XPRV');
		}

		const chainCode = Buffer.from(this.entropy.slice(0, 64), 'hex');
		const privateKey = Buffer.from(this.entropy.slice(64, 128), 'hex');

		const hdkey = new HDKey({
			privateKey,
			chainCode,
			versions: {
				public: 0,
				private: 0,
			},
		});

		return hdkey.privateExtendedKey;
	}
}
