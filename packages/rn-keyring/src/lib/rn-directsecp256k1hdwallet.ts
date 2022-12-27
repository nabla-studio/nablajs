import {
	DirectSecp256k1HdWallet,
	DirectSecp256k1HdWalletOptions,
} from '@cosmjs/proto-signing';
import { EnglishMnemonic } from '@cosmjs/crypto';
import { stringToBytes } from '@scure/base';
import { mnemonicToSeed } from '@nabla-studio/utils';

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
		const seed = await mnemonicToSeed(
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
}
