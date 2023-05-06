export interface AESMetadata {
	iv: string;
}

export interface AESEcrypted extends AESMetadata {
	cipherText: string;
}

export interface AESStorageOptions {
	pbkdf2cost: number;
	/**
	 * PBKDF2 length defined in bytes
	 */
	pbkdf2length: number;
	randomKeyType: 'hmac' | 'aes';
	randomKeyLength: number;
	algorithm: string;
}
