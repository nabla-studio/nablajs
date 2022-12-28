import { BIP85 } from '@nabla-studio/bip85';
import { mnemonicToSeed } from '@nabla-studio/utils';
import { stringToBytes } from '@scure/base';
import { validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export class RNBIP85 extends BIP85 {
	static override async fromMnemonic(mnemonic: string, password = '') {
		if (!validateMnemonic(mnemonic, wordlist)) {
			throw new Error('Invalid mnemonic');
		}

		const seed = await mnemonicToSeed(mnemonic, password);

		return BIP85.fromSeed(stringToBytes('utf8', seed));
	}
}
