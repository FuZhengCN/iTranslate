const fs = require('fs');
const path = require('path');

const bookDir = path.join(__dirname, '..');

const order = [
  'part1-getting-started/ch01-why-cc-ds.md',
  'part1-getting-started/ch02-setup.md',
  'part1-getting-started/ch03-cc-basics.md',
  'part1-getting-started/ch04-first-task.md',
  'part2-itranslate/ch05-planning.md',
  'part2-itranslate/ch06-scaffold.md',
  'part2-itranslate/ch07-engine.md',
  'part2-itranslate/ch08-content-inject.md',
  'part2-itranslate/ch09-popup-msg.md',
  'part2-itranslate/ch10-selection.md',
  'part2-itranslate/ch11-dictionary.md',
  'part2-itranslate/ch12-visual.md',
  'part2-itranslate/ch13-testing-release.md',
  'part3-advanced/ch14-prompt-patterns.md',
  'part3-advanced/ch15-refactoring.md',
  'part3-advanced/ch16-multi-model.md',
  'part3-advanced/ch17-pitfalls-20.md',
];

let manuscript = `# 《Claude Code + DeepSeek 从入门到精通》

> 一个人搞定一个产品：iTranslate 开发实战录

---

`;

let totalChars = 0;

for (const file of order) {
  const filePath = path.join(bookDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing: ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  manuscript += content + '\n\n\\newpage\n\n';
  totalChars += content.length;
  console.log(`  ${file} (${content.length} chars)`);
}

const outputPath = path.join(bookDir, 'manuscript.md');
fs.writeFileSync(outputPath, manuscript);

console.log(`\nDone: ${outputPath}`);
console.log(`Total: ${manuscript.length.toLocaleString()} chars, ${order.length} chapters`);
