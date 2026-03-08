import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.d.ts',
        'src/generated/**',
        'src/app/**',
        'src/config/**',
        'src/i18n/**',
        'src/proxy.ts',
        'src/hero.ts'
      ]
    }
  },
  resolve: {
    alias: [
      {
        find: '@prisma-generated',
        replacement: path.resolve(__dirname, './src/generated/prisma')
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, './src')
      }
    ]
  }
});
