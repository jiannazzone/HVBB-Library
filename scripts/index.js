import { getAllGames } from "./database.js";

// Fill in the table with all games in collection
const allGames = await getAllGames();
console.log(allGames);

const tableBodyHTML = document.getElementById('game-collection');
let tableHTML = '';
allGames.forEach((game) => {
    
    // Add game name to left column
    tableHTML += `<tr class="game-row"><td class="game-name" onclick="location.href='game-info.html?id=${game.bggID}'">${game.bggName}</td><td>`;

    // Add owners to right column. Each owner in a span with appropriate coloring
    let ownersHTML = '';
    game.owners.forEach((owner) => {
        ownersHTML += `<span class="game-owner" style="background-color:${owner.color}">${owner.name['first']} ${owner.name['last'].slice(0,1)}</span>`
    });
    tableHTML += `${ownersHTML}</td></tr>`;
});
tableBodyHTML.innerHTML = tableHTML;