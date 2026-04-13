const harfler = "ABCÇDEFGHIİJKLMNOÖPRSŞTUÜVYZ";
const categories = ["İsim", "Şehir", "Hayvan", "Bitki", "Eşya", "Ünlü", "Ülke"];
const botMsgs = ["Buldum!", "Çok zormuş!", "Şehir ne var?", "Kopyaya hayır :)", "Süre bitiyor!", "Hadi herkes yazsın"];

let playerCount = 3, timeLeft = 90, currentHarf = "", gameActive = false, activeCategoryIndex = -1;
let userAnswers = Array(7).fill(""), timerInterval, ruletInterval, allData = [];
let playerNames = ["SİZ"];
let currentItiraz = { pIdx: null, cIdx: null };

// --- CHAT SİSTEMİ ---
function addChatMessage(sender, text) {
    const div = document.createElement('div');
    div.className = (sender === "SİZ" || sender === "Sistem") ? "msg" : "msg bot-msg";
    div.innerHTML = `<b>${sender}:</b> ${text}`;
    const chatBox = document.getElementById('chatMessages');
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('chatInput').onkeypress = (e) => {
    if(e.key === 'Enter' && e.target.value.trim()){
        addChatMessage("SİZ", e.target.value);
        e.target.value = "";
    }
};

function botChatLoop() {
    if(!gameActive) return;
    if(Math.random() > 0.7) {
        const bot = playerNames[Math.floor(Math.random()*(playerCount-1))+1];
        addChatMessage(bot, botMsgs[Math.floor(Math.random()*botMsgs.length)]);
    }
    setTimeout(botChatLoop, 4000);
}

// --- KURULUM VE BAŞLATMA ---
function startSetup(num) {
    playerCount = num;
    playerNames = ["SİZ"];
    const bots = ["Aslı_Bot", "Mert_X", "Can_Retro", "Ece_VR", "Selin_AI", "Bora_90s"];
    for(let i=0; i < num-1; i++) playerNames.push(bots[i]);
    document.getElementById('setupScreen').style.display = 'none';
    document.getElementById('startBtn').style.display = 'block';
    initBoard();
}

function initBoard() {
    const board = document.getElementById('board');
    const container = document.getElementById('dialContainer');
    board.innerHTML = "";
    categories.forEach((cat, i) => {
        board.innerHTML += `<div class="score-item"><div class="score-header">${cat}</div><div class="score-val" id="val-${i}"></div></div>`;
        const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180);
        const x = 210 + 160 * Math.cos(angle) - 42.5;
        const y = 210 + 160 * Math.sin(angle) - 42.5;
        const hole = document.createElement('div');
        hole.className = 'category-hole'; hole.id = `hole-${i}`;
        hole.style.left = `${x}px`; hole.style.top = `${y}px`;
        hole.style.backgroundColor = `hsl(${i * 50}, 60%, 30%)`;
        hole.innerText = cat; hole.onclick = () => openInput(i);
        container.appendChild(hole);
    });
}

// --- RULET VE OYUN DÖNGÜSÜ ---
function ruletiBaslat() {
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('ruletWrapper').style.display = 'flex';
    ruletInterval = setInterval(() => {
        currentHarf = harfler[Math.floor(Math.random() * harfler.length)];
        document.getElementById('currentLetter').innerText = currentHarf;
    }, 70);
}

function harfiDurdur() {
    clearInterval(ruletInterval);
    setTimeout(() => {
        document.getElementById('ruletWrapper').style.display = 'none';
        addChatMessage("Sistem", `Harf: ${currentHarf}. Başla!`);
        oyunuBaslat();
    }, 800);
}

function oyunuBaslat() {
    gameActive = true;
    timerInterval = setInterval(() => {
        timeLeft--;
        const timerEl = document.getElementById('timerDisplay');
        timerEl.innerText = timeLeft;
        if (timeLeft <= 10) timerEl.style.color = "var(--red)";
        else if (timeLeft <= 20) timerEl.style.color = "var(--amber)";
        if (timeLeft <= 0) bitir();
    }, 1000);
    openInput(0);
    botChatLoop();
}

// --- GİRİŞ VE KAYIT ---
function openInput(index) {
    if (!gameActive) return;
    activeCategoryIndex = index;
    document.querySelectorAll('.category-hole').forEach(h => h.classList.remove('active'));
    document.getElementById(`hole-${index}`).classList.add('active');
    document.getElementById('activeCatLabel').innerText = `${currentHarf}-${categories[index]}:`;
    document.getElementById('inputZone').style.display = 'flex';
    document.getElementById('answerInput').focus();
}

function saveProcess() {
    const val = document.getElementById('answerInput').value.trim();
    if (val && val[0].toLocaleUpperCase('tr-TR') === currentHarf) {
        userAnswers[activeCategoryIndex] = val;
        document.getElementById(`val-${activeCategoryIndex}`).innerText = val;
        document.getElementById(`hole-${activeCategoryIndex}`).classList.add('filled');
        document.getElementById('answerInput').value = "";
        gec();
    } else if (val) {
        const el = document.getElementById('statusMessage');
        el.style.opacity = 1; setTimeout(() => el.style.opacity = 0, 1500);
    }
}

function gec() { openInput((activeCategoryIndex + 1) % 7); }
document.getElementById('answerInput').onkeypress = (e) => { if(e.key === 'Enter') saveProcess(); };

// --- BİTİŞ VE PUANLAMA ---
function bitir() {
    gameActive = false; clearInterval(timerInterval);
    document.getElementById('inputZone').style.display = 'none';
    allData = [];
    for (let p = 0; p < playerCount; p++) {
        let pAns = (p === 0) ? [...userAnswers] : categories.map(() => Math.random() > 0.4 ? currentHarf + "Cevap" : "");
        allData.push({ name: playerNames[p], answers: pAns, points: Array(7).fill(0), iptal: Array(7).fill(false), total: 0 });
    }
    hesapla();
    document.getElementById('finalOverlay').style.display = 'block';
}

function hesapla() {
    allData.forEach(p => { p.total = 0; p.points.fill(0); });
    for (let c = 0; c < 7; c++) {
        let catAns = allData.map(p => p.iptal[c] ? "" : p.answers[c].toLocaleLowerCase('tr-TR').trim());
        allData.forEach((player, pIdx) => {
            let ans = catAns[pIdx]; if (!ans) return;
            let same = catAns.filter(a => a === ans).length;
            let valid = catAns.filter(a => a !== "").length;
            let p = (valid === 1) ? (playerCount >= 7 ? 20 : 15) : (same === 1 ? 15 : 10);
            if (same > 1 && same === valid) p = 5;
            player.points[c] = p; player.total += p;
        });
    }
    tabloyuCiz();
}

function tabloyuCiz() {
    let h = `<table style="width:100%; border-collapse:collapse;"><thead><tr style="background:#222;"><th>Kategori</th>`;
    playerNames.forEach(n => h += `<th style="color:var(--gold)">${n}</th>`);
    h += `</tr></thead><tbody>`;
    categories.forEach((cat, cIdx) => {
        h += `<tr><td style="font-weight:bold; background:#1a1a1a; padding:12px;">${cat}</td>`;
        allData.forEach((p, pIdx) => {
            h += `<td class="${p.iptal[cIdx]?'iptal-cevap':''}" style="border:1px solid #333; padding:10px;">
                <span style="font-size:0.7rem; color:var(--blue); display:block;">${p.points[cIdx]}P</span>
                ${p.answers[cIdx] || '-'} ${(!p.iptal[cIdx] && p.answers[cIdx] && pIdx !== 0) ? `<button class="itiraz-btn" onclick="openItiraz(${pIdx},${cIdx})">!</button>` : ''}
            </td>`;
        });
        h += `</tr>`;
    });
    h += `</tbody></table><button class="opt-btn" style="width:100%; margin-top:20px; background:var(--green); border:none;" onclick="location.reload()">YENİ OYUN</button>`;
    document.getElementById('tableWrapper').innerHTML = h;
}

// --- İTİRAZ VE OYLAMA ---
function openItiraz(pIdx, cIdx) {
    currentItiraz = { pIdx, cIdx };
    document.getElementById('itirazTargetText').innerText = `${playerNames[pIdx]} oyuncusunun "${allData[pIdx].answers[cIdx]}" cevabına itiraz edilsin mi?`;
    document.getElementById('itirazModal').style.display = 'flex';
}

function itirazOylamasiniBaslat() {
    document.getElementById('itirazModal').style.display = 'none';
    document.getElementById('votingModal').style.display = 'flex';
    document.getElementById('voteCloseBtn').style.display = 'none';
    
    let evet = 1; let hayir = 0;
    let botVoters = playerCount - 2;

    setTimeout(() => {
        for(let i=0; i < botVoters; i++) Math.random() > 0.5 ? evet++ : hayir++;
        if(evet === hayir) Math.random() > 0.5 ? evet++ : hayir++; // Eşitliği boz

        const total = evet + hayir;
        document.getElementById('barYes').style.width = (evet/total*100) + "%";
        document.getElementById('barNo').style.width = (hayir/total*100) + "%";
        document.getElementById('voteNumbers').innerText = `KABUL: ${evet} | RED: ${hayir}`;
        
        if (evet > hayir) {
            document.getElementById('votingStatusText').innerHTML = "<b style='color:var(--green)'>İTİRAZ KABUL!</b> Puan silindi.";
            allData[currentItiraz.pIdx].iptal[currentItiraz.cIdx] = true; hesapla();
        } else {
            document.getElementById('votingStatusText').innerHTML = "<b style='color:var(--red)'>İTİRAZ REDDEDİLDİ!</b>";
        }
        document.getElementById('voteCloseBtn').style.display = 'block';
    }, 1200);
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}