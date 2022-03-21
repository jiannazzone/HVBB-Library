import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
    apiKey: "AIzaSyCQvqEt6hosrhuWSKsUojtsxo9LSXttn5s",
    authDomain: "hvbb-game-list.firebaseapp.com",
    databaseURL: "https://hvbb-game-list-default-rtdb.firebaseio.com",
    projectId: "hvbb-game-list",
    storageBucket: "hvbb-game-list.appspot.com",
    messagingSenderId: "31730297429",
    appId: "1:31730297429:web:dbe848072678ecb86c82dc",
    measurementId: "G-9S5B94E1BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Listen for submission
// const submitButton = document.getElementById('auth-submit-button');
// submitButton.addEventListener('click', function() {
//     const email = document.getElementById('email-input');
//     const password = document.getElementById('password-input');
// });