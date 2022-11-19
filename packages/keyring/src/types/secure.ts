export type EncryptResponse<T> = T & {
	cipherText: string;
};
