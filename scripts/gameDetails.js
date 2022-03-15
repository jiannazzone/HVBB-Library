// Load game details from Board Game Geek

function makeAPIcall() {
    const params = new URLSearchParams(location.search);
    const gameID = params.get('id');

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

function getGameDetails(xml) {
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
            designedBy.innerHTML = `Designed by:<br>${allLinks[i].getAttribute('value')}`;
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

    // Image
    const gameImage = document.getElementById('game-image');
    gameImage.src = x.getElementsByTagName('image')[0].innerHTML;
    gameImage.alt = `${gameTitle.innerHTML} Box Art`;

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

    // Source Info
    const sourceButton = document.getElementById('data-source');
    let sourceURL = `https://boardgamegeek.com/boardgame/${x.id}`;
    sourceButton.href = sourceURL;
}