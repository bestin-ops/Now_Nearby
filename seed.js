const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

// Initialize Firebase (Check if already running to prevent errors)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

// Expanded List of Providers (20 Total)
const providers = [
    // --- EXISTING ---
    { name: "Riverbend Plumbing", service_type: "Plumber", phone: "555-0101", rating: 4.8, is_available: true, price: "$80/hr" },
    { name: "Elite Sparky Solutions", service_type: "Electrician", phone: "555-0102", rating: 4.9, is_available: true, price: "$90/hr" },
    { name: "Spectrum Painters", service_type: "Painter", phone: "555-0103", rating: 4.7, is_available: true, price: "$50/hr" },
    { name: "Green Thumb Gardens", service_type: "Gardener", phone: "555-0104", rating: 4.6, is_available: true, price: "$40/hr" },
    { name: "Heritage Carpentry", service_type: "Carpenter", phone: "555-0105", rating: 5.0, is_available: true, price: "$75/hr" },
    { name: "AquaGuardians", service_type: "Plumber", phone: "555-0106", rating: 4.5, is_available: true, price: "$85/hr" },
    { name: "Bright Light Electric", service_type: "Electrician", phone: "555-0107", rating: 4.2, is_available: true, price: "$88/hr" },
    { name: "Fresh Coat Pros", service_type: "Painter", phone: "555-0108", rating: 4.8, is_available: false, price: "$55/hr" },
    { name: "Lawn & Leaf Care", service_type: "Gardener", phone: "555-0109", rating: 4.7, is_available: true, price: "$45/hr" },
    { name: "The Wood Whisperer", service_type: "Carpenter", phone: "555-0110", rating: 4.9, is_available: true, price: "$70/hr" },

    // --- NEW ADDITIONS ---

    // 🛠️ General / Handyman
    { name: "Jack of All Trades", service_type: "General", phone: "555-0601", rating: 4.5, is_available: true, price: "$40/hr" },
    { name: "QuickFix Maintenance", service_type: "General", phone: "555-0602", rating: 4.8, is_available: true, price: "$50/hr" },
    { name: "Home Helpers Inc.", service_type: "General", phone: "555-0603", rating: 4.3, is_available: true, price: "$35/hr" }, // <--- COMMA ADDED HERE ✅
    
    // 🚑 Ambulance / Emergency
    { name: "City Rapid Response", service_type: "Ambulance", phone: "911-001", rating: 5.0, is_available: true, price: "Emergency Rates" },
    { name: "LifeLine Private EMS", service_type: "Ambulance", phone: "555-0200", rating: 4.8, is_available: true, price: "$200 Base Fee" },

    // 🪨 Stone Workers (Masons)
    { name: "Rock Solid Masonry", service_type: "Stone Worker", phone: "555-0301", rating: 4.7, is_available: true, price: "$60/hr" },
    { name: "Granite & Marble Masters", service_type: "Stone Worker", phone: "555-0302", rating: 4.9, is_available: true, price: "$75/hr" },

    // 🧱 Bricklayers
    { name: "BuildRight Bricklaying", service_type: "Bricklayer", phone: "555-0401", rating: 4.6, is_available: true, price: "$55/hr" },
    { name: "The Brick Boss", service_type: "Bricklayer", phone: "555-0402", rating: 4.5, is_available: true, price: "$50/hr" },

    // 🛠️ Mechanics
    { name: "QuickFix Auto", service_type: "Mechanic", phone: "555-0501", rating: 4.4, is_available: true, price: "$90/hr" }
];

async function uploadData() {
    console.log("🚀 Starting upload to Firestore...");
    
    const batch = db.batch();

    providers.forEach((provider) => {
        const docRef = db.collection('providers').doc(); 
        batch.set(docRef, provider);
    });

    try {
        await batch.commit();
        console.log(`✅ Successfully added ${providers.length} providers to the database!`);
    } catch (error) {
        console.error("❌ Error uploading data:", error);
    }
    
    process.exit();
}

uploadData();