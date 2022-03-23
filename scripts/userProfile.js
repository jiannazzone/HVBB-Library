import { getThisUser, getUserGames, updateUser } from "./database.js";
import { getAuth, onAuthStateChanged, updateEmail } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const params = new URLSearchParams(location.search);
const userUID = params.get('id');
const thisUser = await getThisUser(userUID);
const auth = getAuth();

// Set Page Title
document.getElementById('name-title').innerHTML = `${thisUser.first} ${thisUser.last}`;

// Get Users Games and populate table
const thisUserGames = await getUserGames(userUID);
const gameTable = document.getElementById('game-collection');

let tableHTML = '';
thisUserGames.forEach((game) => {
    tableHTML += `<tr class="game-row gy-5"><td class="game-name w-auto" onclick="location.href='game-info.html?id=${game.bggID}'">${game.bggName}</td></tr>`;
});
gameTable.innerHTML = tableHTML;

// Let user update their info
const updateInfoSubmitButton = document.getElementById('update-submit-button');
updateInfoSubmitButton.addEventListener('click', function () {

    // Get values from fields
    let newFirst = document.getElementById('first-name-update').value;
    let newLast = document.getElementById('last-name-update').value;
    let newEmail = document.getElementById('email-update').value;
    const newColor = document.getElementById('color-update').value;

    // If the user did not change the placeholders
    // use the placeholders instead of the empty value fields
    if (newFirst == '') {
        newFirst = document.getElementById('first-name-update').placeholder;
    }
    if (newLast == '') {
        newLast = document.getElementById('last-name-update').placeholder;
    }
    if (newEmail == '') {
        newEmail = document.getElementById('email-update').placeholder;
    }

    // Call function from database.js
    const updateComplete = updateUser(userUID, newFirst, newLast, newColor);

    // Update email address
    updateEmail(auth.currentUser, newEmail).then(() => {
        // Email updated!
        console.log('Email updated')
    }).catch((error) => {
        console.log(error.code);
        document.getElementById('auth-toast-body').innerHTML = 'An error has occured';
        authToastBS.show();
    });

    // Display toast message
    const authToast = document.getElementById('auth-toast');
    const authToastBS = new bootstrap.Toast(authToast);
    document.getElementById('auth-toast-body').innerHTML = 'Profile Updated';
    authToastBS.show();
});


onAuthStateChanged(auth, (user) => {

    if (user) {
        // console.log(user);
        // User is signed in, see docs for a list of available properties
        // Adjust columns if user is viewing their own profile
        document.getElementById('game-table-col').className = 'offset-md-1 col-md-5 col-12';
        document.getElementById('update-user-info-col').style.display = 'inline';

        // Populate form with pre-filled values
        document.getElementById('first-name-update').placeholder = thisUser.first;
        document.getElementById('last-name-update').placeholder = thisUser.last;
        document.getElementById('email-update').placeholder = user.email;
        document.getElementById('color-update').value = thisUser.color;

    } else {
        // User is signed out
        document.getElementById('game-table-col').className = 'offset-md-1 col-md-11 col-12';
        document.getElementById('update-user-info-col').style.display = 'none';
    }
});