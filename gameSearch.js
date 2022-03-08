// const input = document.getElementById("gameInput");
// input.addEventListener("input", makeAPIcall);

function makeAPIcall(val) {
    document.getElementById("searchResults").innerHTML = "";
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
    let gameList = {};
    let x, i, xmlDoc, txt;
    xmlDoc = xml.responseXML;
    x = xmlDoc.getElementsByTagName("item");
    for (i = 0; i < x.length; i++) {
        const gameId = Number(x[i].id);
        const gameName = String(x[i].getElementsByTagName("name")[0].getAttribute("value"));
        gameList[gameName] = gameId;
    }

    console.log(gameList);

    res = document.getElementById("searchResults");
    res.innerHTML = "";
    let list = "";
    const keys = Object.keys(gameList);
    keys.forEach((key, i) => {
        list += "<li>" + String(key) + "</li>";
    });
    res.innerHTML = "<ul>" + list + "</ul>";
}