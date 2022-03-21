import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';
import { getFirestore, collection, doc, setDoc} from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';

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
const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        document.getElementById('login-button').style.display = 'none';
        
        // if (document.getElementById('auth-submit-button').innerHTML == 'Finish') {
        //     console.log(user);
        //     setUserPrefs(user);
        // }

    } else {
        // User is signed out
        document.getElementById('login-button').style.display = 'inline';
    }
});

// Listen for submission
const submitButton = document.getElementById('auth-submit-button');
submitButton.addEventListener('click', function () {
    if (submitButton.innerHTML == 'Submit') {
        createUser();
    } else if (submitButton.innerHTML == 'Finish') {
        setUserPrefs(auth.currentUser);
    }
});

function createUser() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

            // Signed in 
            const user = userCredential.user;

            // Advance the modal
            const credentialsForm = document.getElementById('email-password-modal-form');
            const userPreferencesForm = document.getElementById('display-name-color-modal-form');
            const submitButton = document.getElementById('auth-submit-button').innerHTML = 'Finish';
            credentialsForm.style.display = 'none';
            userPreferencesForm.style.display = 'block';

        })
        .catch((error) => {
            const errorCode = error.code;
            console.log(error.code);

            // Present custom error message
            let errorMessage;
            if (errorCode == 'auth/invalid-email' || (!email.includes('@') && !email.includes('.'))) {
                errorMessage = 'Please enter a valid email address.'
            } else if (password = '') {
                errorMessage = 'Please input a password.'
            } else if (errorCode == 'auth/weak-password') {
                errorMessage = 'You need a stronger password.'
            } else {
                errorMessage = 'An unknown error has occured. Please check your email and password.'
            }
            document.getElementById('login-error-display').innerHTML = errorMessage;
        });
}

async function setUserPrefs(user) {
    // Create user in users collection with matching documentID
    console.log(user);
    const db = getFirestore(app);
    const color = 'red';
    const first = document.getElementById('first-name-input').value;
    const last = document.getElementById('last-name-input').value;

    await setDoc(doc(db, 'users', user.uid), {
        color: color,
        name : {
            first: first,
            last: last
        }
    });

    document.getElementById('auth-modal').hide();
    
}