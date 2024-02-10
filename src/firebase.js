const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const firebaseConfig = {
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  credential: admin.credential.cert(serviceAccount),
};

const firebaseApp = admin.initializeApp(firebaseConfig);

const firebaseBucket = firebaseApp.storage().bucket();

console.log('Firebase connected successfully!');

module.exports = { firebaseBucket };
