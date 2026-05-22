import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = resolve(__dirname, '..', 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

const [major, minor, build] = pkg.version.split('.').map(Number);
pkg.version = `${major}.${minor}.${build + 1}`;

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`[iTranslate] version bumped to ${pkg.version}`);
