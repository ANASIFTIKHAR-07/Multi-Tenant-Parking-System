const fs = require('fs');
const path = require('path');

const MAP = {
  'bg-white': 'bg-white dark:bg-slate-900',
  'bg-slate-50': 'bg-slate-50 dark:bg-slate-800/40',
  'bg-slate-100': 'bg-slate-100 dark:bg-slate-800',
  'text-slate-900': 'text-slate-900 dark:text-white',
  'text-slate-800': 'text-slate-800 dark:text-slate-200',
  'text-slate-700': 'text-slate-700 dark:text-slate-300',
  'text-slate-600': 'text-slate-600 dark:text-slate-400',
  'text-slate-500': 'text-slate-500 dark:text-slate-400',
  'text-slate-400': 'text-slate-400 dark:text-slate-500',
  'border-slate-100': 'border-slate-100 dark:border-slate-800',
  'border-slate-200': 'border-slate-200 dark:border-slate-700/80',
  'border-slate-300': 'border-slate-300 dark:border-slate-700',
  'hover:bg-slate-50': 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
  'hover:bg-slate-100': 'hover:bg-slate-100 dark:hover:bg-slate-800',
  'hover:border-slate-300': 'hover:border-slate-300 dark:hover:border-slate-600',
  'hover:text-slate-800': 'hover:text-slate-800 dark:hover:text-slate-200',
  'hover:text-slate-700': 'hover:text-slate-700 dark:hover:text-slate-300',
  'bg-blue-50': 'bg-blue-50 dark:bg-blue-500/10',
  'text-blue-800': 'text-blue-800 dark:text-blue-300',
  'text-blue-700': 'text-blue-700 dark:text-blue-400',
  'text-blue-600': 'text-blue-600 dark:text-blue-400',
  'bg-emerald-50': 'bg-emerald-50 dark:bg-emerald-500/10',
  'text-emerald-700': 'text-emerald-700 dark:text-emerald-400',
  'text-emerald-600': 'text-emerald-600 dark:text-emerald-400',
  'bg-red-50': 'bg-red-50 dark:bg-red-500/10',
  'text-red-700': 'text-red-700 dark:text-red-400',
  'text-red-600': 'text-red-600 dark:text-red-400',
  'bg-orange-50': 'bg-orange-50 dark:bg-orange-500/10',
  'text-orange-700': 'text-orange-700 dark:text-orange-400',
  'bg-yellow-50': 'bg-yellow-50 dark:bg-yellow-500/10',
  'text-yellow-700': 'text-yellow-700 dark:text-yellow-400',
  'bg-violet-50': 'bg-violet-50 dark:bg-violet-500/10',
  'text-violet-700': 'text-violet-700 dark:text-violet-400',
  'bg-indigo-50': 'bg-indigo-50 dark:bg-indigo-500/10',
  'text-indigo-700': 'text-indigo-700 dark:text-indigo-400',
  'border-blue-100': 'border-blue-100 dark:border-blue-500/20',
  'border-red-100': 'border-red-100 dark:border-red-500/20',
  'border-emerald-100': 'border-emerald-100 dark:border-emerald-500/20',
  'border-orange-100': 'border-orange-100 dark:border-orange-500/20',
  'border-violet-100': 'border-violet-100 dark:border-violet-500/20',
  'border-indigo-100': 'border-indigo-100 dark:border-indigo-500/20',
};

// Exclude these exact matches from specific rules if needed, but word boundary \b should be quite safe.

function walk(dir) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      file = path.join(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(file));
      } else if (file.endsWith('.jsx')) {
        results.push(file);
      }
    });
  } catch (e) {}
  return results;
}

const dirs = ['./src/Components', './src/pages', './src/layouts'];
let files = [];
dirs.forEach(d => files = files.concat(walk(d)));
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  Object.keys(MAP).forEach(key => {
    // Look for exact word match, NOT preceded by `dark:` or `-` (to avoid replacing parts of other classes)
    // NOT followed by `/` or `-` 
    // e.g. text-slate-500 should not match text-slate-500/50
    // e.g. bg-white should not match dark:bg-white
    const regex = new RegExp(`(?<!dark:|[-/a-zA-Z0-9])\\b${key}\\b(?![-/])`, 'g');
    content = content.replace(regex, MAP[key]);
  });
  
  // Custom manual replacements for specific tricky ones like bg-slate-50/50
  content = content.replace(/(?<!dark:|[-/a-zA-Z0-9])\bbg-slate-50\/([0-9]+)\b/g, (match, opacity) => {
    return `${match} dark:bg-slate-800/${opacity}`;
  });
  content = content.replace(/(?<!dark:|[-/a-zA-Z0-9])\border-slate-200\/([0-9]+)\b/g, (match, opacity) => {
    return `${match} dark:border-slate-700/${opacity}`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Updated:', file);
  }
});
console.log(`Updated ${changed} files.`);
