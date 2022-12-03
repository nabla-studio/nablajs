export interface AESMetadata {
	iv: string;
}

export interface AESEcrypted extends AESMetadata {
	cipherText: string;
}
