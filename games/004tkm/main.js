/**
 * Pixel Duel: Dark Arena - Main Menu Controller
 * Bu dosya ana menü geçişlerini ve kullanıcı verisini localStorage'a kaydeder.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elemanlarını Seçme
    const mainMenu = document.getElementById('main-menu');
    const guestPanel = document.getElementById('guest-panel');
    const guestInput = document.getElementById('guest-name-input');
    
    const btnGuest = document.getElementById('btn-guest');
    const btnConfirm = document.getElementById('btn-confirm-guest');
    const btnCancel = document.getElementById('btn-cancel-guest');
    const btnLogin = document.getElementById('btn-login');
    const btnRegister = document.getElementById('btn-register');

    // 1. MİSAFİR PANELİNE GEÇİŞ
    if (btnGuest && mainMenu && guestPanel) {
        btnGuest.addEventListener('click', () => {
            mainMenu.style.display = 'none';
            guestPanel.style.display = 'flex';
            guestInput.value = ""; // Girişi temizle
            guestInput.focus();     // Otomatik odaklan
            console.log("Misafir paneli açıldı.");
        });
    }

    // 2. ANA MENÜYE GERİ DÖNÜŞ
    if (btnCancel && guestPanel && mainMenu) {
        btnCancel.addEventListener('click', () => {
            guestPanel.style.display = 'none';
            mainMenu.style.display = 'flex';
            guestInput.style.borderColor = "#CD7F32"; // Hata rengini sıfırla
        });
    }

    // 3. ARENAYA GİRİŞ (YÖNLENDİRME)
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const name = guestInput.value.trim();

            // İsim kontrolü: En az 2 karakter
            if (name.length >= 2) {
                // Verileri kaydet
                localStorage.setItem('playerName', name);
                localStorage.setItem('opponentName', 'BadHand');

                console.log(`Savaşçı ${name} arenaya hazırlanıyor...`);

                // Yönlendirme (Dosya adının TKM.html olduğundan emin ol)
                window.location.assign('TKM.html'); 
            } else {
                // Görsel hata geri bildirimi
                guestInput.style.borderColor = "red";
                guestInput.placeholder = "İSİM GİRİNİZ!";
                
                setTimeout(() => {
                    guestInput.style.borderColor = "#CD7F32";
                    guestInput.placeholder = "...";
                }, 1000);
            }
        });

        // Enter tuşu ile giriş desteği
        guestInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') btnConfirm.click();
        });
    }

    // 4. DİĞER BUTONLAR (UYARI)
    if (btnLogin) {
        btnLogin.addEventListener('click', () => alert("SAVAŞÇI KAYDI ŞU AN KAPALI!"));
    }

    if (btnRegister) {
        btnRegister.addEventListener('click', () => {
             console.log("Kayıt sayfasına yönlendiriliyor...");
             // window.location.href = 'signin.html'; // Eğer varsa aktif et
        });
    }
});
