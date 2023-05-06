import QuickCrypto from 'react-native-quick-crypto';
import { Buffer } from '@craftzdog/react-native-buffer';
import { BIP39_LANGUAGES, BIP85_WORD_LENGTHS } from '@nabla-studio/bip85';
import { RNBIP85 } from '@nabla-studio/rn-bip85';
import {
	EncryptResponse,
	Keyring,
	KeyringStorage,
	Nullable,
	WalletOptions,
} from '@nabla-studio/keyring';
import { MMKV } from 'react-native-mmkv';
import { AESEcrypted, AESMetadata, AESStorageOptions } from './types';

function ab2str(buf: ArrayBuffer, encoding = 'hex') {
	return Buffer.from(buf).toString(encoding);
}

function str2ab(buf: string, encoding = 'hex') {
	return Buffer.from(buf, encoding);
}

export class RNKeyring<K = undefined, R = undefined> extends Keyring<
	AESMetadata,
	K,
	R
> {
	private storage: MMKV;

	constructor(
		public override storageKey: string,
		public override walletsOptions: WalletOptions[],
		public salt: string,
		public readonly storageId = 'custom-keyring-storage',
		public storageOptions: AESStorageOptions = {
			pbkdf2cost: 5000,
			pbkdf2length: 16,
			randomKeyType: 'aes',
			randomKeyLength: 16,
			algorithm: 'aes-256-ctr',
		},
	) {
		super(storageKey, walletsOptions);

		this.storage = new MMKV({
			id: storageId,
		});
	}

	public override async generateMnemonicFromMaster(
		masterMnemonic: string,
		language: BIP39_LANGUAGES = 0,
		length: BIP85_WORD_LENGTHS = 24,
		index = 0,
	): Promise<string> {
		const master = await RNBIP85.fromMnemonic(masterMnemonic);
		const child = master.deriveBIP39(language, length, index);

		const mnemonic = child.toMnemonic();

		return mnemonic;
	}

	protected async read(
		key: string,
	): Promise<Nullable<KeyringStorage<AESMetadata, K, R>>> {
		const data = await this.storage.getString(key);

		return data ? JSON.parse(data) : null;
	}

	protected async write(
		key: string,
		data: KeyringStorage<AESMetadata, K, R>,
	): Promise<boolean> {
		await this.storage.set(key, JSON.stringify(data));

		return true;
	}

	protected async delete(key: string): Promise<boolean> {
		await this.storage.delete(key);

		return true;
	}

	protected async encrypt(
		data: string,
		passphrase: string,
	): Promise<EncryptResponse<AESMetadata>> {
		const key = await this.generateKey(passphrase);
		const encryptionResult = await this.encryptData(data, key);

		return {
			cipherText: ab2str(encryptionResult.cipher as ArrayBuffer),
			cipheredMetadata: {
				iv: ab2str(encryptionResult.iv),
			},
		};
	}

	protected async decrypt(
		data: EncryptResponse<AESMetadata>,
		passphrase: string,
	): Promise<string> {
		const key = await this.generateKey(passphrase);

		const encryptData: AESEcrypted = {
			cipherText: data.cipherText,
			iv: data.cipheredMetadata?.iv ?? '',
		};

		const decryptData = await this.decryptData(encryptData, key);

		return decryptData as string;
	}

	/**
	 * @returns hex hash
	 */
	protected async hash(data: string): Promise<string> {
		const hashResult = await QuickCrypto.createHash('sha512')
			.update(data)
			.digest('hex');

		return hashResult;
	}

	private async generateKey(password: string) {
		const key = await QuickCrypto.pbkdf2Sync(
			password,
			this.salt,
			this.storageOptions.pbkdf2cost,
			this.storageOptions.pbkdf2length,
		);

		return ab2str(key);
	}

	private async encryptData(text: string, key: string) {
		const iv = QuickCrypto.randomBytes(this.storageOptions.randomKeyLength);

		const cipher = await QuickCrypto.createCipheriv(
			this.storageOptions.algorithm,
			key,
			iv,
		).update(text);

		return {
			cipher,
			iv,
		};
	}

	private async decryptData(encryptedData: AESEcrypted, key: string) {
		const decrypt = await QuickCrypto.createDecipheriv(
			this.storageOptions.algorithm,
			key,
			str2ab(encryptedData.iv),
		).update(str2ab(encryptedData.cipherText, 'hex'));

		return ab2str(decrypt as ArrayBuffer, 'utf-8');
	}
}
