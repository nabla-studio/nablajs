import { createContext, useContext } from 'react';
import { WalletOptions } from '@nabla-studio/keyring';
import { RNKeyring } from '@nabla-studio/rn-keyring';
import { stringToPath } from '@cosmjs/crypto';

export const walletsOptions: WalletOptions[] = [
	{
		hdpath: stringToPath("m/44'/639'/0'/0/0"),
		prefix: 'bitsong',
	},
	{
		hdpath: stringToPath("m/44'/118'/0'/0/0"),
		prefix: 'cosmos',
	},
];

export interface KeyringStorageMnemonicMetadata {
	isBip85?: boolean;
	index?: number;
}

export const keyring = new RNKeyring<undefined, KeyringStorageMnemonicMetadata>(
	'picowallet',
	walletsOptions,
	'picowalletsalt',
);

// TODO: Refactoring using context
export const RNKeyringStoreContext = createContext(keyring);
export const useKeyringStore = () => useContext(RNKeyringStoreContext);
