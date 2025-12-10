// CONFIGURATION
const CURRENCY_CONFIG = {
    USD: { symbol: "$", rate: 1 },
    INR: { symbol: "₹", rate: 80 } // 1 USD = 80 INR for gameplay balance
};

let currentCurrency = "USD";
let currentMultiplier = 1;

// STATE
let currentQuarter = 0;
let balance = 1000; // Base balance in USD
let history = [];
let lastState = null; // For Undo functionality

// SCENARIOS (Base values in USD)
const scenarios = [
    { q: 1, title: "Savings Plan", text: "You have some startup cash. Where do you put it?", options: [ { text: "Keep in Cash", change: -50, msg: "Inflation loss" }, { text: "High Yield Savings", change: 50, msg: "Interest gained" } ] },
    { q: 2, title: "Tech Breakdown", text: "Your laptop crashed.", options: [ { text: "Buy New Premium", change: -800, msg: "Expensive but durable" }, { text: "Repair Old", change: -200, msg: "Cheap fix" } ] },
    { q: 3, title: "Side Gig", text: "Opportunity to work weekends.", options: [ { text: "Take Job", change: 500, msg: "Hard work pays off" }, { text: "Relax", change: -50, msg: "Spent on entertainment" } ] },
    { q: 4, title: "Investment", text: "Market looks risky.", options: [ { text: "Invest Stocks", change: -100, msg: "Market crash! Loss" }, { text: "Stay Safe", change: 0, msg: "No gain, no loss" } ] },
    { q: 5, title: "Work Bonus", text: "You got a performance bonus!", options: [ { text: "Save it", change: 300, msg: "Banked the money" }, { text: "Party", change: -100, msg: "Spent bonus + extra" } ] },
    { q: 6, title: "Bad Loan", text: "Bank offers easy loan.", options: [ { text: "Take Loan", change: -400, msg: "Interest killed you later" }, { text: "Reject", change: 0, msg: "Smart choice" } ] },
    { q: 7, title: "Inflation", text: "Cost of living jump.", options: [ { text: "Strict Budget", change: -50, msg: "Controlled damage" }, { text: "Ignore", change: -200, msg: "Overspent" } ] },
    { q: 8, title: "Education", text: "Upskill course available.", options: [ { text: "Buy Course", change: -200, msg: "Knowledge is power" }, { text: "Skip", change: 0, msg: "Saved cash now" } ] },
    { q: 9, title: "Promotion", text: "Did you upskill in Q8?", options: [ { text: "Yes (I did)", change: 500, msg: "Promotion received!" }, { text: "No", change: 0, msg: "Stuck in same role" } ] },
    { q: 10, title: "Car Repair", text: "Brakes are failing.", options: [ { text: "Official Service", change: -300, msg: "Safe & Reliable" }, { text: "DIY Fix", change: -50, msg: "Risky" } ] },
    { q: 11, title: "Taxes", text: "End of financial year.", options: [ { text: "Hire Pro", change: -100, msg: "Found a refund! (+150 net)" }, { text: "Do Yourself", change: -50, msg: "Small fine for error" } ] },
    { q: 12, title: "Year End", text: "Celebrate surviving!", options: [ { text: "Big Trip", change: -500, msg: "Fun but broke" }, { text: "Staycation", change: -50, msg: "Relaxing and cheap" } ] }
];

// --- SETUP FUNCTIONS ---

function setCurrency(type, btn) {
    currentCurrency = type;
    currentMultiplier = CURRENCY_CONFIG[type].rate;
    
    // Update UI buttons
    document.querySelectorAll('.curr-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function formatMoney(amount) {
    const val = amount * currentMultiplier;
    const sym = CURRENCY_CONFIG[currentCurrency].symbol;
    return `${sym}${val.toLocaleString()}`; // Adds commas (e.g., 1,000)
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    currentQuarter = 0;
    balance = 1000;
    history = [];
    switchScreen('game-screen');
    renderTurn();
}

// --- GAMEPLAY FUNCTIONS ---

function renderTurn() {
    if (currentQuarter >= scenarios.length) {
        endGame();
        return;
    }

    const data = scenarios[currentQuarter];
    
    // Update Stats
    document.getElementById('quarter-display').innerText = `${data.q} / 12`;
    document.getElementById('balance-display').innerText = formatMoney(balance);
    
    // Update Card
    document.getElementById('scenario-title').innerText = data.title;
    document.getElementById('scenario-desc').innerText = data.text;
    
    // Reset UI State
    document.getElementById('feedback-msg').classList.add('hidden');
    document.getElementById('game-controls').classList.add('hidden');
    
    // Render Options
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    data.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span>${opt.text}</span>`; // Simple text
        btn.onclick = () => makeChoice(index, opt);
        container.appendChild(btn);
    });
}

function makeChoice(index, option) {
    // 1. Save State for Undo
    lastState = {
        q: currentQuarter,
        bal: balance,
        histLen: history.length
    };

    // 2. Apply Logic
    balance += option.change;
    
    // 3. UI Updates
    const btns = document.querySelectorAll('.option-btn');
    btns.forEach(b => b.disabled = true); // Lock buttons
    btns[index].classList.add('selected'); // Highlight choice

    // 4. Show Feedback
    const fb = document.getElementById('feedback-msg');
    const moneyChange = formatMoney(option.change);
    const sign = option.change >= 0 ? "+" : "";
    
    fb.innerHTML = `${option.msg} <br> <span style="font-size:1.2em">${sign}${moneyChange}</span>`;
    fb.className = option.change >= 0 ? "gain" : "loss";
    fb.classList.remove('hidden');

    // 5. Show Navigation Controls
    document.getElementById('game-controls').classList.remove('hidden');
    document.getElementById('balance-display').innerText = formatMoney(balance); // Update Header immediately
    
    // 6. Add to history
    history.push(`Q${currentQuarter+1}: ${option.text} (${sign}${moneyChange})`);
}

function undoMove() {
    if (!lastState) return;
    
    // Revert State
    currentQuarter = lastState.q;
    balance = lastState.bal;
    if (history.length > lastState.histLen) history.pop(); // Remove last history entry
    
    lastState = null;
    renderTurn(); // Re-render the fresh card
}

function nextMove() {
    currentQuarter++;
    renderTurn();
}

function endGame() {
    switchScreen('end-screen');
    document.getElementById('final-balance').innerText = formatMoney(balance);
    
    const verdict = document.getElementById('final-verdict');
    const thresholdHigh = 1500 * currentMultiplier; // Scale difficulty
    const thresholdMid = 800 * currentMultiplier;

    const finalVal = balance * currentMultiplier;

    if(finalVal > thresholdHigh) {
        verdict.innerText = "🌟 Financial Master! Outstanding Management.";
        verdict.style.color = "var(--accent)";
    } else if(finalVal > thresholdMid) {
        verdict.innerText = "✅ Good Job! You survived comfortably.";
        verdict.style.color = "orange";
    } else {
        verdict.innerText = "⚠️ Bankruptcy Risk. Try to save more next time.";
        verdict.style.color = "var(--loss)";
    }

    const list = document.getElementById('history-list');
    list.innerHTML = "<h3>Decision Log:</h3>" + history.map(item => `<div style="border-bottom:1px solid #eee; padding:5px;">${item}</div>`).join('');
}