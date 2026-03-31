// ===== FIREBASE CONFIG (partagé par toutes les pages) =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyC-rnO7GxZnsPMrYW14XfjftZYp8SbDGcM",
    authDomain: "revisfredo.firebaseapp.com",
    projectId: "revisfredo",
    storageBucket: "revisfredo.firebasestorage.app",
    messagingSenderId: "292110186640",
    appId: "1:292110186640:web:865a3cd34d905f5921c015"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Sauvegarder un résultat de quiz ---
async function saveQuizResult(userId, result) {
    // result = { module, code, score, total, percentage, date }
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
        await updateDoc(userRef, {
            quizResults: arrayUnion(result)
        });
    } else {
        await setDoc(userRef, {
            quizResults: [result]
        });
    }
}

// --- Charger tous les résultats ---
async function loadQuizResults(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data().quizResults || [];
    }
    return [];
}

// --- Sauvegarder le streak ---
async function saveStreak(userId, streakData) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        await updateDoc(userRef, { streak: streakData });
    } else {
        await setDoc(userRef, { streak: streakData, quizResults: [] });
    }
}

// --- Charger le streak ---
async function loadStreak(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data().streak || null;
    }
    return null;
}

// --- Sauvegarder le profil (prénom) ---
async function saveProfile(userId, profileData) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        await updateDoc(userRef, profileData);
    } else {
        await setDoc(userRef, { ...profileData, quizResults: [] });
    }
}

// --- Charger le profil ---
async function loadProfile(userId) {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
        return snap.data();
    }
    return null;
}

// --- Mettre à jour la navbar avec le user connecté ---
function setupNavbar(user) {
    const profilLinks = document.querySelectorAll('a[href="profil.html"], a[href="#"]');
    profilLinks.forEach(link => {
        if (link.textContent.trim() === 'Mon profil' || link.textContent.trim().startsWith('Mon profil')) {
            if (user) {
                link.textContent = 'Mon profil';
                link.href = 'profil.html';
            } else {
                link.textContent = 'Connexion';
                link.href = 'profil.html';
            }
        }
    });
}

export {
    app, auth, db,
    onAuthStateChanged, signOut,
    saveQuizResult, loadQuizResults,
    saveStreak, loadStreak,
    saveProfile, loadProfile,
    setupNavbar,
    doc, getDoc, setDoc, updateDoc, arrayUnion, Timestamp
};
