import { BIP85 } from '../lib';
import {
	mnemonic,
	mnemonicChild,
	rootKey,
	testCase1,
	testCase2,
	test12EnglishWords,
	test18EnglishWords,
	test24EnglishWords,
	testHDSeedWIF,
	testXPRV,
	testHEX,
} from './bip85.testdata';

describe('BIP85: Child Entropy', () => {
	it('works for test case 1', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.derive(`m/83696968'/0'/0'`);

		expect(child).toEqual(testCase1.derivedEntropy);
	});

	it('works for test case 2', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.derive(`m/83696968'/0'/1'`);

		expect(child).toEqual(testCase2.derivedEntropy);
	});

	it('works for BIP39, 12 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 12, 0);

		expect(child.toEntropy()).toEqual(test12EnglishWords.entropy);
		expect(child.toMnemonic()).toEqual(test12EnglishWords.mnemonic);
	});

	it('works for BIP39, 18 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 18, 0);

		expect(child.toEntropy()).toEqual(test18EnglishWords.entropy);
		expect(child.toMnemonic()).toEqual(test18EnglishWords.mnemonic);
	});

	it('works for BIP39, 24 words', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveBIP39(0, 24, 0);

		expect(child.toEntropy()).toEqual(test24EnglishWords.entropy);
		expect(child.toMnemonic()).toEqual(test24EnglishWords.mnemonic);
	});

	it('works for HD-Seed WIF', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveWIF(0);

		expect(child.toEntropy()).toEqual(testHDSeedWIF.derivedEntropy);
		expect(child.toWIF()).toEqual(testHDSeedWIF.derivedWIF);
	});

	it('works for XPRV', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveXPRV(0);

		expect(child.toEntropy()).toEqual(testXPRV.derivedEntropy);
		expect(child.toXPRV()).toEqual(testXPRV.derivedWIF);
	});

	it('works for HEX', () => {
		const master = BIP85.fromBase58(rootKey);
		const child = master.deriveHex(64, 0);

		expect(child.toEntropy()).toEqual(testHEX.derivedEntropy);
	});

	it('works for fromMnemonic and deriveBIP39', () => {
		const master = BIP85.fromMnemonic(mnemonic);
		const child = master.deriveBIP39(0, 12, 0);

		expect(child.toMnemonic()).toEqual(mnemonicChild);
	});
});
