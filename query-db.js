const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json'); // Wait, AI studio has default credentials? Let's check how to run firebase admin or if we can use the skills.
