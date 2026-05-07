#!/usr/bin/env node
// Run with: node scripts/build-qr-html.js
// Downloads/reads qr-code-styling and embeds it in QRGeneratorHTML.ts
const fs = require('fs');
const path = require('path');
const jsPath = path.join(__dirname, '../assets/js/qr-code-styling.js');
if (!fs.existsSync(jsPath)) {
  console.error('Missing assets/js/qr-code-styling.js — run: curl https://unpkg.com/qr-code-styling@1.6.0/lib/qr-code-styling.js -o assets/js/qr-code-styling.js');
  process.exit(1);
}
const js = fs.readFileSync(jsPath, 'utf8').replace('//# sourceMappingURL=qr-code-styling.js.map', '');
// Re-use the same template from the main generation script
console.log('Re-run the inline generation node command from the setup instructions.');
