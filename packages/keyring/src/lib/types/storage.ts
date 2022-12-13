/**
 * The data structure that define a mnemonic stored inside a storage
 *
 * @interface KeyringStorageMnemonic
 * @typeParam T - Object, corresponding to information linked to encryption/decryption activities (e.g., the **IV** for an AES method encryption, parameters for the key generation method).
 * @typeParam R - Object, for optional metadata
 */
export interface KeyringStorageMnemonic<T = undefined, R = undefined> {
	name: string;
	/**
	 * A cipher text mnemonic, must be decrypted to be used
	 */
	cipherText: string;
	cipheredMetadata?: T;
	metadata?: R;
}

/**
 * The data structure that is managed by the keyring
 *
 * @interface KeyringStorage
 * @typeParam T - Object, corresponding to information linked to encryption/decryption activities (e.g., the **IV** for an AES method encryption, parameters for the key generation method).
 * @typeParam K - Object, that contains information about the cipher method (e.g., the **cipherType**, the **keyLength**, the **keyGenerationMethod**, etc.)
 * @typeParam R - Object, for optional metadata
 */
export interface KeyringStorage<T = undefined, K = undefined, R = undefined> {
	passphraseHash: string;
	currentMnemonicIndex: number;
	mnemonics: KeyringStorageMnemonic<T, R>[];
	cipherMetadata?: K;
}
