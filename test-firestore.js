import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

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
