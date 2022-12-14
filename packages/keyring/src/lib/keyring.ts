import { AccountData, DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { HdPath } from '@cosmjs/crypto';
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
} from '../types';

/**
 * Definition of Keyring class structure,
 * it's the core of the of private and public key management.
 * The structure is divided into two parts, fixed methods that are used for specific operations
 * and a set of abstract methods that define some atomic operations
 * that can be exploited by the previous methods.
 *
 * @typeParam T - Object, corresponding to information linked to encryption/decryption activities (e.g., the **IV** for an AES method encryption, parameters for the key generation method).
 * @typeParam K - Object, that contains information about the cipher method (e.g., the **cipherType**, the **keyLength**, the **keyGenerationMethod**, etc.)
 */
export abstract class Keyring<T = undefined, K = undefined> {
	/**
	 * @public
	 * the mnemonics currently selected to operate
	 */
	public currentMnemonic?: string;

	/**
	 * @public
	 * current wallets associated with current mnemonic
	 */
	public currentWallets: Wallet[] = [];

	/**
	 * current passphrase used for mnemonics encryption
	 */
	#passphrase?: string;

	/**
	 * @param storageKey - A unique identifier to locate the storage area for Keyring management
	 * @param walletsOptions - An array of `WalletOptions` used for wallets generation
	 */
	constructor(
		public storageKey: string = 'keyring',
		public walletsOptions: WalletOptions[],
		public cipherMetadata?: K,
	) {}

	/**
	 * @public
	 * Generates a new wallet with a BIP39 mnemonic of the given length.
	 * @optional length - The number of words in the mnemonic (12, 15, 18, 21 or 24).
	 * @optional hdpaths - An array of `HdPath`
	 * @optional prefix - Chain prefix
	 * @returns Returns a `DirectSecp256k1HdWallet` instance
	 */
	public async generateMnemonic(
		length?: WalletLength,
		hdPaths?: HdPath[],
		prefix?: string,
	): Promise<DirectSecp256k1HdWallet> {
		const wallet = await DirectSecp256k1HdWallet.generate(length, {
			hdPaths,
			prefix,
		});

		return wallet;
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
	public async accounts(): Promise<AccountData[]> {
		if (!this.currentMnemonic && this.currentWallets.length === 0) {
			await this.wallets();
		}

		const accountsPromises = this.currentWallets.map(({ wallet }) =>
			wallet.getAccounts(),
		);

		const accounts = await Promise.all(accountsPromises);

		return accounts.flat();
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
	 */
	public async init(passphrase: string, mnemonic: string, name: string) {
		const passphraseHash = await this.hash(passphrase);

		const encryptResult = await this.encrypt(mnemonic, passphrase);

		const storageMnemonic: KeyringStorageMnemonic<T> = {
			name,
			cipherText: encryptResult.cipherText,
			cipheredMetadata: encryptResult.cipheredMetadata,
		};

		const storage: KeyringStorage<T, K> = {
			passphraseHash: passphraseHash,
			currentMnemonicIndex: 0,
			mnemonics: [storageMnemonic],
			cipherMetadata: this.cipherMetadata,
		};

		await this.write(this.storageKey, storage);

		this.#passphrase = passphrase;
		this.currentMnemonic = mnemonic;

		await this.wallets();
	}

	/**
	 * @public
	 * Unlock the `Keyring` and set passphareHash
	 */
	public async unlock(passphrase: string) {
		const storage = await this.read(this.storageKey);

		assertIsDefined(storage);

		const compare = await this.compareHash(passphrase, storage.passphraseHash);

		if (!compare) {
			throw new Error('The passphrase used is incorrect');
		}

		assertOutOfIndex(storage.currentMnemonicIndex, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		const chipherMnemonic = mnemonics.at(storage.currentMnemonicIndex);

		assertIsDefined(chipherMnemonic);

		const mnemonic = await this.decrypt(chipherMnemonic, passphrase);

		this.#passphrase = passphrase;
		this.currentMnemonic = mnemonic;

		await this.wallets();
	}

	/**
	 * @public
	 * Lock the `Keyring` and reset the current state
	 */
	public lock() {
		this.#passphrase = undefined;
		this.currentMnemonic = undefined;
		this.currentWallets = [];
	}

	/**
	 * @public
	 * Save a mnemonic string inside the `KeyringStorage`
	 */
	public async saveMnemonic(mnemonic: string, name: string) {
		assertKeyringUnlocked(this.#passphrase);

		const storage = await this.read(this.storageKey);

		assertIsDefined(storage);

		const encryptResult = await this.encrypt(mnemonic, this.#passphrase);

		const storageMnemonic: KeyringStorageMnemonic<T> = {
			name,
			cipherText: encryptResult.cipherText,
			cipheredMetadata: encryptResult.cipheredMetadata,
		};

		const mnemonics = [...storage.mnemonics, storageMnemonic];

		storage.mnemonics = mnemonics;

		await this.write(this.storageKey, storage);
	}

	/**
	 * @public
	 * Edit a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 */
	public async editMnemonic(index: number, name: string) {
		assertKeyringUnlocked(this.#passphrase);

		const storage = await this.read(this.storageKey);

		assertIsDefined(storage);

		assertOutOfIndex(index, storage.mnemonics.length);

		const storageMnemonic = Object.assign({}, storage.mnemonics[index]);

		storageMnemonic.name = name;

		const mnemonics = [...storage.mnemonics];

		mnemonics[index] = storageMnemonic;

		storage.mnemonics = mnemonics;

		await this.write(this.storageKey, storage);
	}

	/**
	 * @public
	 * Delete a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 */
	public async deleteMnemonic(index: number) {
		assertKeyringUnlocked(this.#passphrase);

		const storage = await this.read(this.storageKey);

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

		await this.write(this.storageKey, storage);
	}

	/**
	 * @public
	 * Allows you to change the mnemonics currently in use
	 *
	 * @param index The index of the mnemonics with which you want to replace the current one
	 */
	public async changeCurrentMnemonic(index: number) {
		assertKeyringUnlocked(this.#passphrase);

		const storage = await this.read(this.storageKey);

		assertIsDefined(storage);

		assertOutOfIndex(index, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		const chipherMnemonic = mnemonics.at(index);

		assertIsDefined(chipherMnemonic);

		const mnemonic = await this.decrypt(chipherMnemonic, this.#passphrase);

		storage.currentMnemonicIndex = index;

		await this.write(this.storageKey, storage);

		this.currentMnemonic = mnemonic;

		await this.wallets();
	}

	/**
	 * @public
	 * Get all the encrypted mnemonics present in the storage
	 */
	public async getAllMnemonics(): Promise<KeyringStorageMnemonic<T>[]> {
		assertKeyringUnlocked(this.#passphrase);

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

	/**
	 * DEFINITIONS OF GETTERS
	 */

	/**
	 * @public
	 * Check if the `Keyring` is unlocked
	 */
	public get unlocked() {
		return this.#passphrase !== undefined;
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
	protected abstract read(key: string): Promise<Nullable<KeyringStorage<T, K>>>;

	/**
	 * @virtual
	 * Write data inside the storage
	 * @param key - The key where you want to write the data
	 * @param data - The data you want to save to storage
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract write(
		key: string,
		data: KeyringStorage<T, K>,
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
