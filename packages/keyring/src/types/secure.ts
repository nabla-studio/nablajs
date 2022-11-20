/**
 * The data structure that define a encryption algorithm response
 *
 * @interface EncryptResponse
 * @typeParam T - Object, corresponding to information linked to encryption/decryption activities (e.g., the **IV** for an AES method encryption, parameters for the key generation method).
 */
export interface EncryptResponse<T> {
	cipherText: string;
	cipheredMetadata?: T;
}
