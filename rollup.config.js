import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import nodeResolve from '@rollup/plugin-node-resolve';

const isProduction = process.env.BUILD === 'production';

export default [
	{
		input: './src/client/ts/application.ts',
		output: {
			file: `./build/client/js/application.js`,
			format: 'esm'
		},
		plugins: [
			typescript(),
			nodeResolve({
			}),
			isProduction ? terser() : null,
			copy({
				copyOnce: true,
				targets: [
					{ src: 'src/client/index.html', dest: 'build/client/' },
				]
			}),
		],
		onwarn: function onwarn(warning, warn) {
			// Disable circular dependencies in modules
			if (warning.code == 'CIRCULAR_DEPENDENCY' && warning.importer && warning.importer.startsWith('node_modules/')) {
				return;
			}
			warn(warning);
		},
	}
];
