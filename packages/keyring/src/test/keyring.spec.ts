import { stringToPath } from '@cosmjs/crypto';
import { TestKeyring } from './map-storage';

const passphrase = 'test';

const mnemonic =
	'crunch case marriage season level picnic stairs bomb program exile couple error address direct quick gorilla ignore dice magic give piece isolate discover win';

const testKeyring = new TestKeyring('keyringkey', [
	{
		hdpath: stringToPath(`m/44'/639'/0'/0/0`),
		prefix: 'name',
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
				testKeyring.saveMnemonic(mnemonic, 'test'),
			).rejects.toThrowError();
		});
		it('editMnemonic should fail because keyring is locked', async () => {
			await expect(testKeyring.editMnemonic(0, 'testedit')).rejects.toThrowError();
		});
		it('deleteMnemonic should fail because keyring is locked', async () => {
			await expect(testKeyring.deleteMnemonic(0)).rejects.toThrowError();
		});
		it('changeCurrentMnemonic should fail because keyring is locked', async () => {
			await expect(testKeyring.changeCurrentMnemonic(0)).rejects.toThrowError();
		});
		it('getAllMnemonics should fail because keyring is locked', async () => {
			await expect(testKeyring.changeCurrentMnemonic(0)).rejects.toThrowError();
		});
	});
});
