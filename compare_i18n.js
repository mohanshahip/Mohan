
const fs = require('fs');
const path = require('path');

const enPath = 'd:/backup/mohanfinal/frontend/src/i18n/en.json';
const npPath = 'd:/backup/mohanfinal/frontend/src/i18n/np.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const np = JSON.parse(fs.readFileSync(npPath, 'utf8'));

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

const enKeys = getKeys(en);
const npKeys = getKeys(np);

const missingInNp = enKeys.filter(k => !npKeys.includes(k));
const missingInEn = npKeys.filter(k => !enKeys.includes(k));

console.log('Missing in np.json:', missingInNp);
console.log('Missing in en.json:', missingInEn);
