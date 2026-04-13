let pScore = 0;
let bScore = 0;

// Sayfa yüklendiğinde isimleri ayarla
document.addEventListener('DOMContentLoaded', () => {
    const pName = localStorage.getItem('playerName') || "SAVAŞÇI";
    const bName = localStorage.getItem('opponentName') || "BadHand";

    document.getElementById('p-name-label').innerText = pName.toUpperCase();
    document.getElementById('b-name-label').innerText = bName.toUpperCase();
});

function playGame(playerChoice) {
    const pHand = document.getElementById('player-hand');
    const bHand = document.getElementById('bot-hand');
    const btns = document.querySelectorAll('.choice-btn');

    btns.forEach(b => b.disabled = true);
    resetVFX();

    const choices = ['tas', 'kagit', 'makas'];
    const botChoice = choices[Math.floor(Math.random() * 3)];

    pHand.classList.remove('idle');
    bHand.classList.remove('idle');
    
    pHand.className = 'hand-sprite ' + playerChoice + '-anim';
    bHand.className = 'hand-sprite ' + botChoice + '-anim';

    setTimeout(() => {
        const winner = getWinner(playerChoice, botChoice);
        applyVFX(winner);
    }, 500);

    setTimeout(() => {
        resetVFX();
        pHand.className = 'hand-sprite idle';
        bHand.className = 'hand-sprite idle';
        btns.forEach(b => b.disabled = false);
    }, 2000);
}

function getWinner(p, b) {
    if (p === b) return "draw";
    if ((p === 'tas' && b === 'makas') || 
        (p === 'kagit' && b === 'tas') || 
        (p === 'makas' && b === 'kagit')) {
        pScore++;
        document.getElementById('player-score').innerText = pScore;
        return "player";
    } else {
        bScore++;
        document.getElementById('bot-score').innerText = bScore;
        return "bot";
    }
}

function applyVFX(result) {
    if (result === "player") {
        document.getElementById('p-spot').classList.add('show-spot');
        document.getElementById('b-slash').classList.add('animate-slash');
        document.getElementById('bot-hand').classList.add('lose-fade');
    } else if (result === "bot") {
        document.getElementById('b-spot').classList.add('show-spot');
        document.getElementById('p-slash').classList.add('animate-slash');
        document.getElementById('player-hand').classList.add('lose-fade');
    }
}

function resetVFX() {
    document.querySelectorAll('.spotlight').forEach(s => s.classList.remove('show-spot'));
    document.querySelectorAll('.slash-effect').forEach(s => s.classList.remove('animate-slash'));
    document.querySelectorAll('.hand-sprite').forEach(h => h.classList.remove('lose-fade'));
}