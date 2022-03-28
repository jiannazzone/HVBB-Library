// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.8/firebase-app.js";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, limit, setDoc, updateDoc, arrayUnion, arrayRemove, addDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.6.8/firebase-firestore.js';
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
        // console.log(ownerData);
        allOwners.push(ownerData);
    }

    // Sort the games by name
    allOwners.sort((a, b) => {
        let fa = a.data().name['first'].toLowerCase();
        let fb = b.data().name['first'].toLowerCase();
        if (fa < fb) {
            return -1;
        } else {
            return 1;
        }
    });
    return allOwners;
}

export async function getAllGames() {
    // Get all games in the database, and display along with who owns them
    let allGames = []; // Stored as Game objects
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const gameSnap = await getDocs(gameRef);

    for (const game of gameSnap.docs) {
        if (game.exists() && game.data().owners.length > 0) {
            const thisGame = new Game(game.data().bggID, game.data().bggName);
            thisGame.owners = await getGameOwners(game.data().owners)
            allGames.push(thisGame);
        } else if (game.data().owners.length == 0) {
            console.log(`${game.data().bggName} has no owners. Deleting from library...`)
            await deleteDoc(doc(db, 'games', game.id));
        } else {
            console.log('No document found.');
        }
    }
    // Sort the games by name
    allGames.sort((a, b) => {
        let fa = a.bggName.toLowerCase();
        let fb = b.bggName.toLowerCase();
        if (fa < fb) {
            return -1;
        } else {
            return 1;
        }
    });
    return allGames;
}

export async function getThisGame(bggID) {
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const q = query(gameRef, where('bggID', '==', Number(bggID)), limit(1));
    const querySnap = await getDocs(q);
    if (querySnap.docs != []) {
        return querySnap.docs[0];
    } else {
        return null;
    }
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
    userGames.sort((a, b) => {
        let fa = a.bggName.toLowerCase();
        let fb = b.bggName.toLowerCase();
        if (fa < fb) {
            return -1;
        } else {
            return 1;
        }
    });
    return userGames;
}

export async function updateUser(uid, first, last, color) {
    const userRef = doc(db, 'users', uid);
    const docData = {
        color: color,
        name: {
            first: first,
            last: last
        }
    }
    await setDoc(userRef, docData, { merge: true });
    return true;
}

export async function addGame(uid, bggID, bggName) {
    // Check if game exists in master library
    const gameRef = collection(db, 'games').withConverter(gameConverter);
    const q = query(gameRef, where('bggID', '==', Number(bggID)), limit(1));
    const querySnap = await getDocs(q);
    const userRef = doc(db, 'users', uid);

    if (querySnap.docs.length > 0) {
        // Game already in master library
        const thisGameRef = doc(db, 'games', querySnap.docs[0].id);
        await updateDoc(thisGameRef, {
            owners: arrayUnion(userRef)
        });
        console.log('user added to game')
    } else {
        // Game not in master library yet. Need to create the game first
        const gameData = {
            bggID: Number(bggID),
            bggName: bggName,
            owners: [userRef]
        };
        await addDoc(collection(db, 'games'), gameData);
        console.log('game added')
        location.reload();
    }
}

export async function deleteGame(uid, bggID) {
    const gameRef = collection(db, 'games');
    const q = query(gameRef, where('bggID', '==', Number(bggID)), limit(1));
    const querySnap = await getDocs(q);
    const userRef = doc(db, 'users', uid);

    if (querySnap.docs.length == 1) {
        const thisGameRef = doc(db, 'games', querySnap.docs[0].id);
        await updateDoc(thisGameRef, {
            owners: arrayRemove(userRef)
        });
        console.log(`Deleting ${uid} from ${querySnap.docs[0].data().bggName}`);
    }

    // If there are no more owners, delete the game document
    if (querySnap.docs[0].data().owners.length == 0) {
        console.log('No more owners; removing game from master library.')
        await deleteDoc(querySnap.docs[0].docRef);
    }
}

export function hex2hsl(color) {
    // Variables for red, green, blue values
    var r, g, b, hsp;

    // Convert HEX to RGB
    color = +("0x" + color.slice(1).replace(
        color.length < 5 && /./g, '$&$&'));

    r = color >> 16;
    g = color >> 8 & 255;
    b = color & 255;

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark.
    if (hsp > 127.5) {
        // Light color
        return '#000000'; // black text
    }
    else {
        // Dark color
        return '#ffffff'; // white text
    }
}