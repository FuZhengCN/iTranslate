import sharp from 'sharp';
import { readFileSync } from 'fs';

const svg = readFileSync('icons/icon.svg');

await sharp(svg).resize(16, 16).png().toFile('icons/icon16.png');
await sharp(svg).resize(48, 48).png().toFile('icons/icon48.png');
await sharp(svg).resize(128, 128).png().toFile('icons/icon128.png');

console.log('Icons generated: 16x16, 48x48, 128x128');
