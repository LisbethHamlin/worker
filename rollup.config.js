import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './src/index.ts',
  output: {
    file: './dist/worker.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};