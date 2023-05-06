import { AccountData, DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { HdPath } from '@cosmjs/crypto';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import {
	WalletLength,
	WalletOptions,
	Wallet,
	EncryptResponse,
	KeyringStorage,
	KeyringStorageMnemonic,
	assertIsDefined,
	Nullable,
	assertKeyringUnlocked,
	assertOutOfIndex,
	WalletDataResponse,
} from './types';
import {
	BIP85,
	BIP85_WORD_LENGTHS,
	BIP39_LANGUAGES,
} from '@nabla-studio/bip85';
import {
	makeObservable,
	observable,
	action,
	flow,
	computed,
	runInAction,
} from 'mobx';

/**
 * Definition of Keyring class structure,
 * it's the core of the of private and public key management.
 * The structure is divided into two parts, fixed methods that are used for specific operations
 * and a set of abstract methods that define some atomic operations
 * that can be exploited by the previous methods.
 *
 * @typeParam T - Object, corresponding to information linked to encryption/decryption activities (e.g., the **IV** for an AES method encryption, parameters for the key generation method).
 * @typeParam K - Object, that contains information about the cipher method (e.g., the **cipherType**, the **keyLength**, the **keyGenerationMethod**, etc.)
 * @typeParam R - Object, for optional metadata
 */
export abstract class Keyring<T = undefined, K = undefined, R = undefined> {
	/**
	 * @private
	 * current passphrase used for mnemonics encryption
	 */
	private passphrase?: string = undefined;

	/**
	 * @public
	 * the mnemonics currently selected to operate
	 */
	public currentMnemonic?: string = undefined;

	/**
	 * @public
	 * current wallets associated with current mnemonic
	 */
	public currentWallets: Wallet[] = [];

	public currentAccounts: AccountData[] = [];

	/**
	 * @param storageKey - A unique identifier to locate the storage area for Keyring management
	 * @param walletsOptions - An array of `WalletOptions` used for wallets generation
	 */
	constructor(
		public storageKey: string = 'keyring',
		public walletsOptions: WalletOptions[],
		public cipherMetadata?: K,
	) {
		makeObservable<this, 'passphrase' | 'setCurrentMnemonic'>(this, {
			currentMnemonic: observable,
			passphrase: observable,
			currentWallets: observable,
			currentAccounts: observable,
			init: flow,
			unlock: flow,
			lock: action,
			wallets: action,
			accounts: action,
			setCurrentMnemonic: action,
			saveMnemonic: flow,
			editMnemonic: flow,
			deleteMnemonic: flow,
			changeCurrentMnemonic: flow,
			reset: flow,
			unlocked: computed,
		});
	}

	/**
	 * @public
	 * Generates a new wallet from a BIP39 master mnemonic using BIP85.
	 * @optional language - Language identification code, for more info: https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki#bip39
	 * @optional length - The number of words in the mnemonic (12, 18 or 24).
	 * @optional index - The account index
	 * @returns Returns a mnemonic string
	 */
	public async generateMnemonicFromMaster(
		masterMnemonic: string,
		language: BIP39_LANGUAGES = 0,
		length: BIP85_WORD_LENGTHS = 24,
		index = 0,
	): Promise<string> {
		const master = await BIP85.fromMnemonic(masterMnemonic);
		const child = master.deriveBIP39(language, length, index);

		const mnemonic = child.toMnemonic();

		return mnemonic;
	}

	/**
	 * @public
	 * Generates a new wallet with a BIP39 mnemonic of the given length.
	 * @optional length - The number of words in the mnemonic (12 or 24).
	 * @returns Returns a mnemonic string
	 */
	public generateMnemonic(length?: WalletLength): string {
		let strength = 256;

		switch (length) {
			case 12:
				strength = 128;
				break;
			case 24:
			default:
				strength = 256;
				break;
		}

		return generateMnemonic(wordlist, strength);
	}

	/**
	 * @public
	 * Restores a wallet from the given BIP39 mnemonic.
	 * @param mnemonic - Any valid English mnemonic.
	 * @optional hdpaths - An array of `HdPath`
	 * @optional prefix - Chain prefix
	 * @returns Returns a `DirectSecp256k1HdWallet` instance
	 */
	public async generateWalletFromMnemonic(
		mnemonic: string,
		hdPaths: HdPath[],
		prefix: string,
	): Promise<Wallet> {
		const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
			hdPaths,
			prefix,
		});

		return {
			wallet,
			prefix,
		};
	}

	/**
	 * @public
	 * Get all wallets from wallets options
	 * @returns Returns an array of `Wallet`
	 */
	public async wallets(): Promise<Wallet[]> {
		let wallets: Wallet[] = [];
		const currentMnemonic = this.currentMnemonic;

		if (currentMnemonic) {
			const walletsPromises = this.walletsOptions.map(option =>
				this.generateWalletFromMnemonic(
					currentMnemonic,
					[option.hdpath],
					option.prefix,
				),
			);

			wallets = await Promise.all(walletsPromises);
		}

		this.currentWallets = wallets;

		return wallets;
	}

	/**
	 * @public
	 * Get all the addresses available inside each `Wallet`
	 * @returns Returns an array of `AccountData`
	 */
	public async accounts() {
		if (!this.currentMnemonic && this.currentWallets.length === 0) {
			await this.wallets();
		}

		const accountsPromises = this.currentWallets.map(({ wallet }) =>
			wallet.getAccounts(),
		);

		const accounts = await Promise.all(accountsPromises);

		runInAction(() => {
			this.currentAccounts = accounts.flat();
		});
	}

	/**
	 * @public
	 * Get all the addresses available inside each `Wallet`
	 * @param payload the plain string we want to compare
	 * @param hashDigest The result of a hash function that we want to compare
	 * @returns Returns an array of `AccountData`
	 * @example
	 * Here's a simple example:
	 * ```
	 * const payload = "test";
	 * const payload2 = "test2";
	 * const hashDigest = "ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff" // hash digest of "test"
	 *
	 * // Prints "true":
	 * console.log(compareHash(payload, hashDigest));
	 * // Prints "false":
	 * console.log(compareHash(payload2, hashDigest));
	 * ```
	 */
	public async compareHash(
		payload: string,
		hashDigest: string,
	): Promise<boolean> {
		const hash = await this.hash(payload);

		return hash === hashDigest;
	}

	/**
	 * @public
	 * Function to initialize the `KeyringStorage`,
	 * in order to operate with the keyring it is first necessary to initialize it,
	 * at least one mnemonic is required
	 *
	 * @param passphrase the passphrase to set for the keyring
	 * @param mnemonic the first mnemonic to save
	 * @param name an alias for mnemonics
	 * @param metadata - Object, for optional metadata
	 */
	public async *init(
		passphrase: string,
		mnemonic: string,
		name: string,
		metadata?: R,
	) {
		const passphraseHash: string = yield await this.hash(passphrase);

		const storage: KeyringStorage<T, K, R> = {
			passphraseHash: passphraseHash,
			currentMnemonicIndex: 0,
			mnemonics: [],
			cipherMetadata: this.cipherMetadata,
		};

		yield await this.write(this.storageKey, storage);

		this.passphrase = passphrase;

		yield await this.saveMnemonic(mnemonic, name, metadata);

		this.setCurrentMnemonic(mnemonic);
	}

	/**
	 * @public
	 * Unlock the `Keyring` and set passphareHash
	 */
	public async *unlock(passphrase: string) {
		const storage: Nullable<KeyringStorage<T, K, R>> = yield await this.read(
			this.storageKey,
		);

		assertIsDefined(storage);

		const compare: boolean = yield await this.compareHash(
			passphrase,
			storage.passphraseHash,
		);

		if (!compare) {
			throw new Error('The passphrase used is incorrect');
		}

		assertOutOfIndex(storage.currentMnemonicIndex, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		const chipherMnemonic = mnemonics[storage.currentMnemonicIndex];

		assertIsDefined(chipherMnemonic);

		const mnemonic: string = yield await this.decrypt(
			chipherMnemonic,
			passphrase,
		);

		this.passphrase = passphrase;
		this.setCurrentMnemonic(mnemonic);
	}

	/**
	 * @public
	 * Lock the `Keyring` and reset the current state
	 */
	public lock() {
		this.passphrase = undefined;
		this.setCurrentMnemonic(undefined);
		this.currentWallets = [];
	}

	/**
	 * @public
	 * Save a mnemonic string inside the `KeyringStorage`
	 *
	 * @returns Returns an object containing data relating to I/O operations, such as the number of wallets in memory
	 */
	public async *saveMnemonic(mnemonic: string, name: string, metadata?: R) {
		assertKeyringUnlocked(this.passphrase);

		const storage: Nullable<KeyringStorage<T, K, R>> = yield await this.read(
			this.storageKey,
		);

		assertIsDefined(storage);

		const encryptResult: EncryptResponse<T> = yield await this.encrypt(
			mnemonic,
			this.passphrase,
		);

		const storageMnemonic: KeyringStorageMnemonic<T, R> = {
			name,
			cipherText: encryptResult.cipherText,
			cipheredMetadata: encryptResult.cipheredMetadata,
			metadata,
		};

		const mnemonics = [...storage.mnemonics, storageMnemonic];

		storage.mnemonics = mnemonics;

		yield await this.write(this.storageKey, storage);

		return {
			walletsLength: mnemonics.length,
		} as WalletDataResponse;
	}

	/**
	 * @public
	 * Edit a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 *
	 * @returns Returns an object containing data relating to I/O operations, such as the number of wallets in memory
	 */
	public async *editMnemonic(index: number, name: string, metadata?: R) {
		assertKeyringUnlocked(this.passphrase);

		const storage: Nullable<KeyringStorage<T, K, R>> = yield await this.read(
			this.storageKey,
		);

		assertIsDefined(storage);

		assertOutOfIndex(index, storage.mnemonics.length);

		const storageMnemonic = Object.assign({}, storage.mnemonics[index]);

		storageMnemonic.name = name;
		storageMnemonic.metadata = metadata;

		const mnemonics = [...storage.mnemonics];

		mnemonics[index] = storageMnemonic;

		storage.mnemonics = mnemonics;

		await this.write(this.storageKey, storage);

		return {
			walletsLength: mnemonics.length,
		} as WalletDataResponse;
	}

	/**
	 * @public
	 * Delete a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 *
	 * @returns Returns an object containing data relating to I/O operations, such as the number of wallets in memory
	 */
	public async *deleteMnemonic(index: number) {
		assertKeyringUnlocked(this.passphrase);

		const storage: Nullable<KeyringStorage<T, K, R>> = yield await this.read(
			this.storageKey,
		);

		assertIsDefined(storage);

		assertOutOfIndex(index, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		mnemonics.splice(index, 1);

		storage.mnemonics = mnemonics;

		if (storage.currentMnemonicIndex === index) {
			storage.currentMnemonicIndex = 0;
		}

		if (storage.mnemonics.length === 0) {
			this.lock();
		}

		yield await this.write(this.storageKey, storage);

		return {
			walletsLength: mnemonics.length,
		} as WalletDataResponse;
	}

	/**
	 * @public
	 * Reset the `KeyringStorage` and lock the `Keyring`
	 *
	 */
	public async *reset() {
		assertKeyringUnlocked(this.passphrase);

		yield await this.delete(this.storageKey);

		this.lock();
	}

	/**
	 * @public
	 * Allows you to change the mnemonics currently in use
	 *
	 * @param index The index of the mnemonics with which you want to replace the current one
	 */
	public async *changeCurrentMnemonic(index: number) {
		assertKeyringUnlocked(this.passphrase);

		const storage: Nullable<KeyringStorage<T, K, R>> = yield await this.read(
			this.storageKey,
		);

		assertIsDefined(storage);

		assertOutOfIndex(index, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		const chipherMnemonic = mnemonics[index];

		assertIsDefined(chipherMnemonic);

		const mnemonic: string = yield await this.decrypt(
			chipherMnemonic,
			this.passphrase,
		);

		storage.currentMnemonicIndex = index;

		yield await this.write(this.storageKey, storage);

		this.setCurrentMnemonic(mnemonic);
	}

	/**
	 * @public
	 * Get all the encrypted mnemonics present in the storage
	 */
	public async getAllMnemonics(): Promise<KeyringStorageMnemonic<T, R>[]> {
		assertKeyringUnlocked(this.passphrase);

		const storage = await this.read(this.storageKey);

		assertIsDefined(storage);

		return storage.mnemonics;
	}

	/**
	 * @public
	 * Check if the storage is empty
	 */
	public async empty(): Promise<boolean> {
		const storage = await this.read(this.storageKey);

		if (!storage) {
			return true;
		}

		return storage.mnemonics.length === 0 || storage.currentMnemonicIndex < 0;
	}

	private async setCurrentMnemonic(currentMnemonic?: string) {
		this.currentMnemonic = currentMnemonic;

		await this.wallets();
		await this.accounts();
	}

	/**
	 * DEFINITIONS OF GETTERS
	 */

	/**
	 * @public
	 * Check if the `Keyring` is unlocked
	 */
	public get unlocked() {
		return this.passphrase !== undefined;
	}

	/*
	 *
	 * DEFINITIONS OF ABSTRACT METHODS
	 *
	 */

	/**
	 * @virtual
	 * Read data from the storage
	 * @param key - The key you want to read from the storage
	 * @typeParam K - The type of data storage in the storage location
	 * @returns Returns `Promise<K>` data
	 */
	protected abstract read(
		key: string,
	): Promise<Nullable<KeyringStorage<T, K, R>>>;

	/**
	 * @virtual
	 * Write data inside the storage
	 * @param key - The key where you want to write the data
	 * @param data - The data you want to save to storage
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract write(
		key: string,
		data: KeyringStorage<T, K, R>,
	): Promise<boolean>;

	/**
	 * @virtual
	 * Delete data stored inside the storage
	 * @param key - The key of the data you want to remove
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract delete(key: string): Promise<boolean>;

	/**
	 * @virtual
	 * Encrypt the `data` payload using the `passphrase` param
	 * @param data - The data payload to be encrypted
	 * @param passphrase - The passphrase with which to encrypt the payload
	 * @returns Returns a `EncryptResponse`
	 */
	protected abstract encrypt(
		data: string,
		passphrase: string,
	): Promise<EncryptResponse<T>>;

	/**
	 * @virtual
	 * Decrypt the `EncryptResponse` payload using the `passphrase` param
	 * @param data - The data payload to be decrypted
	 * @param passphrase - The passphrase with which to decrypt the payload
	 * @returns Returns a the plain text
	 */
	protected abstract decrypt(
		data: EncryptResponse<T>,
		passphrase: string,
	): Promise<string>;

	/**
	 * @virtual
	 * Apply a hash function
	 * @param data - The string to hash
	 * @returns Returns a string with a hash digest
	 */
	protected abstract hash(data: string): Promise<string>;
}
