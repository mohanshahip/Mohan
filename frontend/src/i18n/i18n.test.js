
import en from './en.json';
import np from './np.json';

describe('i18n translation files', () => {
  test('en.json and np.json should have the same top-level keys', () => {
    const enKeys = Object.keys(en).sort();
    const npKeys = Object.keys(np).sort();
    expect(enKeys).toEqual(npKeys);
  });

  test('all keys in en.json should have corresponding keys in np.json', () => {
    const checkKeys = (enObj, npObj, path = '') => {
      for (const key in enObj) {
        const currentPath = path ? `${path}.${key}` : key;
        expect(npObj).toHaveProperty(key, `Missing key in np.json: ${currentPath}`);
        if (typeof enObj[key] === 'object' && !Array.isArray(enObj[key])) {
          checkKeys(enObj[key], npObj[key], currentPath);
        }
      }
    };
    checkKeys(en, np);
  });

  test('all keys should follow kebab-case naming convention', () => {
    const checkKebab = (obj, path = '') => {
      for (const key in obj) {
        const currentPath = path ? `${path}.${key}` : key;
        // Skip common words that might be snake_case or have special characters if allowed
        // But the user requested kebab-case normalization
        expect(key).toMatch(/^[a-z0-9-]+$/);
        if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          checkKebab(obj[key], currentPath);
        }
      }
    };
    checkKebab(en);
  });
});
