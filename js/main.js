document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById('mainGrid');
    if (!grid) return;

    const gameData = [
        { 
            title: "Kelimelik", 
            folder: "games/001kelimelik", 
            thumb: "assests/common/kelimelik.png" 
        },
        { 
            title: "Yakan Top", 
            folder: "games/002yakantop", 
            thumb: "assests/common/yakantop.png" 
        },
        { 
            title: "Amiral Battı", 
            folder: "games/003amiral", 
            thumb: "assests/common/amiral.png" 
        },
        { 
            title: "TKM Oyunu", 
            folder: "games/004tkm", 
            thumb: "assests/common/tkm.png" 
        },
        { 
            title: "İş Oyunu", 
            folder: "games/005ish", 
            thumb: "assests/common/ish.png" 
        },
        { 
            title: "Life Caster", 
            folder: "games/006lifecaster", 
            thumb: "assests/common/lifecaster.png" 
        }
    ];

    function createGrid() {
        grid.innerHTML = "";

        for (let i = 0; i < 7; i++) {
            const item = document.createElement('a');
            item.className = 'game-item';

            if (gameData[i]) {
                const game = gameData[i];
                
                item.href = `${game.folder}/index.html`;
                item.innerHTML = `
                    <img src="${game.thumb}" 
                         alt="${game.title}" 
                         onerror="this.src='assests/common/placeholder.png'; this.style.objectFit='contain';">
                    <span class="game-label">${game.title}</span>
                `;
            } 
            else {
                // Yakında olanlar
                item.classList.add('coming-soon');
                item.innerHTML = `
                    <div class="coming-text">Yakında</div>
                `;
                item.removeAttribute('href');
            }
            
            grid.appendChild(item);
        }
    }

    createGrid();
});