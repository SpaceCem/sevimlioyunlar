const liste = document.getElementById("skor-listesi");
const geriBtn = document.getElementById("geri-btn");

// ===== NPC BAŞLANGIÇ =====
const varsayilan = [
    { isim: "KARA USTA", skor: 900 },
    { isim: "GÖLGELER EFENDİSİ", skor: 750 },
    { isim: "GECE AVCISI", skor: 600 },
    { isim: "KARA ŞOVALYE", skor: 500 },
    { isim: "SESSİZ PENÇE", skor: 420 },
    { isim: "AY SAVAŞÇISI", skor: 350 },
    { isim: "GİZEMLİ YOLCU", skor: 280 },
    { isim: "GENÇ AVCI", skor: 220 },
    { isim: "ÇIRAK", skor: 150 },
    { isim: "YENİ GELEN", skor: 80 }
];

if (!localStorage.getItem("skorlar")) {
    localStorage.setItem("skorlar", JSON.stringify(varsayilan));
}

let skorlar = JSON.parse(localStorage.getItem("skorlar")) || [];

// Oyuncunun ismi (oyun sırasında localStorage'a kaydedilmiş olmalı)
const playerName = localStorage.getItem("playerName") || "OYUNCU";

liste.innerHTML = "";

function tabloyuGuncelle() {
    liste.innerHTML = "";
    skorlar.forEach((item, index) => {
        const li = document.createElement("li");
        li.className = "skor-item";

        let medalClass = "";
        if (index === 0) medalClass = "gold";
        else if (index === 1) medalClass = "silver";
        else if (index === 2) medalClass = "bronze";

        // Oyuncunun kendi skoru highlight
        if (item.isim === playerName) {
            li.classList.add("new-score");
        }

        li.innerHTML = `
            <span class="rank ${medalClass}">#${index + 1}</span>
            <span class="name">${item.isim}</span>
            <span class="score">${item.skor}</span>
        `;

        liste.appendChild(li);
    });
}

// ===================== SKOR KAYDETME FONKSİYONU =====================
function skorKaydet(yeniSkor) {
    if (!playerName) {
        console.warn("Player name bulunamadı!");
        return;
    }

    // Aynı isimde var mı kontrol et
    const mevcutIndex = skorlar.findIndex(item => item.isim === playerName);

    if (mevcutIndex !== -1) {
        // Varsa daha yüksekse güncelle
        if (yeniSkor > skorlar[mevcutIndex].skor) {
            skorlar[mevcutIndex].skor = yeniSkor;
        }
    } else {
        // Yoksa yeni ekle
        skorlar.push({ isim: playerName, skor: yeniSkor });
    }

    // Skorları yüksekten düşüğe sırala
    skorlar.sort((a, b) => b.skor - a.skor);

    // İlk 10'u tut (isteğe bağlı)
    skorlar = skorlar.slice(0, 10);

    // LocalStorage'a kaydet
    localStorage.setItem("skorlar", JSON.stringify(skorlar));

    console.log("Skor kaydedildi:", yeniSkor); // Test için
}

// Slot animasyonu (mevcut)
function slotAnimasyonu(finalSkor) {
    const slot = document.getElementById("slotSkor");
    let sayac = 0;
    let hiz = 30;

    const interval = setInterval(() => {
        sayac += Math.floor(Math.random() * 500) + 100;
        slot.textContent = sayac.toString().padStart(6, "0");

        if (sayac >= finalSkor) {
            clearInterval(interval);
            slot.textContent = finalSkor.toString().padStart(6, "0");
            skorKaydet(finalSkor);   // ← Burası önemli
            tabloyuGuncelle();
        }
    }, hiz);
}

window.onload = function() {
    const sonSkor = parseInt(localStorage.getItem("sonSkor")) || 0;
    slotAnimasyonu(sonSkor);
};

// Geri butonu
geriBtn.onclick = () => {
    window.location.href = "index.html";
};