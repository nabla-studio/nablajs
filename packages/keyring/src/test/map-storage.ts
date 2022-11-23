import { Keyring } from '../lib';
import { EncryptResponse, KeyringStorage, Nullable } from '../types';

/**
 * AES extra data for encryption
 */
interface AESMetadata {
	iv: string;
}

/**
 * User for storage data simulation
 */
const storage = new Map<string, Nullable<string>>();

export class TestKeyring extends Keyring<AESMetadata> {
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

	protected encrypt(
		data: string,
		key: string,
	): Promise<EncryptResponse<AESMetadata>> {
		throw new Error('Method not implemented.');
	}

	protected decrypt(
		data: EncryptResponse<AESMetadata>,
		key: string,
	): Promise<string> {
		throw new Error('Method not implemented.');
	}

	protected hash(data: string): Promise<string> {
		throw new Error('Method not implemented.');
	}
}
