// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJ9gggBJ73KsAxJo8YKbzH6liOSkQvlFM",
  authDomain: "point-table-62900.firebaseapp.com",
  projectId: "point-table-62900",
  messagingSenderId: "791466204569",
  appId: "1:791466204569:web:465bc829779b266dda8708",
  measurementId: "G-5YBXFBN2H2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);