import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync, writeFileSync } from 'fs';
import manifest from './manifest.json';
import pkg from './package.json';

export default defineConfig({
  plugins: [
    crx({
      manifest: {
        ...manifest,
        version: pkg.version,
      },
    }),
    {
      name: 'inject-content-scripts',
      closeBundle() {
        const manifestPath = 'dist/manifest.json';
        const manifestJson = JSON.parse(readFileSync(manifestPath, 'utf-8'));
        manifestJson.content_scripts = [
          {
            matches: ['<all_urls>'],
            js: ['assets/content.js'],
            run_at: 'document_idle',
          },
        ];
        writeFileSync(manifestPath, JSON.stringify(manifestJson, null, 2));
      },
    },
  ],
});
