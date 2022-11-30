export const BIP85_KEY = 'bip-entropy-from-k';
export const BIP85_DERIVATION_PATH = 83696968;

export enum BIP85_APPLICATIONS {
	BIP39 = 39,
	WIF = 2,
	XPRV = 32,
	HEX = 128169,
}

export type BIP85_WORD_LENGTHS = 12 | 18 | 24;

export type BIP85_ENTROPY_LENGTHS = 16 | 24 | 32;

export type BIP39_LANGUAGES = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
