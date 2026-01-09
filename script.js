// --- DARK MODE LOGIC ---
const toggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// 1. Check for saved user preference on load
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    htmlElement.setAttribute('data-theme', currentTheme);
    updateIcon(currentTheme);
}

// 2. Toggle functionality
toggleBtn.addEventListener('click', () => {
    let theme = htmlElement.getAttribute('data-theme');
    
    if (theme === 'dark') {
        htmlElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        updateIcon('light');
    } else {
        htmlElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        updateIcon('dark');
    }
});

// 3. Helper to swap the Sun/Moon icon inside the button
function updateIcon(theme) {
    if (theme === 'dark') {
        // Show Sun Icon
        toggleBtn.innerHTML = `
            <svg class="icon theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>`;
    } else {
        // Show Moon Icon
        toggleBtn.innerHTML = `
            <svg class="icon theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>`;
    }
}

// --- MAIN SEARCH LOGIC ---
async function searchService() {
    const description = document.getElementById('userInput').value;
    const resultsDiv = document.getElementById('results');
    
    if (!description) return alert("Please describe your problem!");

    // ✨ SHOW SKELETON LOADER (Pro Move)
    resultsDiv.innerHTML = `
        <div class="skeleton-card">
            <div class="skeleton sk-title"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-btn"></div>
        </div>
        <div class="skeleton-card">
            <div class="skeleton sk-title"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-btn"></div>
        </div>
    `;

    try {
        // ✅ CHANGED: Use relative path (works on localhost AND Cloud)
        const response = await fetch('/find-service', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description })
        });

        if (!response.ok) throw new Error("Server connection failed");

        const data = await response.json();
        
        // Clear skeleton
        resultsDiv.innerHTML = '';

        // 1. Urgency Tag
        const tag = document.createElement('div');
        tag.className = `urgency-tag ${data.ai.urgency}`;
        tag.innerText = `${data.ai.urgency} Priority: ${data.ai.service} Needed`;
        resultsDiv.appendChild(tag);

        // 2. Provider Cards
        if (data.providers.length === 0) {
            resultsDiv.innerHTML += `
                <div class="empty-state">
                    <h3>😕 No Providers Found</h3>
                    <p>We identified that you need a <strong>${data.ai.service}</strong>, but none are currently available.</p>
                </div>
            `;
        } else {
            // ✨ Loop to create cards
            data.providers.forEach(p => {
                const card = document.createElement('div');
                card.className = 'provider-card';

                // ✨ Urgency Borders
                if (data.ai.urgency === 'Critical') {
                    card.style.borderLeft = '5px solid #ff4444'; // Red border
                    card.style.backgroundColor = 'rgba(234, 67, 53, 0.08)'; // Red tint
                } else if (data.ai.urgency === 'High') {
                    card.style.borderLeft = '5px solid #ffbb33'; // Orange border
                } else {
                    card.style.borderLeft = '5px solid #00C851'; // Green border
                }

                // ✨ Add Content + ACTION BUTTONS
                card.innerHTML = `
                    <h3>${p.name}</h3>
                    
                    <div class="info-row">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.57A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <span>${p.phone}</span>
                    </div>

                    <div class="info-row">
                        <svg class="icon star-icon" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                        <span>${p.rating} / 5.0</span>
                    </div>

                    ${p.price ? `<div class="info-row" style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 12px;">💰 ${p.price}</div>` : ''}

                    <div class="action-buttons">
                        <a href="tel:${p.phone}" class="btn-call">📞 Call Now</a>
                        <button class="btn-map" onclick="alert('Opening map for ${p.name}...')">📍 Map</button>
                    </div>
                `;
                
                resultsDiv.appendChild(card);
            });
        }

    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<p style="color: var(--urgent-red); text-align:center;">Error connecting to server. Make sure the backend is running!</p>`;
    }
}
