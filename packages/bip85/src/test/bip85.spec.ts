import { Slip10, Slip10Curve, stringToPath } from '@cosmjs/crypto';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { base58, hex } from '@scure/base';
import { encode } from '@nabla-studio/wif';
import { BIP85 } from '../lib/bip85';

// Test vectors taken from: https://github.com/bitcoin/bips/blob/master/bip-0085.mediawiki#applications
// Mnemonic: puppy ocean match cereal symbol another shed magic wrap hammer bulb intact gadget divorce twin tonight reason outdoor destroy simple truth cigar social volcano
const rootKey =
	'9s21ZrQH143K2LBWUUQRFXhucrQqBpKdRRxNVq2zBqsx8HVqFk2uYo8kmbaLLHRdqtQpUm98uKfu3vca1LqdGhUtyoFnCNkfmXRyPXLjbKb';

const hexRootKey = encode(128, Buffer.from(rootKey));

const testCase1 = {
	derivedKey: 'cca20ccb0e9a90feb0912870c3323b24874b0ca3d8018c4b96d0b97c0e82ded0',
	derivedEntropy:
		'efecfbccffea313214232d29e71563d941229afb4338c21f9517c41aaa0d16f00b83d2a09ef747e7a64e8e2bd5a14869e693da66ce94ac2da570ab7ee48618f7',
};

describe('BIP85: Child Entropy', () => {
	it('works for test case 1', async () => {
		console.log(hexRootKey);
		const master = BIP85.fromBase58(hexRootKey);
		const child = master.derive(`m/83696968'/0'/0'`);

		expect(child).toEqual(testCase1.derivedEntropy);
	});

	/* it('works for test case 2', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.derive(`m/83696968'/0'/1'`);

		expect(child).toEqual(
			'70c6e3e8ebee8dc4c0dbba66076819bb8c09672527c4277ca8729532ad711872218f826919f6b67218adde99018a6df9095ab2b58d803b5b93ec9802085a690e',
		);
	});

	it('works for BIP39, 12 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 12, 0);

		expect(child.toEntropy()).toEqual('6250b68daf746d12a24d58b4787a714b');
		expect(child.toMnemonic()).toEqual(
			'girl mad pet galaxy egg matter matrix prison refuse sense ordinary nose',
		);
	});

	it('works for BIP39, 18 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 18, 0);

		expect(child.toEntropy()).toEqual(
			'938033ed8b12698449d4bbca3c853c66b293ea1b1ce9d9dc',
		);
		expect(child.toMnemonic()).toEqual(
			'near account window bike charge season chef number sketch tomorrow excuse sniff circle vital hockey outdoor supply token',
		);
	});

	it('works for BIP39, 24 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 24, 0);

		expect(child.toEntropy()).toEqual(
			'ae131e2312cdc61331542efe0d1077bac5ea803adf24b313a4f0e48e9c51f37f',
		);
		expect(child.toMnemonic()).toEqual(
			'puppy ocean match cereal symbol another shed magic wrap hammer bulb intact gadget divorce twin tonight reason outdoor destroy simple truth cigar social volcano',
		);
	});

	it('works for HD-Seed WIF', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveWIF(0);

		expect(child.toEntropy()).toEqual(
			'7040bb53104f27367f317558e78a994ada7296c6fde36a364e5baf206e502bb1',
		);
		expect(child.toWIF()).toEqual(
			'Kzyv4uF39d4Jrw2W7UryTHwZr1zQVNk4dAFyqE6BuMrMh1Za7uhp',
		);
	});

	it('works for XPRV', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveXPRV(0);

		expect(child.toEntropy()).toEqual(
			'ead0b33988a616cf6a497f1c169d9e92562604e38305ccd3fc96f2252c177682',
		);
		expect(child.toXPRV()).toEqual(
			'xprv9s21ZrQH143K2srSbCSg4m4kLvPMzcWydgmKEnMmoZUurYuBuYG46c6P71UGXMzmriLzCCBvKQWBUv3vPB3m1SATMhp3uEjXHJ42jFg7myX',
		);
	});

	it('works for HEX', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveHex(64, 0);

		expect(child.toEntropy()).toEqual(
			'492db4698cf3b73a5a24998aa3e9d7fa96275d85724a91e71aa2d645442f878555d078fd1f1f67e368976f04137b1f7a0d19232136ca50c44614af72b5582a5c',
		);
	}); */
});
