require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log("🔑 API Key Loaded:", process.env.GEMINI_KEY ? "YES ✅" : "NO ❌");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ✅ Serves your frontend from the 'public' folder

// --- FIREBASE SETUP ---
try {
    let serviceAccount;
    
    // ✅ CLOUD LOGIC: Checks for Environment Variable first
    if (process.env.FIREBASE_SECRETS) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SECRETS);
    } else {
        // Local fallback
        serviceAccount = require('./serviceAccount.json');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase initialized.");
} catch (error) {
    console.error("❌ Firebase Error:", error.message);
}

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

// --- HYBRID AI LOGIC ---
function localClassify(text) {
    if (!text) return null;
    const input = text.toLowerCase();

    if (input.includes('ambulance') || input.includes('emergency') || input.includes('hospital') || input.includes('hurt')) 
        return { service: 'Ambulance', urgency: 'Critical' };
    if (input.includes('plumber') || input.includes('leak') || input.includes('pipe') || input.includes('water')) 
        return { service: 'Plumber', urgency: 'High' };
    if (input.includes('electrician') || input.includes('spark') || input.includes('wire') || input.includes('power')) 
        return { service: 'Electrician', urgency: 'High' };
    if (input.includes('carpenter') || input.includes('wood') || input.includes('furniture')) 
        return { service: 'Carpenter', urgency: 'Medium' };
    if (input.includes('stone') || input.includes('granite') || input.includes('mason') || input.includes('rock')) 
        return { service: 'Stone Worker', urgency: 'Medium' };
    if (input.includes('brick') || input.includes('wall') || input.includes('mortar')) 
        return { service: 'Bricklayer', urgency: 'Medium' };
    if (input.includes('repair') || input.includes('help') || input.includes('fix')) 
        return { service: 'General', urgency: 'Low' };

    return null;
}

app.post('/find-service', async (req, res) => {
    const { description } = req.body;
    let aiResponse = { service: "General", urgency: "Medium" };

    try {
        console.log(`\n📥 New Request: "${description}"`);

        const localResult = localClassify(description);
        if (localResult) {
            console.log(`⚡ [Local AI] Match: ${localResult.service}`);
            aiResponse = localResult;
        } else {
            try {
                console.log("🧠 Asking Google AI...");
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `Classify request: "${description}". Return JSON: { "service": "Plumber" | "Electrician" | "Stone Worker" | "Bricklayer" | "Ambulance" | "General", "urgency": "High" | "Medium" }`;
                const result = await model.generateContent(prompt);
                const text = result.response.text().replace(/```json|```/g, "").trim();
                aiResponse = JSON.parse(text);
                console.log(`🤖 Gemini says: ${aiResponse.service}`);
            } catch (e) {
                console.error("⚠️ Gemini Error:", e.message);
            }
        }

        const serviceQuery = toTitleCase(aiResponse.service); 
        console.log(`🔍 Searching DB for: "${serviceQuery}"`);

        const snapshot = await db.collection('providers')
            .where('service_type', '==', serviceQuery)
            .where('is_available', '==', true)
            .get();

        const providers = [];
        snapshot.forEach(doc => providers.push(doc.data()));

        console.log(`✅ Sending ${providers.length} providers.`);
        res.json({ ai: aiResponse, providers });

    } catch (error) {
        console.error("❌ SERVER ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
