import { stringToPath } from '@cosmjs/crypto';
import { asyncFlowResult } from '../lib';
import { TestKeyring } from './map-storage.testdata';
import Long from 'long';
import { utf8 } from '@scure/base';

const passphrase = 'test';

const mnemonic =
	'crunch case marriage season level picnic stairs bomb program exile couple error address direct quick gorilla ignore dice magic give piece isolate discover win';

const bitsongAddress = 'bitsong19vrav4aadrd5k7jtk4qd5eswjs4h7dx8g0dm0u';
const cosmosAddress = 'cosmos1v6srjtrpy570svenklq6qm0knq4qsea74l6yq7';

const mnemonicName = 'wallet1';
const mnemonicEditName = 'wallet1edit';

const testKeyring = new TestKeyring('keyringkey', [
	{
		hdpath: stringToPath(`m/44'/639'/0'/0/0`),
		prefix: 'bitsong',
	},
	{
		hdpath: stringToPath(`m/44'/118'/0'/0/0`),
		prefix: 'cosmos',
	},
]);

describe('Keyring tests using TestKeyring implementation', () => {
	describe('Validate unlock behaviours', () => {
		it("unlock should fail because storage doesn't exist", async () => {
			await expect(testKeyring.unlock(passphrase)).rejects.toThrowError();
		});
		it('saveMnemonic should fail because keyring is locked', async () => {
			await expect(
				testKeyring.saveMnemonic(mnemonic, mnemonicName),
			).rejects.toThrowError();
		});
		it('editMnemonic should fail because keyring is locked', async () => {
			await expect(
				testKeyring.editMnemonic(0, mnemonicEditName),
			).rejects.toThrowError();
		});
		it('deleteMnemonic should fail because keyring is locked', async () => {
			await expect(testKeyring.deleteMnemonic(0)).rejects.toThrowError();
		});
		it('changeCurrentMnemonic should fail because keyring is locked', async () => {
			await expect(testKeyring.changeCurrentMnemonic(0)).rejects.toThrowError();
		});
		it('getAllMnemonics should fail because keyring is locked', async () => {
			await expect(testKeyring.getAllMnemonics()).rejects.toThrowError();
		});
	});
	describe('Validate mnemonics I/O Operations', () => {
		it('Should get empty true', async () => {
			const empty = await testKeyring.empty();

			expect(empty).toBe(true);
		});
		it('Should init the Keyring', async () => {
			await testKeyring.init(passphrase, mnemonic, mnemonicName);
		});
		it('Should get accounts', async () => {
			await new Promise(r => setTimeout(r, 500));
			const accounts = testKeyring.currentAccounts;

			const bitsongAccount = accounts.find(
				account => account.address === bitsongAddress,
			);

			expect(bitsongAccount).not.toBeUndefined();

			const cosmosAccount = accounts.find(
				account => account.address === cosmosAddress,
			);

			expect(cosmosAccount).not.toBeUndefined();
		});
		it('Should get empty false', async () => {
			const empty = await testKeyring.empty();

			expect(empty).toBe(false);
		});
		it('Should get mnemonics of length equal to one', async () => {
			const mnemonics = await testKeyring.getAllMnemonics();

			expect(mnemonics.length).toBe(1);
		});
		it('Unlock should succed', async () => {
			await testKeyring.unlock(passphrase);
		});
		it('Should save a new mnemonic and set it as current one', async () => {
			const newMnemonicString = testKeyring.generateMnemonic(24);

			const response = await asyncFlowResult(
				testKeyring.saveMnemonic(newMnemonicString, 'newmnemonic'),
			);

			await new Promise(r => setTimeout(r, 500));

			await testKeyring.changeCurrentMnemonic(response.walletsLength - 1);

			const mnemonics = await testKeyring.getAllMnemonics();

			expect(mnemonics.length).toBe(2);
		});
		it('Should sign a signDoc', async () => {
			const account = testKeyring.currentAccounts.find(
				account => account.prefix === 'cosmos',
			);

			expect(account).not.toBeUndefined();

			if (account) {
				const message = account.address;

				const messageHash = utf8.decode(message);

				const signDoc = {
					chainId: '', // Sostituisci con il tuo chainId
					accountNumber: Long.fromString('0'), // Sostituisci con il tuo accountNumber
					authInfoBytes: new Uint8Array(), // Questo potrebbe non essere necessario per un messaggio personalizzato
					sequence: '0', // Sostituisci con il tuo sequence
					bodyBytes: messageHash,
				};

				const response = await testKeyring.signDirect(account.address, signDoc);

				expect(response).not.toBeUndefined();
			}
		});
		it('Should edit the new mnemonic', async () => {
			const [mnemonic] = await testKeyring.getAllMnemonics();

			await testKeyring.editMnemonic(0, `${mnemonicName}-edit`);

			const [editMnemonic] = await testKeyring.getAllMnemonics();

			expect(editMnemonic.name).toBe(`${mnemonicName}-edit`);
			expect(mnemonic.name).not.toBe(editMnemonic.name);
		});
		it('Should delete a mnemonic', async () => {
			await testKeyring.deleteMnemonic(1);

			expect(testKeyring.getAllMnemonics);
		});
		it('Should save a new mnemonic with metadata', async () => {
			const newMnemonic = testKeyring.generateMnemonic(24);

			await testKeyring.saveMnemonic(newMnemonic, 'newmnemonic', {
				bip85: true,
			});

			const mnemonics = await testKeyring.getAllMnemonics();

			expect(mnemonics.length).toBe(2);
		});
		it('Should create a new mnemonic from a master mnemonic using BIP85 and save it', async () => {
			const newMnemonic = testKeyring.generateMnemonic(24);

			const childMnemonic = await testKeyring.generateMnemonicFromMaster(
				newMnemonic,
				0,
				24,
				0,
			);

			await testKeyring.saveMnemonic(childMnemonic, 'newmnemonic', {
				bip85: true,
				index: 0,
			});

			const mnemonics = await testKeyring.getAllMnemonics();

			expect(mnemonics.length).toBe(3);
		});
		it('Should create a new mnemonic from a master mnemonic using BIP85, save it and set it as current one', async () => {
			const masterMnemonic = testKeyring.generateMnemonic(24);

			const childMnemonic = await testKeyring.generateMnemonicFromMaster(
				masterMnemonic,
				0,
				24,
				0,
			);

			const response = await asyncFlowResult(
				testKeyring.saveMnemonic(childMnemonic, 'newmnemonic', {
					bip85: true,
					index: 0,
				}),
			);

			await testKeyring.changeCurrentMnemonic(response.walletsLength - 1);

			const mnemonics = await testKeyring.getAllMnemonics();

			expect(mnemonics.length).toBe(4);
		});
		it('Should reset the keyring', async () => {
			await asyncFlowResult(testKeyring.reset());

			const empty = await testKeyring.empty();

			expect(empty).toBeTruthy();
			expect(testKeyring.unlocked).not.toBeTruthy();
		});
	});
});
