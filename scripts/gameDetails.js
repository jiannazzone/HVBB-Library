// Load game details from Board Game Geek

function makeAPIcall() {
    const params = new URLSearchParams(location.search);
    const gameID = params.get('id');

    let thisUrl = "https://boardgamegeek.com/xmlapi2/thing?id=" + gameID;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            setTimeout(() => { getGameDetails(this); }, 500);
        }
    };
    xmlhttp.open("GET", thisUrl, true);
    xmlhttp.send();
}

function getGameDetails(xml) {
    const xmlDoc = xml.responseXML;
    const x = xmlDoc.getElementsByTagName('item')[0];

    // Set title
    const gameTitle = document.getElementById('game-title');
    gameTitle.innerHTML = x.getElementsByTagName("name")[0].getAttribute("value");

    // Image
    const gameImage = document.getElementById('game-image');
    gameImage.src = x.getElementsByTagName('image')[0].innerHTML;
    gameImage.alt = `${gameTitle.innerHTML} Box Art`;

    // Player Count
    const playerCount = document.getElementById('player-count');
    playerCount.innerHTML += ` ${x.getElementsByTagName('minplayers')[0].getAttribute("value")} - ${x.getElementsByTagName('maxplayers')[0].getAttribute("value")} Players`;

    // Play Time
    const playTime = document.getElementById('play-time');
    const minTime = x.getElementsByTagName('minplaytime')[0].getAttribute("value");
    const maxTime = x.getElementsByTagName('maxplaytime')[0].getAttribute("value");
    let playTimeText;
    if (minTime != maxTime) {
        playTimeText = ` ${minTime} - ${maxTime} Min`;
    } else {
        playTimeText = ` ${minTime} Min`;
    }
    playTime.innerHTML += playTimeText;

    // Source Info
    const sourceButton = document.getElementById('data-source');
    let sourceURL = `https://boardgamegeek.com/boardgame/${x.id}`;
    sourceButton.href = sourceURL;
}