import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';

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

// Prepare Toast and Modal
const authToast = document.getElementById('auth-toast');
const authToastBS = new bootstrap.Toast(authToast);
const authModal = document.getElementById('auth-modal');
const authModalBS = new bootstrap.Modal(authModal);

// Listen for Login
const submitButton = document.getElementById('auth-submit-button');
submitButton.addEventListener('click', function () {
    if (submitButton.innerHTML == 'Submit') {
        signIn();
    } else if (submitButton.innerHTML == 'Finish') {
        createUser();
    }
});

// Listen for Logout
const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', function () {
    signOut(auth).then(() => {
        // Sign-out successful.
        document.getElementById('auth-toast-body').innerHTML = 'Successfully Signed Out';
        authToastBS.show();
    }).catch((error) => {
        console.log(error);
    });

});

onAuthStateChanged(auth, (user) => {

    if (user) {
        // User is signed in, see docs for a list of available properties

        // Edit the Profile Navbar
        document.getElementById('login-button').style.display = 'none';
        const signedInItems = document.getElementsByClassName('signed-in-only');
        for (let i = 0; i < signedInItems.length; i++) {
            signedInItems[i].style.display = 'inline';
        }
        document.getElementById('profile-link').href = `user-profile.html?id=${user.uid}`;
        authModalBS.hide();

    } else {
        // User is signed out
        document.getElementById('logout-button').style.display = 'none';
        const signedInItems = document.getElementsByClassName('signed-in-only');
        for (let i = 0; i < signedInItems.length; i++) {
            signedInItems[i].style.display = 'none';
        }
        authModalBS.hide();
    }
});

function createUser() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {

            // Signed in 
            const user = userCredential.user;
            console.log('signed in');
            setUserPrefs(auth.currentUser);

        })
        .catch((error) => {
            const errorCode = error.code;
            console.log(error.code);
        });
}

function signIn() {
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            authModalBS.hide();

            // Display toast message
            document.getElementById('auth-toast-body').innerHTML = 'Successfully Signed In';
            authToastBS.show();
        })
        .catch((error) => {
            console.log(error.code);
            // Present custom error message
            switch (error.code) {
                case 'auth/user-not-found':
                    // Create new account

                    // Advance the modal
                    const credentialsForm = document.getElementById('email-password-modal-form');
                    const userPreferencesForm = document.getElementById('display-name-color-modal-form');
                    const submitButton = document.getElementById('auth-submit-button').innerHTML = 'Finish';
                    credentialsForm.style.display = 'none';
                    userPreferencesForm.style.display = 'block';
                    break;
                case 'auth/invalid-email':
                    document.getElementById('login-error-display').innerHTML = 'Please enter a valid email address.';
                    break;
                case 'auth/weak-password':
                    document.getElementById('login-error-display').innerHTML = 'You need a stronger password.';
                    break;
                case 'auth/wrong-password':
                    document.getElementById('login-error-display').innerHTML = 'Incorrect password. Please try again.';
                    break;
                default:
                    document.getElementById('login-error-display').innerHTML = 'An unknown error has occured. Please try again.';
                    break;
            }
        });

}

async function setUserPrefs(user) {
    // Create user in users collection with matching documentID
    // console.log(user);
    const db = getFirestore(app);
    const color = document.getElementById('color-input').value;
    const first = document.getElementById('first-name-input').value;
    const last = document.getElementById('last-name-input').value;

    await setDoc(doc(db, 'users', user.uid), {
        color: color,
        name: {
            first: first,
            last: last
        }
    });

    // Display toast message and hide modal
    document.getElementById('auth-toast-body').innerHTML = 'Account Successfully Created';
    authToastBS.show();
    authModalBS.hide();
}