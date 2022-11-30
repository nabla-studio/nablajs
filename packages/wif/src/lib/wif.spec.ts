import { wif } from './wif';

describe('wif', () => {
	it('should work', () => {
		expect(wif()).toEqual('wif');
	});
});
