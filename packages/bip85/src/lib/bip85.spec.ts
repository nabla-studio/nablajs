import { bip85 } from './bip85';

describe('bip85', () => {
	it('should work', () => {
		expect(bip85()).toEqual('bip85');
	});
});
