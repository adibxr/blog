import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// It's highly recommended to use environment variables for your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCD5FoayYfZlMeNHph5QCBxVR7FF851R6w",
  authDomain: "article-8a9a1.firebaseapp.com",
  databaseURL: "https://article-8a9a1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "article-8a9a1",
  storageBucket: "article-8a9a1.appspot.com",
  messagingSenderId: "537477655160",
  appId: "1:537477655160:web:6cec627306d71c4cea1b8d",
};

// This is the UID for the admin user
export const ADMIN_UID = "e95GbAquQtbYOQjW0fucGqjFuRi1";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
