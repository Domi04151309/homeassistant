import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/components.ts',
      formats: ['es'],
      fileName: () => 'components.js',
    },
  },
});
