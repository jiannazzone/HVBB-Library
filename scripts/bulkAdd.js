import { getThisUser, getUserGames, updateUser, deleteGame } from './database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const auth = getAuth();
let userUID;

// Listen for submit
document.getElementById('bulk-submit-button').addEventListener('click', function () {
    let inputValue = document.getElementById('bulk-game-input').value;
    if (inputValue != '') {
        const gameMatches = bulkAddGames(inputValue);
        // console.log(gameMatches);
    }
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

    console.log(gameMatches);
    console.log(`New Games Length: ${newGames.length}`);
    console.log(`Game Matches Length: ${gameMatches.length}`);

    let tableHTML = '';
    for (let i = 0; i < gameMatches.length; i++) {
        tableHTML += `<tr class="game-row gy-5" id="${i}"><td>✅</td><td class="game-name w-auto">${newGames[i]}</td>`;

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