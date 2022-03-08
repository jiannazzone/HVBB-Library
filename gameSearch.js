var activeGame = "";

function makeAPIcall(val) {
    let thisUrl = "https://boardgamegeek.com/xmlapi2/search?type=boardgame,boardgameexpansion&query=" + val;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            createGameList(this);
        }
    };
    xmlhttp.open("GET", thisUrl, true);
    xmlhttp.send();
}

function createGameList(xml) {

    // Prepare UI by hiding previous results
    const gameSearchResults = document.getElementById("gameSearchResults");
    gameSearchResults.style.visibility = "hidden";
    gameSearchResults.style.borderStyle = "none";

    // Clear all child divs inside gameSearchResults
    clearDiv(gameSearchResults);

    let gameList = {};
    let x, i, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("item");
    for (i = 0; i < x.length; i++) {
        const gameId = Number(x[i].id);
        const gameName = String(x[i].getElementsByTagName("name")[0].getAttribute("value"));
        gameList[gameId] = gameName;
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

    // Handle click on search results
    const filteredGames = document.getElementsByClassName("resultItem");
    for (game of filteredGames) {
        game.addEventListener("click", function() { selectGame(this, gameSearchResults) });
    }
}

function selectGame(game, resultsDiv) {
    activeGame = game.innerHTML;
    document.getElementById("gameInput").value = activeGame;
    console.log(activeGame)

    // Reset UI
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

    // Clear all child divs inside gameSearchResults
    clearDiv(gameSearchResults);

}