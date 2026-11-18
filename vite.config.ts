import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const GITHUB_PAGES_MODE = 'github-pages';

export default defineConfig(({ mode }) => {
  const isGitHubPages = mode === GITHUB_PAGES_MODE;

  return {
    base: isGitHubPages ? '/EcoRuta/' : './',
    build: {
      outDir: isGitHubPages ? 'dist-pages' : 'dist',
    },
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      globals: true,
    },
  };
});
