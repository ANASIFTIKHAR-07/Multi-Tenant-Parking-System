const fs = require('fs');
const path = require('path');

const MAP = {
  'from-blue-600 to-indigo-700': 'from-slate-800 to-slate-900',
  'from-blue-500 to-indigo-600': 'from-slate-700 to-slate-800',
  'shadow-blue-600/25': 'shadow-slate-900/20',
  'shadow-blue-600/30': 'shadow-slate-900/20',
  'bg-blue-600 hover:bg-blue-700': 'bg-slate-900 hover:bg-black',
  'active:bg-blue-800': 'active:bg-slate-900',
  'text-blue-600': 'text-slate-900',
  'border-blue-500': 'border-slate-800',
  'focus:border-blue-500': 'focus:border-slate-900',
  'focus:ring-blue-500/10': 'focus:ring-slate-900/5',
  'focus:ring-blue-100': 'focus:ring-slate-200',
  'ring-blue-500/10': 'ring-slate-900/5',
  'bg-blue-50 ': 'bg-slate-50 ',
  'bg-blue-100 dark:bg-blue-900/40': 'bg-slate-200 dark:bg-slate-800/40',
  'bg-indigo-100 dark:bg-indigo-900/40': 'bg-emerald-100/50 dark:bg-emerald-900/20',
  'bg-blue-300': 'bg-slate-400',
};

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
    // Exact match replace using basic string replacement for complex gradients/classes
    // Since some keys have spaces, we can just replace all occurrences.
    content = content.split(key).join(MAP[key]);
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changed++;
    console.log('Upgraded Light Mode in:', file);
  }
});
console.log(`Upgraded ${changed} files to Premium Light Mode.`);
