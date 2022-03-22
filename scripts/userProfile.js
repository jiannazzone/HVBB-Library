import { getThisUser, getUserGames } from "./database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

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


onAuthStateChanged(auth, (user) => {

    if (user) {
        console.log(user);
        // User is signed in, see docs for a list of available properties
        // Adjust columns if user is viewing their own profile
        document.getElementById('update-user-info-col').className = 'col-md-5 col-12';
        document.getElementById('game-table-col').className = 'offset-md-1 col-md-5 col-12';

        // Populate form with pre-filled values
        document.getElementById('first-name-update').placeholder = thisUser.first;
        document.getElementById('last-name-update').placeholder = thisUser.last;
        document.getElementById('email-update').placeholder = user.email;

    } else {
        // User is signed out
    }
});