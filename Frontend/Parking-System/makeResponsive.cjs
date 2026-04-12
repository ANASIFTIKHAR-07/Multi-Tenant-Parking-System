const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
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
  return results;
}

const files = walk('./src');
let changedFiles = [];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace grid-cols-2 with grid-cols-1 sm:grid-cols-2 avoiding ones that already have a prefix
  content = content.replace(/(?<![a-z]:)grid-cols-2/g, "grid-cols-1 sm:grid-cols-2");
  
  // Same for grid-cols-3
  content = content.replace(/(?<![a-z]:)grid-cols-3/g, "grid-cols-1 sm:grid-cols-3");
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles.push(file);
  }
});

console.log('Modified files:', changedFiles.join(', '));
