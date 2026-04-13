document.addEventListener('DOMContentLoaded', () => {
    const mainMenu = document.getElementById('main-menu');
    const guestPanel = document.getElementById('guest-panel');
    const guestInput = document.getElementById('guest-name-input');
    
    const btnGuest = document.getElementById('btn-guest');
    const btnConfirm = document.getElementById('btn-confirm-guest');
    const btnCancel = document.getElementById('btn-cancel-guest');

    // Misafir Paneline Geçiş
    btnGuest.addEventListener('click', () => {
        mainMenu.style.display = 'none';
        guestPanel.style.display = 'flex';
        guestInput.value = "";
        guestInput.focus();
    });

    // Ana Menüye Dönüş
    btnCancel.addEventListener('click', () => {
        guestPanel.style.display = 'none';
        mainMenu.style.display = 'flex';
    });

    // Arenaya Giriş
    btnConfirm.addEventListener('click', () => {
        const name = guestInput.value.trim();
        if (name.length >= 2) {
            localStorage.setItem('playerName', name);
            localStorage.setItem('opponentName', 'BadHand');
            window.location.href = 'TKM.html';
        } else {
            guestInput.style.borderColor = "red";
            setTimeout(() => guestInput.style.borderColor = "#CD7F32", 500);
        }
    });

    // Diğer butonlar için uyarı
    document.getElementById('btn-login').addEventListener('click', () => alert("SAVAŞÇI KAYDI KAPALI!"));
    document.getElementById('btn-register').addEventListener('click', () => window.location.href = 'signin.html');
});