export type EncryptResponse<T extends object> = T & {
	cipherText: string;
};
