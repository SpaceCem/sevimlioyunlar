const avatarButtons = document.querySelectorAll(".avatar-btn");
const startBtn = document.getElementById("startBtn");
const nameInput = document.getElementById("playerName");
const nameBox = document.getElementById("name-box");

let profile = { class: null, age: null, avatar: null, playerImage: null };

avatarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const row = btn.dataset.row;
        
        // Satır içi seçim temizliği
        document.querySelectorAll(`.avatar-btn[data-row="${row}"]`).forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");

        // Veri atama ve Resim belirleme
        if (row === "1") {
            profile.class = btn.dataset.val;
            // Kahramana göre resim yolu
            if (profile.class === "Büyücü") profile.playerImage = "images/oyuncu001.png";
            else if (profile.class === "Barbar") profile.playerImage = "images/oyuncu002.png";
            else if (profile.class === "Okçu") profile.playerImage = "images/oyuncu003.png";
            else if (profile.class === "Ozan") profile.playerImage = "images/oyuncu004.png";
            
            profile.avatar = btn.dataset.emoji;
        } else if (row === "2") {
            profile.age = btn.dataset.val;
        } else {
            profile.avatar = btn.dataset.emoji;
        }

        // Hata gölgesini kaldır
        const parent = btn.closest(".row-wrapper");
        if(parent) parent.classList.remove("error-glow");
    });
});

nameInput.addEventListener("input", () => nameBox.classList.remove("error-glow"));

startBtn.addEventListener("click", () => {
    let isValid = true;

    if (nameInput.value.trim().length < 2) {
        nameBox.classList.add("error-glow");
        isValid = false;
    }
    if (!profile.class) {
        document.querySelector('[data-error-row="1"]').classList.add("error-glow");
        isValid = false;
    }
    if (!profile.age) {
        document.querySelector('[data-error-row="2"]').classList.add("error-glow");
        isValid = false;
    }
    if (!profile.avatar) {
        document.querySelector('[data-error-row="34"]').classList.add("error-glow");
        isValid = false;
    }

    if (!isValid) {
        setTimeout(() => {
            nameBox.classList.remove("error-glow");
            document.querySelectorAll(".row-wrapper").forEach(r => r.classList.remove("error-glow"));
        }, 1500);
        return;
    }

    // Verileri Kaydet
    localStorage.setItem("playerName", nameInput.value.trim());
    localStorage.setItem("playerClass", profile.class);
    localStorage.setItem("playerAge", profile.age);
    localStorage.setItem("playerAvatar", profile.avatar);
    localStorage.setItem("playerImagePath", profile.playerImage); // Resim yolu burada kaydediliyor
    
    window.location.href = "kelimelik.html";
});