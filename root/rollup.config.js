import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/login.js',
    output: {
      file: 'dist/login.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/articles.js',
    output: {
      file: 'dist/articles.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/article.js',
    output: {
      file: 'dist/article.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/profile.js',
    output: {
      file: 'dist/profile.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  },
  {
    input: 'src/quick.js',
    output: {
      file: 'dist/quick.js',
      format: 'iife',
      sourcemap: 'inline'
    },
    plugins: [nodeResolve()]
  }
];