export type KeyringStorageMnemonic<T> = T & {
	name: string;
	/**
	 * A cipher text mnemonic, must be decrypted to be used
	 */
	mnemonic: string;
};
