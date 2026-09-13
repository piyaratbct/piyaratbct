const admin = require('firebase-admin');
const fs = require('fs');

// Attempt to load credentials
let serviceAccount;
try {
  // If we had a service account file we would load it here.
  // In the web environment, we usually don't have this script access directly to firestore
  // unless we mock it or use a specific CLI tool.
} catch(e) {}
