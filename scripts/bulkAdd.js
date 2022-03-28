import { getThisUser, getUserGames, updateUser, deleteGame, addGame } from './database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const auth = getAuth();
let userUID;

// Prepare Toast and Modal
const authToast = document.getElementById('auth-toast');
const authToastBS = new bootstrap.Toast(authToast);
const authModal = document.getElementById('auth-modal');
const authModalBS = new bootstrap.Modal(authModal);

// Listen for submit
document.getElementById('bulk-submit-button').addEventListener('click', function () {
    let inputValue = document.getElementById('bulk-game-input').value;
    if (inputValue != '') {
        const gameMatches = bulkAddGames(inputValue);
        // console.log(gameMatches);
    }
}, false);

// Listen for accept
document.getElementById('add-selected-button').addEventListener('click', async function () {
    // Determine which games are selected
    const allCheckboxes = document.getElementsByClassName('game-checkbox');
    console.log(allCheckboxes);
    for (let i = 0; i < allCheckboxes.length; i++) {
        if (allCheckboxes[i].checked) {
            const idAndName = allCheckboxes[i].id.split('_')
            await addGame(userUID, Number(idAndName[0]), idAndName[1]);
        }
    }
    location.href = `user-profile.html?id=${userUID}`;
}, false);

function bulkAddGames(textInput) {
    console.log('Processing Bulk Add');
    let newGames = textInput.split(',');

    // Check if the input text was CSV, tab-delimited, or newline delimited
    if (newGames.length == 1) {
        newGames = textInput.split('\t'); // tab
    }
    if (newGames.length == 1) {
        newGames = textInput.split('\n'); // newline
    }
    // Remove any leading or trailing whitespace and create object entry
    for (let i = 0; i < newGames.length; i++) {
        newGames[i] = newGames[i].trim();
    }

    let gameMatches = [];
    newGames.forEach((game) => {
        const thisURL = 'https://boardgamegeek.com/xmlapi2/search?type=boardgame&exact=1&query=' + game.replace(/\s/g, "+");
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let x, i, xmlDoc, txt;
                xmlDoc = this.responseXML;
                x = xmlDoc.getElementsByTagName('item');

                let gameID = 0;
                let gameName = '';
                let gameYear = 0;

                // Get game details
                if (x[0] != undefined) {
                    gameID = Number(x[0].id);
                    gameName = x[0].getElementsByTagName('name')[0].getAttribute('value');
                    if (x[0].getElementsByTagName('yearpublished')[0] != undefined) {
                        gameYear = Number(x[0].getElementsByTagName('yearpublished')[0].getAttribute('value'));
                    }
                }
                gameMatches.push({
                    'bggID': gameID,
                    'bggName': gameName,
                    'year': gameYear
                });
            }
        };
        xhttp.open("GET", thisURL, false);
        xhttp.send();
    })

    // Show Game Matches in UI
    document.getElementById('bulk-results').style.display = 'inline';
    const resultsTable = document.getElementById('results-table-body');

    // console.log(gameMatches);
    // console.log(`New Games Length: ${newGames.length}`);
    // console.log(`Game Matches Length: ${gameMatches.length}`);

    let tableHTML = '';
    for (let i = 0; i < gameMatches.length; i++) {

        // Create table row
        tableHTML += `<tr class="gy-5"><td><div class="form-check d-flex"><input class="form-check-input game-checkbox" type="checkbox" value="" id="${gameMatches[i].bggID}_${gameMatches[i].bggName}"`
        
        if (gameMatches[i].bggID != 0) {
            tableHTML += 'checked';
        
        }
        tableHTML += `></div></td><td class="game-name w-auto">${newGames[i]}</td>`;

        if (gameMatches[i].bggID == 0) {
            tableHTML += '<td class="text-danger">Game Not Found</td></tr>';
        } else {
            tableHTML += `<td>${gameMatches[i]['bggName']} (${gameMatches[i]['year']})</td></tr>`;
        }
        tableHTML += '</td>';
    }
    resultsTable.innerHTML = tableHTML;
} // function

auth.onAuthStateChanged(async user => {

    if (user) {
        console.log('signed in');
        userUID = user.uid;
        const thisUser = await getThisUser(userUID);

        // Set Page Elements
        document.getElementById('name-title').innerHTML = `${thisUser.first} ${thisUser.last}`;
        document.title = `Bulk Add: ${thisUser.first} ${thisUser.last}`;

        // Enable button to submit
        document.getElementById('bulk-submit-button').removeAttribute('disabled');

    } else {
        // User is signed out
        console.log('signed out')
        document.getElementById('bulk-submit-button').setAttributeNode('disabled');
    }
});