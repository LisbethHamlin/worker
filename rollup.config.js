import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: './src/handler.ts',
  output: {
    entryFileNames: 'worker.js',
    chunkFileNames: '[name].js',
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};
