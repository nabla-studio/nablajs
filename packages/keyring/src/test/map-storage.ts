import { Keyring } from '../lib';
import { EncryptResponse, KeyringStorage, Nullable } from '../types';
import { aes, random, pbkdf, hash } from 'js-crypto-utils';

/**
 * AES extra data for encryption
 */
interface AESMetadata {
	iv: string;
}

interface AESEcrypted {
	cipher: Uint8Array;
	iv: Uint8Array;
}

/**
 * User for storage data simulation
 */
const storage = new Map<string, Nullable<string>>();

export class TestKeyring extends Keyring<AESMetadata> {
	salt = Buffer.from('salt');

	protected async read(
		key: string,
	): Promise<Nullable<KeyringStorage<AESMetadata, undefined>>> {
		const data = await storage.get(key);

		if (!data) {
			return null;
		}

		return JSON.parse(data);
	}

	protected async write(
		key: string,
		data: KeyringStorage<AESMetadata, undefined>,
	): Promise<boolean> {
		await storage.set(key, JSON.stringify(data));

		return true;
	}

	protected async delete(key: string): Promise<boolean> {
		await storage.delete(key);

		return true;
	}

	protected async encrypt(
		data: string,
		passphrase: string,
	): Promise<EncryptResponse<AESMetadata>> {
		const text = Buffer.from(data);

		const key = await this.generateKey(passphrase, this.salt, 5000, 16);
		const encryptionResult = await this.encryptData(text, key);

		const cipherText = Buffer.from(encryptionResult.cipher).toString('hex');
		const iv = Buffer.from(encryptionResult.iv).toString('hex');

		return {
			cipherText,
			cipheredMetadata: {
				iv,
			},
		};
	}

	protected async decrypt(
		data: EncryptResponse<AESMetadata>,
		passphrase: string,
	): Promise<string> {
		const encryptData: AESEcrypted = {
			cipher: Buffer.from(data.cipherText, 'hex'),
			iv: Buffer.from(data.cipheredMetadata?.iv ?? '', 'hex'),
		};

		const key = await this.generateKey(passphrase, this.salt, 5000, 256);

		const decryptData = await this.decryptData(encryptData, key);

		return Buffer.from(decryptData).toString('hex');
	}

	protected async hash(data: string): Promise<string> {
		const payload = Buffer.from(data);

		const hashResult = await hash.compute(payload, 'SHA-512');

		const buffer = Buffer.from(hashResult);

		return buffer.toString('hex');
	}

	private async generateKey(
		password: string,
		salt: Uint8Array,
		cost: number,
		length: number,
	) {
		const key = await pbkdf.pbkdf2(password, salt, cost, length, 'SHA-512');

		return key;
	}

	private async encryptData(text: Uint8Array, key: Uint8Array) {
		const iv = await random.getRandomBytes(16);

		const cipher = await aes.encrypt(text, key, { name: 'AES-CBC', iv });

		return {
			cipher,
			iv,
		};
	}

	private async decryptData(encryptedData: AESEcrypted, key: Uint8Array) {
		const decrypt = await aes.decrypt(encryptedData.cipher, key, {
			name: 'AES-CBC',
			iv: encryptedData.iv,
		});

		return decrypt;
	}
}
