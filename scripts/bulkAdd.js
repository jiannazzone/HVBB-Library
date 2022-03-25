import { getThisUser, getUserGames, updateUser, deleteGame } from "./database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const params = new URLSearchParams(location.search);
const userUID = params.get('id');
const thisUser = await getThisUser(userUID);
const auth = getAuth();
console.log(`User: ${userUID}`);

// Set Page Title
document.getElementById('name-title').innerHTML = `${thisUser.first} ${thisUser.last}`;
document.title = `Bulk Add: ${thisUser.first} ${thisUser.last}`;

onAuthStateChanged(auth, (user) => {

    if (user) {
        // Signed in

    } else {
        // User is signed out
    }
});