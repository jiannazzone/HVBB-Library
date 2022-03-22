// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, limit } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';
const firebaseConfig = {
    apiKey: "AIzaSyCQvqEt6hosrhuWSKsUojtsxo9LSXttn5s",
    authDomain: "hvbb-game-list.firebaseapp.com",
    databaseURL: "https://hvbb-game-list-default-rtdb.firebaseio.com",
    projectId: "hvbb-game-list",
    storageBucket: "hvbb-game-list.appspot.com",
    messagingSenderId: "31730297429",
    appId: "1:31730297429:web:dbe848072678ecb86c82dc",
    measurementId: "G-9S5B94E1BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// User Class
class User {
    constructor(first, last, color) {
        this.first = first;
        this.last = last;
        this.color = color;
    }
}
// User Converter
const userConverter = {
    toFirestore: (user) => {
        return {
            name: {
                first: user.first,
                last: user.last
            },
            color: user.color,
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new User(data.name[first], data.name[last], data.color);
    }
};
// Game Class
class Game {
    constructor(bggID, bggName, owners) {
        this.bggID = bggID;
        this.bggName = bggName;
        this.owners = owners;
    }
}
// Game Converter
const gameConverter = {
    toFirestore: (game) => {
        return {
            bggID: game.bggID,
            bggName: game.bggName,
            owners: game.owners
        }
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Game(data.bggID, data.bggName, data.owners);
    }
};

/*
async function getUsers(db) {
    let allGames = [];
    const userRef = collection(db, 'users');
    const userSnap = await getDocs(userRef);
    userSnap.forEach((doc) => {
        if (doc.exists()) {
            const thisGame = new Game(doc.data().bggID, doc.data().bggName);
            thisGame.owners = getGameOwners(doc.data().owners)
            allGames.push(thisGame);
        } else {
            console.log('No document.');
        }
    });
    console.log(allUsers);
    retrieveUserGames(db, allGames);
}

async function retrieveUserGames(db, allUsers) {
    // Try printing out all the games
    const firstUser = allUsers[0];
    const data = await getDoc(firstUser.gamesOwned[0]);
    console.log(data.data());
}
*/

export async function getGameOwners(ownerRefs) {
    let allOwners = [];
    for (const ownerRef of ownerRefs) {
        const ownerData = await getDoc(ownerRef);
        console.log(ownerData);
        allOwners.push(ownerData.data());
    }
    return allOwners;
}

export async function getAllGames() {
    // Get all games in the database, and display along with who owns them
    let allGames = []; // Stored as Game objects
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const gameSnap = await getDocs(gameRef);

    for (const game of gameSnap.docs) {
        if (game.exists()) {
            const thisGame = new Game(game.data().bggID, game.data().bggName);
            thisGame.owners = await getGameOwners(game.data().owners)
            allGames.push(thisGame);
        } else {
            console.log('No document found.');
        }
    }
    return allGames;
}

export async function getThisGame(bggID) {
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const q = query(gameRef, where('bggID', '==', Number(bggID)), limit(1));
    const querySnap = await getDocs(q);
    return querySnap.docs[0].data();
}

export async function getThisUser(userUID) {
    const userRef = doc(db, 'users', userUID);
    const userSnap = await getDoc(userRef);
    const thisUser = new User(userSnap.data().name['first'], userSnap.data().name['last'], userSnap.data().color);
    return thisUser;
}

export async function getUserGames(userUID) {
    let userGames = [];
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const docRef = doc(db, 'users', userUID);
    const q = query(gameRef, where('owners', 'array-contains', docRef));
    const querySnap = await getDocs(q);
    for (const game of querySnap.docs) {
        const thisGame = new Game(game.data().bggID, game.data().bggName);
        userGames.push(thisGame);
    }
    return userGames;
}