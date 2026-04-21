function gorevleriYenile(hepsiniSifirla = true) {
    const tiles = document.querySelectorAll('.tile');
    if (tiles.length === 0) return;

    const harfPuanlari = {
        'A':1,'E':1,'İ':1,'I':2,'O':2,'U':2,'Ö':4,'Ü':3,
        'K':1,'L':1,'R':1,'N':1,'T':1,'M':2,'S':2,'B':3,'D':3,
        'Y':3,'C':3,'Ç':4,'H':4,'P':4,'Ş':4,'G':4,'V':5,'Z':5,
        'Ğ':7,'J':10,'F':10
    };

    // 1. Eğer tam sıfırlama gerekiyorsa (Stage geçişi veya Karıştır butonu)
    if (hepsiniSifirla) {
        tiles.forEach(t => {
            t.classList.remove('gorev-tile', 'multiplier-2', 'multiplier-3', 'multiplier-5');
            t.dataset.multiplier = "1";
            const letterSpan = t.querySelector('.letter-text');
            if (letterSpan) letterSpan.style.color = ""; 

            const puanElementi = t.querySelector('.tile-point');
            if (puanElementi && letterSpan) {
                puanElementi.textContent = harfPuanlari[letterSpan.textContent.toUpperCase()] || 1;
            }
        });
    }

    // 2. Eksik Bonusları Dağıt
    const carpanlar = ["2", "3", "5"];
    
    // Şu an masada hangi çarpanlar var?
    const masadakiCarpanlar = Array.from(document.querySelectorAll('.tile.gorev-tile'))
                                   .map(t => t.dataset.multiplier);
    
    // Hangi çarpanlar eksik?
    const eksikCarpanlar = carpanlar.filter(c => !masadakiCarpanlar.includes(c));

    eksikCarpanlar.forEach(carpan => {
        let deneme = 0;
        let basarili = false;
        
        while (deneme < 50 && !basarili) {
            let index = Math.floor(Math.random() * tiles.length);
            let target = tiles[index];

            // Sadece boş (bonussuz) ve seçili olmayan bir tile seç
            if (target && !target.classList.contains('gorev-tile') && !target.classList.contains('selected')) {
                const letterSpan = target.querySelector('.letter-text');
                if (letterSpan) {
                    const harf = letterSpan.textContent.toUpperCase();
                    const bazPuan = harfPuanlari[harf] || 1;

                    target.classList.add('gorev-tile', `multiplier-${carpan}`);
                    target.dataset.multiplier = carpan;

                    const puanElementi = target.querySelector('.tile-point');
                    if (puanElementi) {
                        puanElementi.textContent = bazPuan * parseInt(carpan);
                    }
                    basarili = true;
                }
            }
            deneme++;
        }
    });
}

window.gorevleriYenile = gorevleriYenile;