import fs from 'fs';
import path from 'path';

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    // check if en key has devanagari
    if (/en\s*:\s*['"][^'"]*[\u0900-\u097F]/.test(line)) {
      console.log(`[DEVANAGARI IN EN] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
    // check if mr key has english words (more than 3 words)
    // or if fallback defaults to mr when en is selected
    if (/\|\|\s*item\.[a-zA-Z]+\.mr/.test(line)) {
      console.log(`[FALLBACK TO MR] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
  });
}

function scanDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      if (!item.includes('node_modules') && !item.includes('.git')) {
        scanDir(full);
      }
    } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
      checkFile(full);
    }
  }
}

scanDir('client/src');
