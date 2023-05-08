module.exports = function (api) {
	api.cache(true);
	return {
		presets: ['babel-preset-expo'],
		plugins: [
			[
				'module-resolver',
				{
					alias: {
						crypto: 'react-native-quick-crypto',
						stream: 'stream-browserify',
						buffer: '@craftzdog/react-native-buffer',
						'@nabla-studio/bip85': 'packages/bip85/src/index.ts',
						'@nabla-studio/keyring': 'packages/keyring/src/index.ts',
						'@nabla-studio/rn-bip85': 'packages/rn-bip85/src/index.ts',
						'@nabla-studio/rn-keyring': 'packages/rn-keyring/src/index.ts',
						'@nabla-studio/utils': 'packages/utils/src/index.ts',
						'@nabla-studio/wif': 'packages/wif/src/index.ts',
					},
				},
			],
		],
	};
};
