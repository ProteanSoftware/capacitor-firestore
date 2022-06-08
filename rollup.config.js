import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'dist/esm/index.js',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'capacitorCapacitorFirestore',
      globals: {
        '@capacitor/core': 'capacitorExports'
      },
      sourcemap: true,
      inlineDynamicImports: true,
    },
    {
      file: 'dist/plugin.cjs.js',
        format: 'cjs',
        sourcemap: true,
        inlineDynamicImports: true,
    },
  ],
  plugins: [
    nodeResolve({
      // allowlist of dependencies to bundle in
      // @see https://github.com/rollup/plugins/tree/master/packages/node-resolve#resolveonly
      resolveOnly: [
        'firebase/app',
        'firebase/auth',
        'firebase/firestore',
      ],
    }),
  ],
  external: [ 
    '@capacitor/core'
  ],
};
