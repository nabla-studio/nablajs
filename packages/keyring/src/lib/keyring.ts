import { AccountData, DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { HdPath } from '@cosmjs/crypto';
import {
	WalletLength,
	WalletOptions,
	Wallet,
	EncryptResponse,
	KeyringStorage,
	KeyringStorageMnemonic,
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

	/*
		The keyring storage area is an array of mnemonics (Maybe an object with other data)
	*/
	/*
		TODO: Add get/set mnemonic functionality by index and key
		we should decrypt and set the new mnemonic
	*/
	// TODO: Add get all mnemonics array (No decrypt)

	// TODO: add unlock method to match passphrase and save it in current session

	/**
	 * @public
	 * Save a mnemonic string inside the `KeyringStorage`
	 */
	public async saveMnemonic(mnemonic: string, name: string) {
		this.unlocked(this.#passphrase);

		const storage = await this.read<KeyringStorage<T, K>>(this.storageKey);

		const encryptResult = await this.encrypt(mnemonic, this.#passphrase);

		const storageMnemonic: KeyringStorageMnemonic<T> = {
			name,
			cipherText: encryptResult.cipherText,
			cipheredMetadata: encryptResult.cipheredMetadata,
		};

		const mnemonics = [...storage.mnemonics, storageMnemonic];

		storage.mnemonics = mnemonics;

		await this.write<KeyringStorage<T, K>>(this.storageKey, storage);
	}

	/**
	 * @public
	 * Edit a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 */
	public async editMnemonic(index: number, name: string) {
		this.unlocked(this.#passphrase);

		const storage = await this.read<KeyringStorage<T, K>>(this.storageKey);

		this.outOfIndex(index, storage.mnemonics.length);

		const storageMnemonic = Object.assign({}, storage.mnemonics[index]);

		storageMnemonic.name = name;

		const mnemonics = [...storage.mnemonics, storageMnemonic];

		storage.mnemonics = mnemonics;

		await this.write<KeyringStorage<T, K>>(this.storageKey, storage);
	}

	/**
	 * @public
	 * Delete a `KeyringStorageMnemonic` inside the `KeyringStorage`
	 */
	public async deleteMnemonic(index: number) {
		this.unlocked(this.#passphrase);

		const storage = await this.read<KeyringStorage<T, K>>(this.storageKey);

		this.outOfIndex(index, storage.mnemonics.length);

		const mnemonics = [...storage.mnemonics];

		mnemonics.splice(index, 1);

		storage.mnemonics = mnemonics;

		await this.write<KeyringStorage<T, K>>(this.storageKey, storage);
	}

	/**
	 * @public
	 * Assertion function used to check that the wallet is unlocked
	 */
	public unlocked(
		passphrase?: string,
	): asserts passphrase is NonNullable<string> {
		if (!passphrase) {
			throw new Error('The Keyring is locked, you must unlock it');
		}
	}

	/**
	 * @public
	 * Assertion function used to check if we are out of index
	 */
	private outOfIndex(index: number, length: number) {
		if (index < 0 || index > length - 1) {
			throw new Error(
				`IndexError: the index ${index} is greater then ${
					length - 1
				} or less then zero`,
			);
		}
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
	protected abstract read<R extends object>(key: string): Promise<R>;

	/**
	 * @virtual
	 * Write data inside the storage
	 * @param key - The key where you want to write the data
	 * @param data - The data you want to save to storage
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract write<R extends object>(
		key: string,
		data: R,
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
	 * Encrypt the `data` payload using the `key` param
	 * @param data - The data payload to be encrypted
	 * @param key - The key with which to encrypt the payload
	 * @returns Returns a `EncryptResponse`
	 */
	protected abstract encrypt(
		data: string,
		key: string,
	): Promise<EncryptResponse<T>>;

	/**
	 * @virtual
	 * Decrypt the `EncryptResponse` payload using the `key` param
	 * @param data - The data payload to be decrypted
	 * @param key - The key with which to decrypt the payload
	 * @returns Returns a the plain text
	 */
	protected abstract decrypt(
		data: EncryptResponse<T>,
		key: string,
	): Promise<string>;

	/**
	 * @virtual
	 * Apply a hash function
	 * @param data - The string to hash
	 * @returns Returns a string with a hash digest
	 */
	protected abstract hash(data: string): Promise<string>;
}
