import {
	DirectSecp256k1HdWallet,
	DirectSecp256k1HdWalletOptions,
} from '@cosmjs/proto-signing';
import { EnglishMnemonic } from '@cosmjs/crypto';
import AES from 'react-native-aes-crypto';
import { stringToBytes } from '@scure/base';

/**
 * We must implement this, because the construct of  `DirectSecp256k1HdWallet` is protected, and this is the only way
 * to create a `DirectSecp256k1HdWallet` instance without using `pbkdf2` from `@noble/hash`, which is very slow on react native
 */
export class RNDirectSecp256k1HdWallet extends DirectSecp256k1HdWallet {
	static override async fromMnemonic(
		mnemonic: string,
		options?: Partial<DirectSecp256k1HdWalletOptions>,
		pbkdf2cost = 2048,
		pbkdf2length = 64,
	): Promise<DirectSecp256k1HdWallet> {
		const mnemonicChecked = new EnglishMnemonic(mnemonic);
		const seed = await this.mnemonicToSeed(
			mnemonic,
			options?.bip39Password ?? '',
			pbkdf2cost,
			pbkdf2length,
		);

		return new DirectSecp256k1HdWallet(mnemonicChecked, {
			...options,
			seed: stringToBytes('utf8', seed),
		});
	}

	private static nfkd(str: string) {
		if (typeof str !== 'string') {
			throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
		}
		return str.normalize('NFKD');
	}

	private static normalize(str: string) {
		const norm = this.nfkd(str);
		const words = norm.split(' ');
		if (![12, 15, 18, 21, 24].includes(words.length)) {
			throw new Error('Invalid mnemonic');
		}
		return { nfkd: norm, words };
	}

	private static async mnemonicToSeed(
		mnemonic: string,
		passphrase = '',
		pbkdf2cost = 2048,
		pbkdf2length = 64,
	) {
		const salt = 'mnemonic' + (passphrase ? this.normalize(passphrase).nfkd : '');

		return await AES.pbkdf2(
			this.normalize(mnemonic).nfkd,
			salt,
			pbkdf2cost,
			pbkdf2length,
		);
	}
}
