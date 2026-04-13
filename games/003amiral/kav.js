const pGrid = document.getElementById('player-grid');
const rGrid = document.getElementById('radar-grid');
const lastAction = document.getElementById('last-action');
const ammoEl = document.getElementById('ammo-count');
const ammoVisuals = document.getElementById('ammo-visuals');
const pHealthFill = document.getElementById('player-health-fill');
const eHealthFill = document.getElementById('enemy-health-fill');

let gameState = 'SETUP', selectedSize = 0, currentPlacement = [], playerShips = new Set(), enemyShips = new Set(), enemyFiredCoords = new Set();
let inventory = { 5: 1, 4: 2, 3: 2, 2: 2, 1: 2 }; 
let playerHP = 25, enemyHP = 25, ammo = 5;

const gridMap = [
    [0,0,0,1,1,1,1,0,0,0], [0,1,1,1,1,1,1,1,1,0], [0,1,1,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1,1,1], [1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1], [0,1,1,1,1,1,1,1,1,0], [0,1,1,1,1,1,1,1,1,0],
    [0,0,0,1,1,1,1,0,0,0]
];

function init() {
    pGrid.innerHTML = ''; rGrid.innerHTML = '';
    for (let r = 0; r < 10; r++) {
        for (let c = 0; c < 10; c++) {
            const isVisible = gridMap[r][c] === 1;
            pGrid.appendChild(createCell(r, c, isVisible, 'player'));
            rGrid.appendChild(createCell(r, c, isVisible, 'radar'));
        }
    }
    setupEnemy(); updateAmmoVisuals();
}

function createCell(r, c, isVisible, type) {
    const cell = document.createElement('div');
    cell.className = 'cell' + (isVisible ? '' : ' hidden-cell');
    cell.dataset.coord = `${r},${c}`;
    if (isVisible) {
        if (type === 'player') {
            cell.onclick = () => handlePlacement(r, c, cell);
            cell.oncontextmenu = (e) => { e.preventDefault(); handleRemove(); };
        } else {
            cell.onclick = () => handleAttack(r, c, cell);
        }
    }
    return cell;
}

function updateHealthBar(fillEl, hp) {
    const percent = Math.max(0, (hp / 25) * 100);
    fillEl.style.width = percent + "%";
    fillEl.classList.remove('green', 'orange', 'red');
    if (percent > 40) fillEl.classList.add('green');
    else if (percent > 15) fillEl.classList.add('orange');
    else fillEl.classList.add('red');
}

function updateAmmoVisuals() {
    ammoVisuals.innerHTML = ''; 
    ammoEl.innerText = ammo;
    for (let i = 0; i < 5; i++) {
        const img = document.createElement('img');
        img.src = i < ammo ? 'images/trpl.png' : 'images/trpl2.png';
        img.className = 'ammo-unit';
        ammoVisuals.appendChild(img);
    }
}

function handleAttack(r, c, cell) {
    if (gameState !== 'BATTLE' || ammo <= 0 || cell.dataset.fired) return;
    cell.dataset.fired = "true"; 
    ammo--; 
    updateAmmoVisuals();
    
    if (enemyShips.has(`${r},${c}`)) {
        cell.classList.add('hit-cell'); 
        enemyHP--; 
        updateHealthBar(eHealthFill, enemyHP);
        lastAction.innerText = "İSABET!";
    } else { 
        cell.classList.add('miss-cell'); 
        lastAction.innerText = "KARAVANA"; 
    }

    if (enemyHP <= 0) endGame("ZAFER: DÜŞMAN İMHA EDİLDİ!"); 
    else if (ammo === 0) setTimeout(enemyTurn, 800);
}

function enemyTurn() {
    let count = 0;
    const interval = setInterval(() => {
        let r, c;
        do { 
            r = Math.floor(Math.random()*10); 
            c = Math.floor(Math.random()*10); 
        } while (gridMap[r][c] === 0 || enemyFiredCoords.has(`${r},${c}`));
        
        enemyFiredCoords.add(`${r},${c}`);
        const pCell = pGrid.querySelector(`[data-coord="${r},${c}"]`);
        
        if (playerShips.has(`${r},${c}`)) { 
            pCell.classList.add('hit-cell'); 
            playerHP--; 
            updateHealthBar(pHealthFill, playerHP); 
        } else { 
            pCell.classList.add('miss-cell'); 
        }
        
        count++;
        if (playerHP <= 0) { clearInterval(interval); endGame("MAĞLUBİYET!"); }
        else if (count >= 5) { 
            clearInterval(interval); ammo = 5; 
            updateAmmoVisuals(); lastAction.innerText = "SIRA SİZDE"; 
        }
    }, 700);
}

function triggerBattleStart() {
    document.getElementById('battle-overlay').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('battle-overlay').classList.add('hidden');
        gameState = 'BATTLE';
        document.getElementById('inventory-panel').classList.add('hidden');
        document.getElementById('start-battle-btn').classList.add('hidden');
    }, 2000);
}

function endGame(msg) {
    document.getElementById('final-result-text').innerText = msg;
    document.getElementById('game-over-overlay').classList.remove('hidden');
}

function randomPlacePlayerShips() {
    playerShips.clear(); 
    pGrid.querySelectorAll('.cell').forEach(c => c.classList.remove('placed'));
    inventory = { 5: 1, 4: 2, 3: 2, 2: 2, 1: 2 };
    const sizes = [5, 4, 4, 3, 3, 2, 2, 1, 1];
    
    sizes.forEach(size => {
        let placed = false;
        while(!placed) {
            let r = Math.floor(Math.random()*10), c = Math.floor(Math.random()*10), v = Math.random()>0.5;
            if (canPlaceShip(r, c, size, v, playerShips)) {
                for(let i=0; i<size; i++){
                    let currR = v ? r+i : r, currC = v ? c : c+i;
                    playerShips.add(`${currR},${currC}`);
                    pGrid.querySelector(`[data-coord="${currR},${currC}"]`).classList.add('placed');
                }
                inventory[size]--; placed = true;
            }
        }
    });
    
    Object.keys(inventory).forEach(k => {
        const el = document.getElementById(`count-${k}`);
        if(el) el.innerText = 0;
    });
    checkReady();
}

function canPlaceShip(r, c, s, v, set) {
    for (let i = 0; i < s; i++) {
        let nr = v ? r+i : r, nc = v ? c : c+i;
        if (nr > 9 || nc > 9 || gridMap[nr][nc] === 0 || set.has(`${nr},${nc}`)) return false;
    }
    return true;
}

function selectShip(size) { if (gameState === 'SETUP' && inventory[size] > 0) { handleRemove(); selectedSize = size; } }

function handlePlacement(r, c, cell) {
    if (selectedSize === 0 || gameState !== 'SETUP' || playerShips.has(`${r},${c}`)) return;

    if (currentPlacement.length > 0) {
        const last = currentPlacement[currentPlacement.length - 1];
        const rowDiff = Math.abs(r - last.r);
        const colDiff = Math.abs(c - last.c);

        if (rowDiff > 1 || colDiff > 1 || (rowDiff === 1 && colDiff === 1)) {
            lastAction.innerText = "ÇAPRAZ DİZİLİM YASAK!";
            return;
        }
    }

    currentPlacement.push({ r, c, el: cell }); 
    cell.classList.add('placed');
    lastAction.innerText = "KONUMLANDIRILIYOR...";

    if (currentPlacement.length === selectedSize) {
        currentPlacement.forEach(p => playerShips.add(`${p.r},${p.c}`));
        inventory[selectedSize]--; 
        document.getElementById(`count-${selectedSize}`).innerText = inventory[selectedSize];
        selectedSize = 0; currentPlacement = []; checkReady();
        lastAction.innerText = "GEMİ YERLEŞTİRİLDİ";
    }
}

function handleRemove() { currentPlacement.forEach(p => p.el.classList.remove('placed')); currentPlacement = []; }

function setupEnemy() { 
    const sizes = [5, 4, 4, 3, 3, 2, 2, 1, 1];
    sizes.forEach(s => {
        let ok = false;
        while(!ok) {
            let r = Math.floor(Math.random()*10), c = Math.floor(Math.random()*10), v = Math.random()>0.5;
            if (canPlaceShip(r, c, s, v, enemyShips)) {
                for(let i=0; i<s; i++) enemyShips.add(v ? `${r+i},${c}` : `${r},${c+i}`);
                ok = true;
            }
        }
    });
}

function checkReady() { if (Object.values(inventory).reduce((a, b) => a + b, 0) === 0) document.getElementById('start-battle-btn').classList.remove('hidden'); }

init();