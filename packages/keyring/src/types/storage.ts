export type KeyringStorageMnemonic<T extends object> = T & {
	name: string;
	/**
	 * A cipher text mnemonic, must be decrypted to be used
	 */
	mnemonic: string;
};
