import { HdPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

export type WalletLength = 12 | 24;

export interface WalletOptions {
	hdpath: HdPath;
	prefix: string;
}

export interface Wallet {
	wallet: DirectSecp256k1HdWallet;
	prefix: string;
}

/**
 * The data structure that define response data relating to I/O operations
 *
 * @interface WalletDataResponse
 */
export interface WalletDataResponse {
	/**
	 * The number of wallets in memory
	 */
	walletsLength: number;
}
