import AES from 'react-native-aes-crypto';

export interface AESMetadata {
	iv: string;
}

export interface AESEcrypted extends AESMetadata {
	cipherText: string;
}

export interface AESWalletOptions {
	pbkdf2cost: number;
	pbkdf2length: number;
}

export interface AESStorageOptions {
	pbkdf2cost: number;
	pbkdf2length: number;
	randomKeyLength: number;
	algorithm: AES.Algorithms;
}
