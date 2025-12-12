// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  // This is the main JavaScript file where your application starts
  input: 'src/main.js', // Or 'src/index.js', 'src/app.js', etc.
  output: {
    // This is where Rollup will put the bundled, optimized code
    file: 'dist/bundle.js',
    // 'iife' creates a self-executing function, good for browsers
    format: 'iife',
    // Optional: Creates a sourcemap for easier debugging in the browser
    sourcemap: 'inline'
  },
  input: 'src/login.js',
  output: {
    file: 'dist/login.js',
    format: 'iife',
    sourcemap: 'inline'
  },
  plugins: [
    // This plugin allows Rollup to find modules installed via npm (like Firebase)
    nodeResolve()
  ]
};