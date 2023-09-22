import type { HdPath } from '@cosmjs/crypto';
import type { AccountData } from '@cosmjs/proto-signing';

export type WalletLength = 12 | 24;

export interface WalletOptions {
	hdpath: HdPath;
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

export interface AccountDataPrefix extends AccountData {
	prefix: string;
}

export interface AccountDataWithPrivkey extends AccountDataPrefix {
	readonly privkey: Uint8Array;
}
