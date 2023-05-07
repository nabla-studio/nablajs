/* eslint-disable */
export default {
	displayName: 'utils',
	testEnvironment: 'node',
	preset: '../../jest.preset.js',
	globals: {},
	transform: {
		'^.+\\.[tj]s$': [
			'ts-jest',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
			},
		],
	},
	moduleFileExtensions: ['ts', 'js', 'html'],
};
