const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
    console.log("🔍 Reading Database...");
    const snapshot = await db.collection('providers').get();
    
    if (snapshot.empty) {
        console.log("❌ DATABASE IS EMPTY!");
    } else {
        console.log(`✅ Found ${snapshot.size} providers total.`);
        
        // List unique service types found
        const services = new Set();
        snapshot.forEach(doc => {
            const data = doc.data();
            services.add(data.service_type);
        });
        
        console.log("Services currently in DB:", Array.from(services));
    }
}
check();