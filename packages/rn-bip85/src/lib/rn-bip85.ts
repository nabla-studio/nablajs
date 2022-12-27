import { BIP85 } from '@nabla-studio/bip85';
import { mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export class RNBIP85 extends BIP85 {
	static override fromMnemonic(mnemonic: string, password = '') {
		if (!validateMnemonic(mnemonic, wordlist)) {
			throw new Error('Invalid mnemonic');
		}

		const seed = mnemonicToSeedSync(mnemonic, password);

		return BIP85.fromSeed(seed);
	}
}
