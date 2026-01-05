
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase...", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const STUDENTS = ["Alice", "Bob", "Charlie", "Dave", "Eve"];
const LOCATIONS = ["Hostel A", "Hostel B", "Mess Hall", "Library", "Academic Block"];
const CATEGORIES = ["Plumbing", "Food", "Wifi", "Harassment", "Cleanliness"];

const SEED_DATA = [
    { text: "The wifi in Hostel A is terrible, I can't study.", author: "Alice", level: "Warden", strikes: 0, category: "Wifi", location: "Hostel A" },
    { text: "Food in the mess was uncooked today.", author: "Bob", level: "Warden", strikes: 1, category: "Food", location: "Mess Hall" },
    { text: "There is a water leak on the 3rd floor.", author: "Charlie", level: "HoD", isEscalated: true, strikes: 0, category: "Plumbing", location: "Academic Block" },
    { text: "Someone is playing loud music at 2 AM.", author: "Dave", level: "Warden", strikes: 2, category: "Harassment", location: "Hostel B" },
    // Add more...
];

async function seed() {
    console.log("Seeding data...");

    // Create Users with Strikes
    for (const student of STUDENTS) {
        const strikes = Math.floor(Math.random() * 3);
        await setDoc(doc(db, "users", student), {
            displayName: student,
            strikes: strikes,
            email: `${student.toLowerCase()}@college.edu`
        });
        console.log(`Created User: ${student} (Strikes: ${strikes})`);
    }

    // Create Issues
    for (let i = 0; i < 20; i++) {
        const student = STUDENTS[Math.floor(Math.random() * STUDENTS.length)];
        const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const isEscalated = Math.random() > 0.8;

        await addDoc(collection(db, "issues"), {
            text: `Sample grievance #${i + 1} regarding ${category} at ${location}`,
            normalizedText: `Sample grievance #${i + 1} regarding ${category} at ${location} (Normalized)`,
            author: student,
            status: isEscalated ? "Open" : (Math.random() > 0.5 ? "Resolved" : "Open"),
            level: isEscalated ? "HoD" : "Warden",
            location: location,
            category: category,
            createdAt: Timestamp.now(),
            urgencyScore: Math.floor(Math.random() * 100)
        });
        console.log(`Created Issue #${i + 1}`);
    }

    console.log("Seeding Complete!");
    process.exit(0);
}

seed().catch(console.error);
