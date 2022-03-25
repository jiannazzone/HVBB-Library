// var activeGame = "";
var gameList = {};
var thisUserGames = [];
var firstSearch = true;

function makeAPIcall(val) {

if (val == '') {
    clearSearch('gameInput');
    return;
}

    let thisUrl = "https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=" + val.replace(/\s/g, "+"); // Spaces are replaced with a + per API instructions
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (firstSearch) {
                setTimeout(() => { createGameList(this); }, 250);
                firstSearch = false;
            } else {
                createGameList(this);
            }
        }
    };
    xmlhttp.open("GET", thisUrl, true);
    xmlhttp.send();
}

function createGameList(xml) {

    gameList = {};
    // Prepare UI by hiding previous results
    const gameSearchResults = document.getElementById("gameSearchResults");
    gameSearchResults.style.visibility = "hidden";
    gameSearchResults.style.borderStyle = "none";
    // document.getElementById("addButton").setAttributeNode(document.createAttribute("disabled"));

    // Clear all child divs inside gameSearchResults
    clearDiv(gameSearchResults);

    let x, i, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName('item');
    
    // Create the game name and append the year if possible
    if (Number(xmlDoc.getElementsByTagName('items')[0].getAttribute('total')) > 0) {
        for (i = 0; i < x.length; i++) {
            const gameId = Number(x[i].id);
            const gameName = x[i].getElementsByTagName('name')[0].getAttribute('value');
            let gameYear = '';
            if (x[i].getElementsByTagName('yearpublished')[0] != undefined) {
                gameYear =  ` (${x[i].getElementsByTagName('yearpublished')[0].getAttribute('value')})`;
            }
            gameList[gameId] = `${gameName}${gameYear}`;
        }
    }

    // Create list of games from Board Game Geek API
    const keys = Object.keys(gameList);
    keys.forEach((key) => {
        const node = document.createElement("div");
        node.className = "resultItem";
        node.id = String(key); // ID from Board Game Geek
        node.innerHTML = gameList[key]; // Name of game
        gameSearchResults.appendChild(node);
    });

    // Show the results
    gameSearchResults.style.visibility = "visible";
    gameSearchResults.style.borderStyle = "solid";
    document.getElementById("clearButton").removeAttribute("disabled");

    // Handle click on search results
    const filteredGames = document.getElementsByClassName("resultItem");
    for (game of filteredGames) {
        game.addEventListener("click", function () { selectGame(this, gameSearchResults) });
    }
}

function selectGame(game, resultsDiv) {
    activeGameID = game.id;
    // document.getElementById("gameInput").value = activeGame;
    // document.getElementById("addButton").removeAttribute("disabled");

    // Reset UI
    window.open(`game-info.html?id=${activeGameID}`, "_self")
    clearDiv(resultsDiv);
    resultsDiv.style.visibility = "hidden";
    gameList = {};
}

function clearDiv(thisDiv) {
    while (thisDiv.firstChild) {
        thisDiv.removeChild(thisDiv.lastChild);
    }
}

function clearSearch(inputId) {
    thisInput = document.getElementById(inputId);
    thisInput.value = "";

    // Prepare UI by hiding previous results
    const gameSearchResults = document.getElementById("gameSearchResults");
    gameSearchResults.style.visibility = "hidden";
    gameSearchResults.style.borderStyle = "none";
    firstSearch = true;

    // Disable buttons
    document.getElementById("clearButton").setAttributeNode(document.createAttribute("disabled"));
    // document.getElementById("addButton").setAttributeNode(document.createAttribute("disabled"));

    // Clear all child divs inside gameSearchResults
    clearDiv(gameSearchResults);

}

function toggleSearch() {
    const gameSearchBox = document.getElementById('game-search-input');
    const searchIcon = document.getElementById('searchIcon');
    searchIcon.style.borderRadius = '0px 4px 4px 0px';
}