const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

const dir = path.join(__dirname, 'src', 'pages');

walkDir(dir, (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/text-text-primary(?!\s+dark:)/g, 'text-gray-900 dark:text-white');
    content = content.replace(/text-text-secondary(?!\s+dark:)/g, 'text-gray-500 dark:text-gray-400');
    content = content.replace(/bg-surface-bg(?!\s+dark:)/g, 'bg-gray-50 dark:bg-slate-900');
    content = content.replace(/border-surface-border(?!\s+dark:)/g, 'border-gray-200 dark:border-slate-700');
    
    content = content.replace(/\bbg-white\b(?!\s*dark:bg-[a-z]+(-[0-9]+|))/g, 'bg-white dark:bg-slate-800');
    content = content.replace(/\btext-black\b(?!\s*dark:text)/g, 'text-gray-900 dark:text-white');
    content = content.replace(/\bbg-gray-100\b(?!\s*dark:bg)/g, 'bg-gray-100 dark:bg-slate-900');
    content = content.replace(/\bbg-gray-50\b(?!\s*dark:bg)/g, 'bg-gray-50 dark:bg-slate-900');
    content = content.replace(/\bbg-gray-200\b(?!\s*dark:bg)/g, 'bg-gray-200 dark:bg-slate-700');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
