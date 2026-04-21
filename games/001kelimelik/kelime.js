import SOZLUK from './kelimelik.js';

window.addEventListener('load', () => {
    const kaydedilenAd = localStorage.getItem("playerName");
    const playerLabel = document.querySelector(".player-label");
    if (kaydedilenAd && playerLabel) {
        playerLabel.textContent = kaydedilenAd.toUpperCase();
    }

    const secilenResimYolu = localStorage.getItem("playerImagePath");
    const playerImgElement = document.getElementById("player-character");
    if (secilenResimYolu && playerImgElement) {
        playerImgElement.src = secilenResimYolu;
    }
});

let rakipAdaylar = [];
const kelimeSeti = new Set(SOZLUK.map(k => k.toUpperCase('tr-TR')));

const harfPuanlari = {
    'A':1,'E':1,'İ':1,'I':2,'O':2,'U':2,'Ö':4,'Ü':3,
    'K':1,'L':1,'R':1,'N':1,'T':1,'M':2,'S':2,'B':3,'D':3,
    'Y':3,'C':3,'Ç':4,'H':4,'P':4,'Ş':4,'G':4,'V':5,'Z':5,
    'Ğ':7,'J':10,'F':10
};

const harfHavuzu = "AAAAAAAAAEEEEEEEEEIIIIIIIIIIOOOOOOUUUUUULLLLRRRRNNNNSSSSSTTTTTTTİİİİİİİİİBBCCÇDDFFGGĞHHJKMMPPSŞVYYZZÖÖÜÜÜ";
const sesliHarfler = new Set(['A','E','İ','I','O','U','Ö','Ü']);
const sessizHarfler = new Set(['B','C','Ç','D','F','G','Ğ','H','J','K','L','M','N','P','R','S','Ş','T','V','Y','Z']);

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
    eLabel: document.getElementById('enemy-label')
};

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
    el.display.textContent = msg;
    el.display.style.color = color;
    setTimeout(() => {
        el.display.textContent = originalText;
        el.display.style.color = "#3a2f1f";
    }, duration);
}

function tabloOlustur() {
    el.grid.innerHTML = "";
    secilenHücreler = [];

    for (let i = 0; i < 16; i++) {
        const h = harfHavuzu[Math.floor(Math.random() * harfHavuzu.length)];
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = `<span class="letter-text">${h}</span><span class="tile-point">${harfPuanlari[h] || 1}</span>`;
        tile.dataset.multiplier = "1";

        tile.addEventListener('click', () => harfSec(tile));
        tile.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            harfDegistir(tile);
        });

        el.grid.appendChild(tile);
    }
    // İlk kurulumda tüm bonusları dağıt
    if (window.gorevleriYenile) window.gorevleriYenile(true);
}

function kullanilanHarfleriYenile(hucreListesi) {
    hucreListesi.forEach(tile => {
        const h = harfHavuzu[Math.floor(Math.random() * harfHavuzu.length)];
        // Sadece kullanılan tile'ı temizle
        tile.classList.remove('selected', 'gorev-tile', 'multiplier-2', 'multiplier-3', 'multiplier-5');
        tile.dataset.multiplier = "1";
        
        const letterSpan = tile.querySelector('.letter-text');
        if(letterSpan) {
            letterSpan.style.color = "";
            letterSpan.textContent = h;
        }

        const puanElementi = tile.querySelector('.tile-point');
        if (puanElementi) {
            puanElementi.textContent = harfPuanlari[h] || 1;
        }

        tile.classList.add('new-letter');
        setTimeout(() => tile.classList.remove('new-letter'), 400);
    });
    // Sadece eksik bonusları tamamla, masadakilere dokunma
    if (window.gorevleriYenile) window.gorevleriYenile(false);
}

function harfSec(tile) {
    if (tile.classList.toggle('selected')) {
        secilenHücreler.push(tile);
    } else {
        secilenHücreler = secilenHücreler.filter(t => t !== tile);
    }
    updateWordDisplay();
}

function updateWordDisplay() {
    const kelime = secilenHücreler.map(t => t.querySelector('.letter-text').textContent).join('');
    el.display.textContent = kelime || "KELİME OLUŞTUR";
}

function harfDegistir(tile) {
    const eskiHarf = tile.querySelector('.letter-text').textContent;
    const bedel = harfPuanlari[eskiHarf] || 1;

    if (patiPuan < bedel) {
        showTempMessage("PUAN YETERSİZ!", "#ef4444");
        return;
    }

    patiPuan -= bedel;
    let yeniH = sesliHarfler.has(eskiHarf) 
        ? [...sesliHarfler][Math.floor(Math.random() * sesliHarfler.size)]
        : [...sessizHarfler][Math.floor(Math.random() * sessizHarfler.size)];

    tile.innerHTML = `<span class="letter-text">${yeniH}</span><span class="tile-point">${harfPuanlari[yeniH] || 1}</span>`;
    // Bonuslu bir harf manuel değişirse bonusu korumak riskli olabilir, o yüzden bonusu sıfırlıyoruz
    tile.classList.remove('gorev-tile', 'multiplier-2', 'multiplier-3', 'multiplier-5');
    tile.dataset.multiplier = "1";
    
    updateUI();
    if (window.gorevleriYenile) window.gorevleriYenile(false);
}

async function saldir() {
    const kelime = secilenHücreler.map(t => t.querySelector('.letter-text').textContent).join('').toUpperCase('tr-TR');

    if (kelime.length < 3 || !kelimeSeti.has(kelime)) {
        el.display.classList.add('shake');
        setTimeout(() => el.display.classList.remove('shake'), 500);
        showTempMessage("GEÇERSİZ KELİME!", "#ef4444");
        return;
    }

    let hasar = 0;
    secilenHücreler.forEach(t => {
        const anaPuan = harfPuanlari[t.querySelector('.letter-text').textContent] || 1;
        const carpan = parseInt(t.dataset.multiplier || 1);
        hasar += (anaPuan * carpan);
    });

    playBattleAnim('player');
    playerHP = Math.min(200, playerHP + hasar); 
    enemyHP = Math.max(0, enemyHP - hasar);     
    patiPuan += Math.floor(hasar * 1.15);       
    
    updateUI();
    el.display.textContent = `+${hasar} GÜÇ!`;

    const hamleHücreleri = [...secilenHücreler];
    secilenHücreler = []; 

    setTimeout(() => {
        if (enemyHP <= 0) stageGecis();
        else {
            kullanilanHarfleriYenile(hamleHücreleri);
            updateWordDisplay();
            setTimeout(rakipAI, 600);
        }
    }, 1200);
}

function rakipAIHazirla() {
    rakipAdaylar = SOZLUK.filter(k => k.length >= 4 && k.length <= 7);
}

async function rakipAI() {
    el.display.textContent = "Düşman düşünüyor...";
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const harfSayaci = {};
    tiles.forEach(t => {
        const h = t.querySelector('.letter-text').textContent;
        harfSayaci[h] = (harfSayaci[h] || 0) + 1;
    });

    let enIyiKelime = "";
    let secilecekTiles = [];
    let toplamPotansiyelHasar = 0;

    const karistirilmis = [...rakipAdaylar].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(800, karistirilmis.length); i++) {
        const kelime = karistirilmis[i].toUpperCase('tr-TR');
        const kopya = { ...harfSayaci };
        let guncelHasar = 0;
        let kullanilabilir = true;
        let guncelTiles = [];

        for (const h of kelime) {
            if (kopya[h] > 0) {
                kopya[h]--;
                const t = tiles.find(tile => tile.querySelector('.letter-text').textContent === h && !guncelTiles.includes(tile));
                if(t) {
                    guncelTiles.push(t);
                    // BURASI KRİTİK: Rakip de kutudaki çarpanı (2, 3, 5) kullanıyor
                    guncelHasar += (harfPuanlari[h] || 1) * parseInt(t.dataset.multiplier || 1);
                }
            } else {
                kullanilabilir = false;
                break;
            }
        }

        if (kullanilabilir && guncelHasar > toplamPotansiyelHasar) {
            toplamPotansiyelHasar = guncelHasar;
            enIyiKelime = kelime;
            secilecekTiles = guncelTiles;
            if (toplamPotansiyelHasar >= 40) break; 
        }
    }

    if (enIyiKelime) {
        // RAKİP HARF SEÇİM ANİMASYONU
        for (let i = 0; i < secilecekTiles.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 500)); // 0.5 saniye arayla seçer
            const tile = secilecekTiles[i];
            tile.classList.add('enemy-selecting'); // Kırmızı yanma efekti
            el.display.textContent = enIyiKelime.substring(0, i + 1);
        }

        await new Promise(resolve => setTimeout(resolve, 600));

        // Hasar Hesaplama (Kutulardaki çarpanlar dahil)
        const sonHasar = Math.max(10, toplamPotansiyelHasar); 
        
        playBattleAnim('enemy');
        enemyHP = Math.min(200, enemyHP + Math.floor(sonHasar * 0.5)); // Rakip az miktar can tazeler
        playerHP = Math.max(0, playerHP - sonHasar);
        
        updateUI();
        el.display.textContent = `${enIyiKelime} (-${sonHasar} HP!)`;

        setTimeout(() => {
            secilecekTiles.forEach(t => t.classList.remove('enemy-selecting'));
            kullanilanHarfleriYenile(secilecekTiles);
            
            if (playerHP <= 0) gameOver(false);
            else el.display.textContent = "SIRA SENDE!";
        }, 1200);
    } else {
        el.display.textContent = "Rakip Pas Geçti!";
        setTimeout(() => { el.display.textContent = "SIRA SENDE!"; }, 1000);
    }
}

function stageGecis() {
    if (currentStage < 5) {
        currentStage++;
        const s = stages[currentStage - 1];
        playerHP = 100; enemyHP = 100;
        el.eImg.src = s.img;
        el.eLabel.textContent = s.name;
        updateUI();
        tabloOlustur(); // Yeni stage'de tablo tamamen yenilenebilir
        showTempMessage(`${s.name} Yaklaşıyor!`, "#f4c53f", 1500);
    } else gameOver(true);
}

function gameOver(win) {
    localStorage.setItem("sonSkor", patiPuan);
    localStorage.setItem("sonOyuncu", localStorage.getItem("playerName") || "OYUNCU");
    window.location.href = "skor.html";
}

document.getElementById('btn-submit').onclick = saldir;
document.getElementById('btn-scramble').onclick = () => {
    if (patiPuan >= 50) {
        patiPuan -= 50; 
        tabloOlustur(); 
        updateUI();
    } else showTempMessage("YETERSİZ PUAN!", "#ef4444");
};

rakipAIHazirla();
tabloOlustur();
updateUI();
el.display.textContent = "SAVAŞ BAŞLADI!";
