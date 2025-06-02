import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: process.env.NODE_ENV === 'production',
  external: [
    'react',
    'react-dom',
    'react/jsx-runtime',
    '@headlessui/react',
    '@heroicons/react'
  ],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
  onSuccess: 'echo "Build completed successfully!"',
});
