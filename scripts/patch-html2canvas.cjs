const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', 'node_modules', '.vite', 'deps', 'html2canvas.js'),
  path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.js'),
  path.join(__dirname, '..', 'node_modules', 'html2canvas', 'dist', 'html2canvas.esm.js')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const target = /if\s*\(\s*typeof\s+colorFunction\s*===\s*["']undefined["']\s*\)\s*\{[^}]*throw\s+new\s+Error\([^}]*\);?\s*\}/g;
      const replacement = 'if (typeof colorFunction === "undefined") { return pack(0, 0, 0, 0); }';
      if (target.test(content)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log('[patch-html2canvas] Successfully patched', file);
      }
    } catch (e) {
      console.warn('[patch-html2canvas] Error patching file:', file, e);
    }
  }
});
