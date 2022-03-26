// Load game details from Board Game Geek

import { getThisGame, getGameOwners, addGame } from "./database.js";
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-auth.js';

const auth = getAuth();
let userUID;

const params = new URLSearchParams(location.search);
const gameID = params.get('id');

makeAPIcall();

// Listen for Add Game
const addGameButton = document.getElementById('add-game-button');
addGameButton.addEventListener('click', function () {
    addGame(userUID, gameID, document.getElementById('game-title').innerHTML);
}, false);

function makeAPIcall() {

    let thisUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameID}&stats=1`;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            getGameDetails(this);
        }
    };
    xmlhttp.open("GET", thisUrl, true);
    xmlhttp.send();
}

async function getGameDetails(xml) {
    const xmlDoc = xml.responseXML;
    const x = xmlDoc.getElementsByTagName('item')[0];
    const colorScale = ['darkgreen', 'darkgoldenrod', 'darkorange', 'darkred']; // Colors for game ratings

    // Title
    const gameTitle = document.getElementById('game-title');
    gameTitle.innerHTML = x.getElementsByTagName('name')[0].getAttribute('value');
    document.title = x.getElementsByTagName('name')[0].getAttribute('value');

    // Designer
    const designedBy = document.getElementById('game-designer');
    const allLinks = x.getElementsByTagName('link');
    for (let i = 0; i < allLinks.length; i++) {
        if (allLinks[i].getAttribute('type') == 'boardgamedesigner') {
            designedBy.innerHTML = `Designed by: ${allLinks[i].getAttribute('value')}`;
            break;
        }
    }

    // Rating
    const rating = document.getElementById('rating');
    const gameRating = Number(x.getElementsByTagName('statistics')[0].getElementsByTagName('ratings')[0].getElementsByTagName('average')[0].getAttribute('value'));
    rating.innerHTML += ` ${gameRating.toFixed(1)} / 10`;
    rating.style.color = 'white';
    if (gameRating >= 8) {
        rating.style.backgroundColor = colorScale[0];
    } else if (gameRating >= 6) {
        rating.style.backgroundColor = colorScale[1];
    } else if (gameRating >= 4) {
        rating.style.backgroundColor = colorScale[2];
    } else {
        rating.style.backgroundColor = colorScale[3];
    }

    // Complexity
    const complexity = document.getElementById('complexity');
    const gameComplexity = Number(x.getElementsByTagName('statistics')[0].getElementsByTagName('ratings')[0].getElementsByTagName('averageweight')[0].getAttribute('value'));
    complexity.innerHTML += ` ${gameComplexity.toFixed(1)} / 5`;

    // Image
    const gameImage = document.getElementById('game-image');
    gameImage.src = x.getElementsByTagName('image')[0].innerHTML;
    gameImage.alt = `${gameTitle.innerHTML} Box Art`;
    gameImage.onclick = function () { window.open(`https://boardgamegeek.com/boardgame/${x.id}`, '_blank') };

    // Player Count
    const playerCount = document.getElementById('player-count');
    playerCount.innerHTML += ` ${x.getElementsByTagName('minplayers')[0].getAttribute('value')} - ${x.getElementsByTagName('maxplayers')[0].getAttribute('value')} Players`;

    // Play Time
    const playTime = document.getElementById('play-time');
    const minTime = x.getElementsByTagName('minplaytime')[0].getAttribute("value");
    const maxTime = x.getElementsByTagName('maxplaytime')[0].getAttribute("value");
    let playTimeText;
    if (Number(minTime) != Number(maxTime)) {
        playTimeText = ` ${minTime} - ${maxTime} Min`;
    } else {
        playTimeText = ` ${minTime} Min`;
    }
    playTime.innerHTML += playTimeText;

    // Owners
    try {
        displayOwners();
    } catch {
        console.log('Game not in library.')
    }
}

async function displayOwners() {
    // Get owners from Firestore
    const thisGame = await getThisGame(gameID);
    if (thisGame.owners.length > 0) {
        const gameOwners = await getGameOwners(thisGame.owners);
        // Create HTML elements
        const ownersDiv = document.getElementById('game-owners-card');
        ownersDiv.innerHTML = '<h2>Owners</h2>';
        let ownersHTML = '';
        gameOwners.forEach((owner) => {
            ownersHTML += `<span class="game-owner" style="background-color:${owner.data().color}; border:1px solid darkolivegreen;" onclick="location.href='user-profile.html?id=${owner.ref.path.split('/')[1]}'">${owner.data().name['first']} ${owner.data().name['last'].slice(0, 1)}</span>`
        });
        ownersDiv.innerHTML += ownersHTML;
    }
}

onAuthStateChanged(auth, (user) => {

    if (user) {
        // User is signed in
        userUID = user.uid;

        // Check to see if the user owns this game
        // If so, remove the "Add Game" button and show "Delete Game" button

    } else {
        // User is signed out
    }
});