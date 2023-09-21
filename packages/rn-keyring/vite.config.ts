/// <reference types="vitest" />
import { defineConfig } from 'vite';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig({
	cacheDir: '../../node_modules/.vite/is-even',

	plugins: [
		dts({
			entryRoot: 'src',
			tsConfigFilePath: path.join(__dirname, 'tsconfig.lib.json'),
			skipDiagnostics: true,
		}),

		nxViteTsPaths(),
	],

	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },

	// Configuration for building your library.
	// See: https://vitejs.dev/guide/build.html#library-mode
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points.
			entry: 'src/index.ts',
			name: 'rn-keyring',
			fileName: 'index',
			// Change this to the formats you want to support.
			// Don't forget to update your package.json as well.
			formats: ['es', 'cjs'],
		},
		rollupOptions: {
			// External packages that should not be bundled into your library.
			external: [
				'react/jsx-runtime',
				'react-native',
				'react-native-quick-crypto',
				'react-native-mmkv',
				'mobx',
				'mobx-react',
				'@cosmjs/proto-signing',
				'@cosmjs/crypto',
				'@craftzdog/react-native-buffer',
				'@nabla-studio/utils',
				'@nabla-studio/bip85',
				'@nabla-studio/rn-bip85',
				'@nabla-studio/keyring',
			],
		},
	},

	test: {
		globals: true,
		cache: {
			dir: '../../node_modules/.vitest',
		},
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
	},
});
