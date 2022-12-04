module.exports = {
	displayName: 'rn-keyring',
	preset: 'react-native',
	resolver: '@nrwl/jest/plugins/resolver',
	moduleFileExtensions: ['ts', 'js', 'html', 'tsx', 'jsx'],
	setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
	moduleNameMapper: {
		'.svg': '@nrwl/react-native/plugins/jest/svg-mock',
	},
	coverageDirectory: '../../coverage/packages/rn-keyring',
};
