import { EnglishMnemonic, HdPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import {
	BIP39_LANGUAGES,
	BIP85,
	BIP85_WORD_LENGTHS,
} from '@nabla-studio/bip85';
import {
	EncryptResponse,
	Keyring,
	KeyringStorage,
	Nullable,
	Wallet,
	WalletOptions,
} from '@nabla-studio/keyring';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AES from 'react-native-aes-crypto';
import {
	AESEcrypted,
	AESMetadata,
	AESStorageOptions,
	AESWalletOptions,
} from './types';

export class RNKeyring extends Keyring<AESMetadata> {
	constructor(
		public override storageKey: string,
		public override walletsOptions: WalletOptions[],
		public salt: string,
		public storageOptions: AESStorageOptions = {
			pbkdf2cost: 5000,
			pbkdf2length: 256,
			randomKeyLength: 16,
			algorithm: 'aes-256-cbc',
		},
		public walletOptions: AESWalletOptions = {
			pbkdf2cost: 2048,
			pbkdf2length: 64,
		},
	) {
		super(storageKey, walletsOptions);
	}

	public override async generateMnemonicFromMaster(
		masterMnemonic: string,
		language: BIP39_LANGUAGES = 0,
		length: BIP85_WORD_LENGTHS = 24,
		index = 0,
		hdPaths: HdPath[],
		prefix: string,
	): Promise<DirectSecp256k1HdWallet> {
		const master = BIP85.fromMnemonic(masterMnemonic);
		const child = master.deriveBIP39(language, length, index);

		const mnemonic = child.toMnemonic();

		const { wallet } = await this.generateWalletFromMnemonic(
			mnemonic,
			hdPaths,
			prefix,
		);

		return wallet;
	}

	public override async generateWalletFromMnemonic(
		mnemonic: string,
		hdPaths: HdPath[],
		prefix: string,
	): Promise<Wallet> {
		const mnemonicChecked = new EnglishMnemonic(mnemonic);
		const seed = await this.mnemonicToSeed(mnemonic);

		/**
		 * We must ignore this, because the construct of  `DirectSecp256k1HdWallet` is protected, but this is the only way
		 * to create a `DirectSecp256k1HdWallet` instance without using `pbkdf2` from `@noble/hash`, which is very slow on react native
		 */
		// @ts-ignore
		const wallet: DirectSecp256k1HdWallet = new DirectSecp256k1HdWallet(
			mnemonicChecked,
			{
				seed,
				hdPaths,
				prefix,
			},
		);

		return {
			wallet,
			prefix,
		};
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
		const key = await this.generateKey(passphrase);
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
		const key = await this.generateKey(passphrase);

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

	private async generateKey(password: string) {
		const key = await AES.pbkdf2(
			password,
			this.salt,
			this.storageOptions.pbkdf2cost,
			this.storageOptions.pbkdf2length,
		);

		return key;
	}

	private async encryptData(text: string, key: string) {
		const iv = await AES.randomKey(this.storageOptions.randomKeyLength);

		const cipher = await AES.encrypt(
			text,
			key,
			iv,
			this.storageOptions.algorithm,
		);

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
			this.storageOptions.algorithm,
		);

		return decrypt;
	}

	private nfkd(str: string) {
		if (typeof str !== 'string') {
			throw new TypeError(`Invalid mnemonic type: ${typeof str}`);
		}
		return str.normalize('NFKD');
	}

	private normalize(str: string) {
		const norm = this.nfkd(str);
		const words = norm.split(' ');
		if (![12, 15, 18, 21, 24].includes(words.length)) {
			throw new Error('Invalid mnemonic');
		}
		return { nfkd: norm, words };
	}

	private async mnemonicToSeed(mnemonic: string, passphrase = '') {
		const salt = 'mnemonic' + (passphrase ? this.normalize(passphrase).nfkd : '');

		return await AES.pbkdf2(
			this.normalize(mnemonic).nfkd,
			salt,
			this.walletOptions.pbkdf2cost,
			this.walletOptions.pbkdf2length,
		);
	}
}
