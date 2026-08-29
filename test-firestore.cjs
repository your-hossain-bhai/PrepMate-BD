const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { readFileSync } = require('fs');

const configStr = readFileSync('./firebase-applet-config.json', 'utf-8');
const firebaseAppletConfig = JSON.parse(configStr);

const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey,
  projectId: firebaseAppletConfig.projectId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId);

async function run() {
  try {
    const docRef = doc(db, 'communityPosts', 'test-post');
    await setDoc(docRef, { test: true });
    console.log("Success!");
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
