const { execSync } = require('child_process');
const { readFileSync } = require('fs');
const { join } = require('path');

const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = pkg.version;
const zipName = `iTranslate-v${version}.zip`;
const root = join(__dirname, '..');

// Remove old zips, create new one
execSync(`rm -f ${root}/iTranslate-v*.zip`, { cwd: root });
execSync(`zip -r "${zipName}" dist/ -x "dist/.browser-data/*"`, { cwd: root });

console.log(`\n✅ ${zipName} (version ${version})`);
