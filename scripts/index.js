import { getAllGames, hex2hsl } from "./database.js";

// Prepare Toast and Modal
const authToast = document.getElementById('auth-toast');
const authToastBS = new bootstrap.Toast(authToast);
const authModal = document.getElementById('auth-modal');
const authModalBS = new bootstrap.Modal(authModal);

// Get all games in master library
let allGames = await getAllGames();

const tableBodyHTML = document.getElementById('game-collection-body');
let tableHTML = '';
allGames.forEach((game) => {
    
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
                ${owner.data().name['first']} ${owner.data().name['last'].slice(0,1)}
            </div>`;
    });
    tableHTML += `${ownersHTML}</div></td></tr>`;
});
tableBodyHTML.innerHTML = tableHTML;