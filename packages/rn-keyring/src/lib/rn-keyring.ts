import {
	EncryptResponse,
	Keyring,
	KeyringStorage,
	Nullable,
	WalletOptions,
} from '@nablajs/keyring';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AES from 'react-native-aes-crypto';
import { AESEcrypted, AESMetadata } from '../types';

export class RNKeyring extends Keyring<AESMetadata> {
	constructor(
		public salt: string,
		public override storageKey: string,
		public override walletsOptions: WalletOptions[],
	) {
		super(storageKey, walletsOptions);
	}

	protected async read(
		key: string,
	): Promise<Nullable<KeyringStorage<AESMetadata>>> {
		const data = await AsyncStorage.getItem(key);

		return data ? JSON.parse(data) : null;
	}

	protected async write(
		key: string,
		data: KeyringStorage<AESMetadata>,
	): Promise<boolean> {
		await AsyncStorage.setItem(key, JSON.stringify(data));

		return true;
	}

	protected async delete(key: string): Promise<boolean> {
		await AsyncStorage.removeItem(key);

		return true;
	}

	protected async encrypt(
		data: string,
		passphrase: string,
	): Promise<EncryptResponse<AESMetadata>> {
		const key = await this.generateKey(passphrase, this.salt, 5000, 16);
		const encryptionResult = await this.encryptData(data, key);

		return {
			cipherText: encryptionResult.cipher,
			cipheredMetadata: {
				iv: encryptionResult.iv,
			},
		};
	}

	protected async decrypt(
		data: EncryptResponse<AESMetadata>,
		passphrase: string,
	): Promise<string> {
		const key = await this.generateKey(passphrase, this.salt, 5000, 16);

		const encryptData: AESEcrypted = {
			cipherText: data.cipherText,
			iv: data.cipheredMetadata?.iv ?? '',
		};

		const decryptData = await this.decryptData(encryptData, key);

		return decryptData;
	}

	protected async hash(data: string): Promise<string> {
		const hashResult = await AES.sha512(data);

		return hashResult;
	}

	private async generateKey(
		password: string,
		salt: string,
		cost: number,
		length: number,
	) {
		const key = await AES.pbkdf2(password, salt, cost, length);

		return key;
	}

	private async encryptData(text: string, key: string) {
		const iv = await AES.randomKey(16);

		const cipher = await AES.encrypt(text, key, iv, 'aes-256-cbc');

		return {
			cipher,
			iv,
		};
	}

	private async decryptData(encryptedData: AESEcrypted, key: string) {
		const decrypt = await AES.decrypt(
			encryptedData.cipherText,
			key,
			encryptedData.iv,
			'aes-256-cbc',
		);

		return decrypt;
	}
}
