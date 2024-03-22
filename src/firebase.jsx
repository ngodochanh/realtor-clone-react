// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCNuwjML11u07XYctRH6HZjcg4IDu0qoOY',
  authDomain: 'realtor-clone-react-2ab72.firebaseapp.com',
  projectId: 'realtor-clone-react-2ab72',
  storageBucket: 'realtor-clone-react-2ab72.appspot.com',
  messagingSenderId: '817356594585',
  appId: '1:817356594585:web:c0a4683888233a1eea8708',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage(app);

export { db, storage };
