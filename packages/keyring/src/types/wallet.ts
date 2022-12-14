import { HdPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';

export type WalletLength = 12 | 15 | 18 | 21 | 24;

export interface WalletOptions {
	hdpath: HdPath;
	prefix: string;
}

export interface Wallet {
	wallet: DirectSecp256k1HdWallet;
	prefix: string;
}
