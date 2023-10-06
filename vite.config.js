import { defineConfig } from 'vite';

import babel from '@rollup/plugin-babel';

export default defineConfig({
	build: {
		outDir: 'static',
		emptyOutDir: false,
		minify: false,
		target: 'esnext',
		lib: {
			name: 'worker',
			entry: 'src/index.ts',
			fileName: (_format, entry) => '_worker.js',
			formats: ['es'],
		},
	},
	plugins: [
		{
			enforce: 'pre',
			...babel({
				babelrc: false,
				extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
				presets: [['@babel/preset-typescript']],
				plugins: [['@intrnl/jsx-to-string/babel']],
			}),
		},
	],
});
