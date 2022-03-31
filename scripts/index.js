import { getAllGames, hex2hsl } from "./database.js";

// Prepare Toast and Modal
const authToast = document.getElementById('auth-toast');
const authToastBS = new bootstrap.Toast(authToast);
const authModal = document.getElementById('auth-modal');
const authModalBS = new bootstrap.Modal(authModal);

// Get all games in master library
const allGames = await getAllGames();
document.body.onload = displayGames();

const filterVal = document.getElementById('library-filter');
filterVal.addEventListener('input', function () {
    displayGames();
}, false);

// Prevent enter
filterVal.addEventListener('keypress', function(e) {
    if (e.key == 'Enter') {
        e.preventDefault();
        return false;
    }
});

// Clear Button
document.getElementById('clear-button').addEventListener('click', function() {
    filterVal.value = '';
    document.getElementById("clear-button").setAttributeNode(document.createAttribute("disabled"));
    displayGames();
}, false);

function displayGames() {
    const tableBodyHTML = document.getElementById('game-collection-body');
    let tableHTML = '';
    let filteredGames;

    const filterVal = document.getElementById('library-filter');
    
    if (filterVal.value != '') {
        document.getElementById('clear-button').removeAttribute('disabled');
        filteredGames = allGames.filter(function (game) {
            return game.bggName.toLowerCase().includes(filterVal.value.toLowerCase());
        })
    } else {
        filteredGames = allGames;
    }

    filteredGames.forEach((game) => {

        // Add game name to left column. Clicking on name takes you detail page
        tableHTML += `<tr class="game-row gy-5">
                        <td class="game-name w-auto" onclick="location.href='game-info.html?id=${game.bggID}'">${game.bggName}</td>
                        <td class="w-auto">
                            <div class="row align-items-center" style="margin:0px;">`;

        // Add owners to right column. Each owner in a span with appropriate coloring
        let ownersHTML = '';
        game.owners.forEach((owner) => {
            let ownerColor = owner.data().color;
            let ownerTextColor = hex2hsl(ownerColor);

            ownersHTML +=
                `<div class="col-sm game-owner" style="background-color:${ownerColor};color:${ownerTextColor};" onclick="location.href='user-profile.html?id=${owner.ref.path.split('/')[1]}'">
                    ${owner.data().name['first']} ${owner.data().name['last'].slice(0, 1)}
                </div>`;
        });
        tableHTML += `${ownersHTML}</div></td></tr>`;
    });
    tableBodyHTML.innerHTML = tableHTML;

}