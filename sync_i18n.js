
const fs = require('fs');

const enPath = 'd:/backup/mohanfinal/frontend/src/i18n/en.json';
const npPath = 'd:/backup/mohanfinal/frontend/src/i18n/np.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const np = JSON.parse(fs.readFileSync(npPath, 'utf8'));

// 1. Sync common
en.common.goHome = en.common.goHome || "Go Home";
en.common.goToDashboard = en.common.goToDashboard || "Go to Dashboard";
en.common.notFound = en.common.notFound || {
  "title": "404 - Page Not Found",
  "message": "The page you're looking for doesn't exist or has been moved."
};

np.common.goHome = np.common.goHome || "गृह पृष्ठमा जानुहोस्";
np.common.goToDashboard = np.common.goToDashboard || "ड्यासबोर्डमा जानुहोस्";
np.common.notFound = np.common.notFound || {
  "title": "४०४ - पृष्ठ फेला परेन",
  "message": "तपाईंले खोज्नुभएको पृष्ठ अवस्थित छैन वा सारिएको छ।"
};

// 2. Sync navigation
en.navigation.goHome = en.navigation.goHome || en.common.goHome;
en.navigation.goToDashboard = en.navigation.goToDashboard || en.common.goToDashboard;
en.navigation.notFound = en.navigation.notFound || en.common.notFound;

np.navigation.goHome = np.navigation.goHome || np.common.goHome;
np.navigation.goToDashboard = np.navigation.goToDashboard || np.common.goToDashboard;
np.navigation.notFound = np.navigation.notFound || np.common.notFound;

// 3. Sync projects & gallery keys
const projectKeysToSync = [
  'explore', 'imageCounter', 'aboutCollection', 'allPhotos', 
  'downloadThisPhoto', 'shareCollection', 'viewCollection'
];

projectKeysToSync.forEach(key => {
  if (np.projects[key] && !en.projects[key]) {
    // Translate some common ones or use placeholders
    const enMap = {
      explore: "Explore",
      imageCounter: "{{current}} of {{total}}",
      aboutCollection: "About this Collection",
      allPhotos: "All Photos",
      downloadThisPhoto: "Download this photo",
      shareCollection: "Share Collection",
      viewCollection: "View Collection"
    };
    en.projects[key] = enMap[key];
  }
});

const galleryKeysToSync = ['explore', 'imageCounter', 'aboutCollection'];
galleryKeysToSync.forEach(key => {
  if (en.gallery[key] && !np.gallery[key]) {
    const npMap = {
      explore: "अन्वेषण गर्नुहोस्",
      imageCounter: "{{total}} मध्ये {{current}}",
      aboutCollection: "यस संग्रहको बारेमा"
    };
    np.gallery[key] = npMap[key];
  }
});

// 4. Messages
en.messages.sessionExpired = en.messages.sessionExpired || "Your session has expired. Please login again.";
np.messages.sessionExpired = np.messages.sessionExpired || "तपाईंको सत्र समाप्त भएको छ। कृपया पुन: लगइन गर्नुहोस्।";

// Write back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(npPath, JSON.stringify(np, null, 2), 'utf8');

console.log('JSON files synced successfully!');
