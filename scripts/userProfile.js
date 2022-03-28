import { getThisUser, getUserGames, updateUser, deleteGame } from "./database.js";
import { getAuth, onAuthStateChanged, updateEmail, deleteUser } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const params = new URLSearchParams(location.search);
const userUID = params.get('id');
const thisUser = await getThisUser(userUID);
const auth = getAuth();
let deleteAccountConfirm = false;

// Set Page Title
document.getElementById('name-title').innerHTML = `${thisUser.first} ${thisUser.last}`;
document.title = `Profile: ${thisUser.first} ${thisUser.last}`;

// Prepare Toast and Modal
const authToast = document.getElementById('auth-toast');
const authToastBS = new bootstrap.Toast(authToast);
const authModal = document.getElementById('auth-modal');
const authModalBS = new bootstrap.Modal(authModal);

// Get Users Games and populate table
const thisUserGames = await getUserGames(userUID);
const gameTable = document.getElementById('game-collection');

if (thisUserGames.length > 0) {
    let tableHTML = '';
    thisUserGames.forEach((game) => {
        tableHTML += `<tr class="game-row gy-5"><td class="game-name w-auto" onclick="location.href='game-info.html?id=${game.bggID}'">${game.bggName}</td><td><button class="btn btn-sm btn-danger signed-in-only" type="button" id="${game.bggID}-delete"><i class="bi bi-trash-fill"></i></button></td></tr>`;
    });
    gameTable.innerHTML = tableHTML;
} else {
    gameTable.innerHTML = '<tr><td colspan="2">No games in collection</td></tr>';
}

// Create event listeners to delete games
thisUserGames.forEach((game) => {
    document.getElementById(`${game.bggID}-delete`).addEventListener('click', function () {
        deleteGame(userUID, game.bggID);
    }, false);
});

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
    } else {
        // Update email address
        updateEmail(auth.currentUser, newEmail).then(() => {
            // Email updated!
            console.log('Email updated')
        }).catch((error) => {
            if (error.code == 'auth/requires-recent-login') {
                document.getElementById('auth-toast-body').innerHTML = 'You need to log in again to do that.';
                const authModal = document.getElementById('auth-modal');
                document.getElementById('email-input').value = auth.currentUser.email;
                const authModalBS = new bootstrap.Modal(authModal);
                authModalBS.show();
            } else {
                document.getElementById('auth-toast-body').innerHTML = 'An error has occured';
            }
            console.log(error.code);
            authToastBS.show();
        });
    }

    // Call function from database.js
    updateUser(userUID, newFirst, newLast, newColor);

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

// Account Deletion
document.getElementById('delete-account-button').addEventListener('click', function () {
    deleteAccount();
}, false);

async function deleteAccount() {
    if (deleteAccountConfirm) {
        // Loop through games and delete their userRef from each one
        thisUserGames.forEach((game) => {
            deleteGame(userUID, game.bggID);
        });

        // Delete their account
        deleteUser(auth.currentUser).then(() => {
            // User deleted.
            document.getElementById('auth-toast-body').innerHTML = 'Account deleted.';
            authToastBS.show();

            setTimeout(function () {
                location.href = 'index.html';
            }, 2000);

            document.getElementById('delete-account-button').innerHTML = 'Delete Account';
            deleteAccountConfirm = false;

        }).catch((error) => {

            if (error.code == 'auth/requires-recent-login') {
                document.getElementById('auth-toast-body').innerHTML = 'You need to log in again to do that.';
                authModalBS.show();
            }
            document.getElementById('auth-toast-body').innerHTML = 'An error occured. Could not process deletion.';
            authToastBS.show();
            console.log(error.code);
        });


    } else {
        // Update UI and ask for confirmation
        document.getElementById('delete-account-button').innerHTML = 'Select Again to Confirm';
        deleteAccountConfirm = true;
    }
}