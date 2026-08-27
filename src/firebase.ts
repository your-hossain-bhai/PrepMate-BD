import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseAppletConfig from '../firebase-applet-config.json';

// Client-side Firebase Configuration for PrepMate BD
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

// Check if valid Firebase configuration is provided
export const isFirebaseConfigured = (): boolean => {
  const apiKey = firebaseConfig.apiKey;
  return Boolean(apiKey && apiKey.length > 10 && !apiKey.includes('sample_dummy'));
};

// Initialize Firebase App safely
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Sync Student Profile to Firestore Database
 */
export const syncStudentToFirestore = async (userId: string, data: Record<string, any>) => {
  try {
    if (!isFirebaseConfigured() || !userId) return;
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore user sync notice:', e);
  }
};

/**
 * Save Quiz Result to Firestore
 */
export const saveQuizResultToFirestore = async (userId: string, quizData: Record<string, any>) => {
  try {
    if (!isFirebaseConfigured() || !userId) return;
    const resultRef = collection(db, 'quizResults');
    await addDoc(resultRef, {
      userId,
      ...quizData,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('Firestore quiz record save notice:', e);
  }
};

/**
 * Test Firebase Firestore Connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    if (!isFirebaseConfigured()) return false;
    const testDoc = await getDoc(doc(db, 'system', 'health'));
    return true;
  } catch (e) {
    console.warn('Firestore healthcheck info:', e);
    return isFirebaseConfigured();
  }
};

/**
 * Fetch Top Students for Leaderboard from Firestore
 */
export const fetchLeaderboardFromFirestore = async (academicLevel?: string, maxCount: number = 30) => {
  try {
    if (!isFirebaseConfigured()) return [];
    let q;
    if (academicLevel && academicLevel !== 'ALL') {
      q = query(
        collection(db, 'users'),
        where('academicLevel', '==', academicLevel),
        orderBy('points', 'desc'),
        limit(maxCount)
      );
    } else {
      q = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(maxCount)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => {
      const data = docSnap.data() as Record<string, any>;
      return {
        id: docSnap.id,
        ...data,
      };
    });
  } catch (e) {
    console.warn('Leaderboard fetch note (falling back to cached/live state):', e);
    return [];
  }
};

/**
 * Fetch Community Posts from Firestore
 */
export const fetchCommunityPostsFromFirestore = async (academicLevel?: string, maxCount: number = 30) => {
  try {
    if (!isFirebaseConfigured()) return [];
    let q;
    if (academicLevel && academicLevel !== 'ALL') {
      q = query(
        collection(db, 'communityPosts'),
        where('academicLevel', '==', academicLevel),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );
    } else {
      q = query(
        collection(db, 'communityPosts'),
        orderBy('createdAt', 'desc'),
        limit(maxCount)
      );
    }
    const snap = await getDocs(q);
    return snap.docs.map(docSnap => {
      const data = docSnap.data() as Record<string, any>;
      return {
        id: docSnap.id,
        ...data,
      };
    });
  } catch (e) {
    console.warn('Community posts fetch note (falling back to cache):', e);
    return [];
  }
};

/**
 * Save / Create Community Post in Firestore
 */
export const saveCommunityPostToFirestore = async (postData: Record<string, any>) => {
  try {
    if (!isFirebaseConfigured()) return null;
    const colRef = collection(db, 'communityPosts');
    const docRef = await addDoc(colRef, {
      ...postData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (e) {
    console.warn('Save community post note:', e);
    return null;
  }
};

/**
 * Toggle Upvote on Community Post in Firestore
 */
export const togglePostUpvoteInFirestore = async (postId: string, userId: string, isUpvoted?: boolean) => {
  try {
    if (!isFirebaseConfigured() || !postId) return;
    const postRef = doc(db, 'communityPosts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const data = snap.data() as Record<string, any>;
      const currentVotes = Number(data.upvotes) || 0;
      const upvotedBy: string[] = Array.isArray(data.upvotedBy) ? data.upvotedBy : [];
      const hasUpvoted = upvotedBy.includes(userId);
      const shouldUpvote = typeof isUpvoted === 'boolean' ? isUpvoted : !hasUpvoted;

      const updatedList = shouldUpvote
        ? [...upvotedBy.filter((u: string) => u !== userId), userId]
        : upvotedBy.filter((u: string) => u !== userId);

      await updateDoc(postRef, {
        upvotes: Math.max(0, currentVotes + (shouldUpvote ? 1 : -1)),
        upvotedBy: updatedList,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn('Toggle upvote note:', e);
  }
};

/**
 * Add Comment to Community Post in Firestore
 */
export const addCommentToPostInFirestore = async (postId: string, commentData: Record<string, any>) => {
  try {
    if (!isFirebaseConfigured() || !postId) return;
    const postRef = doc(db, 'communityPosts', postId);
    const snap = await getDoc(postRef);
    if (snap.exists()) {
      const currentComments = snap.data().comments || [];
      await updateDoc(postRef, {
        comments: [...currentComments, commentData],
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) {
    console.warn('Add comment note:', e);
  }
};

/**
 * Save Weekly Study Plan to Firestore
 */
export const saveStudyPlanToFirestore = async (userId: string, slots: any[]) => {
  try {
    if (!isFirebaseConfigured() || !userId) return;
    const planRef = doc(db, 'studyPlans', userId);
    await setDoc(planRef, {
      userId,
      slots,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (e) {
    console.warn('Save study plan note:', e);
  }
};

/**
 * Fetch Weekly Study Plan from Firestore
 */
export const fetchStudyPlanFromFirestore = async (userId: string) => {
  try {
    if (!isFirebaseConfigured() || !userId) return null;
    const planRef = doc(db, 'studyPlans', userId);
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      return snap.data().slots || null;
    }
    return null;
  } catch (e) {
    console.warn('Fetch study plan note:', e);
    return null;
  }
};

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
};

export type { FirebaseUser };

