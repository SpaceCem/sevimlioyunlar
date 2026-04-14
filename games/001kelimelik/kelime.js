import SOZLUK from './kelimelik.js';
// kelime.js - Başlangıç Entegrasyonu
window.addEventListener('load', () => {
    // 1. Oyuncu İsmini Güncelle
    const kaydedilenAd = localStorage.getItem("playerName");
    const playerLabel = document.querySelector(".player-label");
    
    if (kaydedilenAd && playerLabel) {
        playerLabel.textContent = kaydedilenAd.toUpperCase();
    }

    // 2. Kahraman Resmini Güncelle
    const secilenResimYolu = localStorage.getItem("playerImagePath");
    const playerImgElement = document.getElementById("player-character");
    
    if (secilenResimYolu && playerImgElement) {
        playerImgElement.src = secilenResimYolu;
    }

    // Konsol çıktısı (Test için)
    console.log("Oyuncu:", kaydedilenAd, "Sınıf Resmi:", secilenResimYolu);
});

// Sayfa yüklendiğinde oyuncu ismini localStorage'dan al ve ekrana yazdır
window.addEventListener('load', () => {
    const kaydedilenAd = localStorage.getItem("playerName");
    const playerLabel = document.querySelector(".player-label");

    if (kaydedilenAd && playerLabel) {
        playerLabel.textContent = kaydedilenAd.toUpperCase();
    }
});

// Rakip AI için önceden hazırlanan kelime listesi
let rakipAdaylar = [];
const kelimeSeti = new Set(SOZLUK.map(k => k.toUpperCase()));

const harfPuanlari = {
    'A':1,'E':1,'İ':1,'I':2,'O':2,'U':2,'Ö':4,'Ü':3,
    'K':1,'L':1,'R':1,'N':1,'T':1,'M':2,'S':2,'B':3,'D':3,
    'Y':3,'C':3,'Ç':4,'H':4,'P':4,'Ş':4,'G':4,'V':5,'Z':5,
    'Ğ':7,'J':10,'F':10
};

const harfHavuzu = "AAAAAAAAAEEEEEEEEEIIIIIIIIIIOOOOOOUUUUUULLLLRRRRNNNNSSSSSTTTTTTTİİİİİİİİİBBCCÇDDFFGGĞHHJKMMPPSŞVYYZZÖÖÜÜÜ";

const sesliHarfler = new Set(['A','E','İ','I','O','U','Ö','Ü']);
const sessizHarfler = new Set(['B','C','Ç','D','F','G','Ğ','H','J','K','L','M','N','P','R','S','Ş','T','V','Y','Z']);

// BAŞLANGIÇTA CANLAR 100-100 (Toplam 200)
let playerHP = 100, enemyHP = 100, patiPuan = 150, currentStage = 1, secilenHücreler = [];

const stages = [
    { name: "KARA KEDİ",     img: "images/rakip001.png" },
    { name: "KARA KÖPEK",    img: "images/rakip002.png" },
    { name: "KARA BAYKUŞ",   img: "images/rakip003.png" },
    { name: "KARA KAPİBARA", img: "images/rakip004.png" },
    { name: "KARA KİTAP",    img: "images/boss.png" }
];

const el = {
    grid: document.getElementById('letter-grid'),
    display: document.getElementById('current-word'),
    score: document.getElementById('score-display'),
    playerHP: document.getElementById('player-hp-fill'),
    enemyHP: document.getElementById('enemy-hp-fill'),
    divider: document.getElementById('versus-divider'),
    pImg: document.getElementById('player-character'),
    eImg: document.getElementById('enemy-character'),
    eLabel: document.getElementById('enemy-label'),
    gameOver: document.getElementById('game-over')
};

// ====================== UI (Denge Çubuğu Mantığı) ======================
function updateUI() {
    const total = 200; 
    const pWidth = (playerHP / total) * 100;
    
    el.playerHP.style.width = `${pWidth}%`;
    el.divider.style.left = `${pWidth}%`;
    el.score.textContent = patiPuan;
}

function playBattleAnim(side) {
    if (side === 'player') {
        el.pImg.classList.add('anim-attack-p');
        setTimeout(() => el.eImg.classList.add('anim-hit'), 220);
        setTimeout(() => { el.pImg.classList.remove('anim-attack-p'); el.eImg.classList.remove('anim-hit'); }, 650);
    } else {
        el.eImg.classList.add('anim-attack-e');
        setTimeout(() => el.pImg.classList.add('anim-hit'), 220);
        setTimeout(() => { el.eImg.classList.remove('anim-attack-e'); el.pImg.classList.remove('anim-hit'); }, 650);
    }
}

function showTempMessage(msg, color = "#3a2f1f", duration = 900) {
    const originalText = el.display.textContent;
    const originalColor = el.display.style.color;
    el.display.textContent = msg;
    el.display.style.color = color;
    setTimeout(() => {
        el.display.textContent = originalText;
        el.display.style.color = originalColor || "#3a2f1f";
    }, duration);
}

// ====================== HARF DEĞİŞTİRME ======================
function harfDegistir(tile) {
    const eskiHarf = tile.textContent[0];
    const bedel = harfPuanlari[eskiHarf] || 1;

    if (patiPuan < bedel) {
        showTempMessage("PUAN YETERSİZ!", "#ef4444");
        return;
    }

    patiPuan -= bedel;

    let yeniH;
    if (sesliHarfler.has(eskiHarf)) {
        yeniH = Array.from(sesliHarfler)[Math.floor(Math.random() * sesliHarfler.size)];
    } else {
        yeniH = Array.from(sessizHarfler)[Math.floor(Math.random() * sessizHarfler.size)];
    }

    tile.innerHTML = `${yeniH}<span class="tile-point">${harfPuanlari[yeniH] || 1}</span>`;

    if (tile.classList.contains('selected')) {
        tile.classList.remove('selected');
        secilenHücreler = secilenHücreler.filter(t => t !== tile);
    }

    tile.style.backgroundColor = "#ef4444";
    setTimeout(() => tile.style.backgroundColor = "", 180);

    updateUI();
    updateWordDisplay();
}

// ====================== SEÇME ======================
function harfSec(tile) {
    if (tile.classList.toggle('selected')) {
        secilenHücreler.push(tile);
    } else {
        secilenHücreler = secilenHücreler.filter(t => t !== tile);
    }
    updateWordDisplay();
}

function updateWordDisplay() {
    const kelime = secilenHücreler.map(t => t.textContent[0]).join('');
    el.display.textContent = kelime || "KELİME OLUŞTUR";
    el.display.style.color = "#3a2f1f";
}

// ====================== TABLO ======================
function tabloOlustur() {
    el.grid.innerHTML = "";
    secilenHücreler = [];

    for (let i = 0; i < 25; i++) {
        const h = harfHavuzu[Math.floor(Math.random() * harfHavuzu.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = `${h}<span class="tile-point">${harfPuanlari[h] || 1}</span>`;

        // Mobil ve Masaüstü için Birleştirilmiş Dinleyiciler
        let pressTimer;

        // 1. Dokunma Başlangıcı (Harf Değiştirme - Uzun Basma)
        tile.addEventListener('pointerdown', (e) => {
            // Sağ tık kontrolü (Masaüstü için)
            if (e.button === 2) return; 
            
            // Uzun basma sayacı (750ms)
            pressTimer = setTimeout(() => harfDegistir(tile), 750);
            
            // Mobilde çift tıklama ile zoom yapmayı engeller
            if (e.pointerType === 'touch') {
                tile.style.touchAction = 'none';
            }
        });

        // 2. Dokunma Bitişi / İptali
        tile.addEventListener('pointerup', (e) => {
            clearTimeout(pressTimer);
            // Eğer kısa basıldıysa (uzun basma tetiklenmediyse) harf seç
            if (pressTimer) {
                // Sadece sol tık veya dokunmatik ise
                if (e.button === 0) harfSec(tile);
            }
        });

        tile.addEventListener('pointermove', () => clearTimeout(pressTimer));
        tile.addEventListener('pointercancel', () => clearTimeout(pressTimer));

        // Sağ tık menüsünü engelle (Harf değiştirmeyi tetiklesin)
        tile.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            harfDegistir(tile);
        });

        el.grid.appendChild(tile);
    }
}

// ====================== OYUNCU SALDIRISI ======================
async function saldir() {
    const kelime = secilenHücreler.map(t => t.textContent[0]).join('').toUpperCase();

    if (kelime.length < 3 || !kelimeSeti.has(kelime)) {
        el.display.classList.add('shake');
        setTimeout(() => el.display.classList.remove('shake'), 500);
        return;
    }

    let hasar = 0;
    secilenHücreler.forEach(t => hasar += harfPuanlari[t.textContent[0]] || 1);

    playBattleAnim('player');

    playerHP = Math.min(200, playerHP + hasar);
    enemyHP = Math.max(0, enemyHP - hasar);
    
    patiPuan += Math.floor(hasar * 1.15);
    updateUI();

    secilenHücreler.forEach(tile => {
        const yeniH = harfHavuzu[Math.floor(Math.random() * harfHavuzu.length)];
        tile.innerHTML = `${yeniH}<span class="tile-point">${harfPuanlari[yeniH] || 1}</span>`;
        tile.classList.remove('selected');
    });
    secilenHücreler = [];

    el.display.textContent = `+${hasar} GÜÇ!`;

    if (enemyHP <= 0) {
        setTimeout(stageGecis, 1100);
    } else {
        setTimeout(rakipAI, 1400);
    }
}
// ====================== RAKİP AI HAZIRLIK (Sadece 1 kere çalışır) ======================
function rakipAIHazirla() {
    rakipAdaylar = SOZLUK.filter(k => k.length >= 4 && k.length <= 7);
    console.log(`Rakip AI için ${rakipAdaylar.length} kelime hazırlandı.`);
}
// ====================== RAKİP AI ======================
// ====================== YENİ RAKİP AI (Kelime bulamazsa PASS geçer) ======================
async function rakipAI() {
    el.display.textContent = "Düşman saldırıyor...";

    const tiles = Array.from(document.querySelectorAll('.tile'));
    const harfSayaci = {};
    tiles.forEach(t => {
        const h = t.textContent[0];
        harfSayaci[h] = (harfSayaci[h] || 0) + 1;
    });

    let enIyiKelime = "";
    let enYuksekHasar = 0;
    const maxDeneme = 800;
    const karistirilmis = [...rakipAdaylar].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(maxDeneme, karistirilmis.length); i++) {
        const kelime = karistirilmis[i];
        const kopya = { ...harfSayaci };
        let hasar = 0;
        let kullanilabilir = true;

        for (const h of kelime) {
            if (kopya[h] && kopya[h] > 0) {
                kopya[h]--;
                hasar += harfPuanlari[h] || 1;
            } else {
                kullanilabilir = false;
                break;
            }
        }

        if (kullanilabilir && hasar > enYuksekHasar) {
            enYuksekHasar = hasar;
            enIyiKelime = kelime;
            if (enYuksekHasar >= 32) break;
        }
    }

    if (enIyiKelime) {
        // Kelime buldu → Saldırıyor
        const hasar = Math.max(8, Math.floor(enYuksekHasar * 0.76));

        const rakipHarfler = enIyiKelime.split('');
        const tumTilelar = Array.from(document.querySelectorAll('.tile'));
        let kullanilanIndeksler = new Set();

        rakipHarfler.forEach((harf, i) => {
            const tile = tumTilelar.find((t, idx) => 
                t.textContent[0] === harf && !kullanilanIndeksler.has(idx)
            );
            if (tile) {
                const index = tumTilelar.indexOf(tile);
                kullanilanIndeksler.add(index);

                setTimeout(() => {
                    tile.classList.add('enemy-selected');
                    setTimeout(() => {
                        const yeniH = harfHavuzu[Math.floor(Math.random() * harfHavuzu.length)];
                        tile.innerHTML = `${yeniH}<span class="tile-point">${harfPuanlari[yeniH] || 1}</span>`;
                        tile.classList.remove('enemy-selected');
                        tile.classList.add('new-letter');
                        setTimeout(() => tile.classList.remove('new-letter'), 400);
                    }, 650);
                }, i * 140);
            }
        });

        playBattleAnim('enemy');

        enemyHP = Math.min(200, enemyHP + hasar);
        playerHP = Math.max(0, playerHP - hasar);
        updateUI();

        el.display.textContent = `"${enIyiKelime}" (-${hasar})`;

    } else {
        // Kelime bulamadı → PASS
        el.display.textContent = "Rakip kelime bulamadı!";

        // Küçük görsel efekt
        el.eImg.style.transition = "transform 0.4s";
        el.eImg.style.transform = "scale(0.9)";
        setTimeout(() => el.eImg.style.transform = "scale(1)", 500);
    }

    // Oyuncu öldü mü kontrol et
    if (playerHP <= 0) {
        setTimeout(() => gameOver(false), 1400);
        return;
    }

    // Sıra oyuncuya geçsin
    setTimeout(() => {
        el.display.textContent = "SIRA SENDE!";
    }, enIyiKelime ? 1900 : 1300);
}

function stageGecis() {
    if (currentStage < 5) {
        currentStage++;
        const s = stages[currentStage - 1];
        
        playerHP = 100;
        enemyHP = 100;
        
        el.eImg.src = s.img;
        el.eLabel.textContent = s.name;
        
        updateUI();
        tabloOlustur();
        showTempMessage(`${s.name} sahneye çıktı!`, "#f4c53f", 1600);
    } else {
        gameOver(true);
    }
}

function gameOver(win) {

    // ⭐ GERÇEK TOPLAM PUAN
    const finalScore = patiPuan;

    // oyuncu adı kontrol
    let playerName = localStorage.getItem("playerName");

    if (!playerName) {
        playerName = prompt("İsmini yaz:");
        if (!playerName || playerName.trim() === "")
            playerName = "OYUNCU";

        localStorage.setItem("playerName", playerName);
    }

    // ⭐ SKOR EKRANINA GÖNDER
    localStorage.setItem("sonSkor", finalScore);
    localStorage.setItem("sonOyuncu", playerName);

    // ⭐ GAME OVER POPUP TAMAMEN İPTAL
    // el.gameOver.classList.add('show');   ❌
    // end-title / end-subtitle ❌

    // direkt skor ekranı
    window.location.href = "skor.html";
}

// function gameOver(win) {
//     document.getElementById('end-title').textContent = win ? "KAZANDIN!" : "YENİLDİN!";
//     document.getElementById('end-subtitle').innerHTML = win 
//         ? `Tüm kara serisini domine ettin!<br>Kalan Gücün: <strong>%${Math.floor(playerHP/2)}</strong>` 
//         : "Güç dengesini kaybettin, tekrar dene!";
//     el.gameOver.classList.add('show');
// }

document.getElementById('btn-submit').onclick = saldir;
document.getElementById('btn-scramble').onclick = () => {
    if (patiPuan >= 50) {
        patiPuan -= 50; tabloOlustur(); updateUI();
        showTempMessage("Harfler karıştırıldı!", "#f4c53f");
    } else { showTempMessage("YETERSİZ PUAN!", "#ef4444"); }
};
document.getElementById('restart-btn').onclick = () => location.reload();

tabloOlustur();
updateUI();
el.display.textContent = "SAVAŞ BAŞLADI!";

// tabloOlustur() fonksiyonunun en altına, el.grid.appendChild(tile); döngüsünden sonra ekle
rakipAIHazirla();   // ← Bu satırı ekle
