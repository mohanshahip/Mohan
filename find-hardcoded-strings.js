const fs = require('fs');
const path = require('path');

const searchDir = 'd:/backup/mohanfinal/frontend/src';
const outputFile = 'd:/backup/mohanfinal/hardcoded-strings.txt';

const hardcodedStringRegex = />([^<>{}`]+?)</g;

let findings = [];

function searchFiles(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      searchFiles(filePath);
    } else if (filePath.endsWith('.jsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      let match;
      while ((match = hardcodedStringRegex.exec(content)) !== null) {
        const trimmedMatch = match[1].trim();
        if (trimmedMatch.length > 0) {
          findings.push(`${filePath}: ${trimmedMatch}`);
        }
      }
    }
  }
}

searchFiles(searchDir);

fs.writeFileSync(outputFile, findings.join('\n'));

console.log(`Found ${findings.length} hardcoded strings. Results saved to ${outputFile}`);
