import { AccountData, DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { HdPath } from '@cosmjs/crypto';
import { WalletLength, WalletOptions, Wallet, EncryptResponse } from '../types';

/**
 * Definition of Keyring class structure,
 * it's the core of the of private and public key management.
 * The structure is divided into two parts, fixed methods that are used for specific operations
 * and a set of abstract methods that define some atomic operations
 * that can be exploited by the previous methods.
 */
export abstract class Keyring {
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
	 * @private
	 * current wallets associated with current mnemonic
	 */
	private passphrase?: string;

	/**
	 * @param storageKey - A unique identifier to locate the storage area for Keyring management
	 * @param walletsOptions - An array of `WalletOptions` used for wallets generation
	 */
	constructor(
		public storageKey: string,
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

	/*
		The keyring storage area is an array of mnemonics (Maybe an object with other data)
	*/
	/*
		TODO: Add save mnemonic functionality in append mode using key
	*/
	// TODO: Add edit mnemonica functionality by index
	/*
		TODO: Add get/set mnemonic functionality by index and key
		we should decrypt and set the new mnemonic
	*/
	// TODO: Add delete mnemonic functionality by index
	// TODO: Add get all mnemonics array (No decrypt)
	/*
		TODO: Refactor read,save and delete methods, they doesn't need an index, because
		they're related to how we should store mnemonics, it isn't related to an atomic operation
	*/

	// TODO: add unlock method to match passphrase and save it in current session

	// TODO: add generic for class to support encryption algoritm specifics, for example extra data
	// for AES such as Inizialization Vector

	/**
	 * @virtual
	 * Read data from the storage
	 * @param index - The index of the wallet you want to read
	 * @returns Returns the mnemonic seed phrase
	 */
	protected abstract read(index: string): Promise<string>;

	/**
	 * @virtual
	 * Append and save data inside the storage
	 * @param data - Data to store in memory
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract save(data: string): Promise<boolean>;

	/**
	 * @virtual
	 * Delete data stored inside the storage
	 * @param index - The index of the wallet you want to delete
	 * @returns Returns a boolean value with the status of the operation
	 */
	protected abstract delete(index: string): Promise<boolean>;

	/**
	 * @virtual
	 * Encrypt the `data` payload using the `key` param
	 * @param data - The data payload to be encrypted
	 * @param key - The key with which to encrypt the payload
	 * @returns Returns a `EncryptResponse`
	 */
	protected abstract encrypt<T extends object>(
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
	protected abstract decrypt<T extends object>(
		data: EncryptResponse<T>,
		key: string,
	): Promise<string>;
}
