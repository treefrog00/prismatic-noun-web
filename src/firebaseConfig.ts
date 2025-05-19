import firebase from "firebase/compat/app";
import "firebase/compat/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsV2kLfzHhVnj6uPTu1bfy09CPtqh8tZc",
  authDomain: "prismatic-noun-2.firebaseapp.com",
  projectId: "prismatic-noun-2",
  storageBucket: "prismatic-noun-2.firebasestorage.app",
  messagingSenderId: "54372475396",
  appId: "1:54372475396:web:22328ec68f317f3bc58b51",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
