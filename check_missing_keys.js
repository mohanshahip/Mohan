const fs = require('fs');
const path = require('path');

const enPath = 'd:/backup/mohanfinal/frontend/src/i18n/en.json';
const adminPath = 'd:/backup/mohanfinal/frontend/src/pages/Admin';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const existingKeys = getKeys(en);

function findKeysInDir(dir) {
  const files = fs.readdirSync(dir);
  let foundKeys = new Set();

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findKeysInDir(fullPath).forEach(k => foundKeys.add(k));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/t\(['"]([a-zA-Z0-9._-]+)['"]\)/g);
      for (const match of matches) {
        foundKeys.add(match[1]);
      }
    }
  });

  return foundKeys;
}

const usedKeys = findKeysInDir(adminPath);
const missingKeys = [...usedKeys].filter(k => !existingKeys.includes(k));

console.log('Missing keys in en.json:');
missingKeys.forEach(k => console.log(k));
