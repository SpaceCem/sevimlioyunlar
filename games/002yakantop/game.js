// HTML elemanlarına erişim
const profileScreen = document.getElementById('profile-screen');
const gameScreen = document.getElementById('game-screen');
const createProfileBtn = document.getElementById('createProfileBtn');
const playerNameInput = document.getElementById('playerName');
const playerImageInput = document.getElementById('playerImage');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusDisplay = document.getElementById('status-display');

// Avatar seçimi
const avatars = document.querySelectorAll('.avatar');
avatars.forEach(avatar => {
 avatar.addEventListener('click', () => {
 avatars.forEach(a => a.classList.remove('selected'));
 avatar.classList.add('selected');
 playerImageInput.value = '';
 });});

// Oyun sabitleri
const PLAYER_RADIUS = 25;
const PLAYER_SPEED = 3;
const ENEMY_NORMAL_SPEED = 2;
const ENEMY_FAST_SPEED = ENEMY_NORMAL_SPEED * 1.2;
const ENEMY_BIG_SPEED = ENEMY_NORMAL_SPEED * 0.7;
const ENEMY_BIG_RADIUS = PLAYER_RADIUS * 1.5;
const POINTS_PER_LEVEL = 50;
const BONUS_EFFECT_DURATION = 3000;
const HIT_INVINCIBILITY_DURATION = 1000;
const TRAIL_LIFETIME = 2000;
const ENEMY_START_MARGIN = 50;

// Oyun değişkenleri
let isGameRunning = false;
let player = { name: '', image: new Image(), isMoving: false, x: canvas.width / 2, y: canvas.height / 2, radius: PLAYER_RADIUS, speed: PLAYER_SPEED };
let playerLives = 3;
const MAX_LIVES = 5;
let invincible = false;
let canTakeDamage = true;
let isMouseDown = false;
let isMovingToTarget = false;
let targetX = player.x;
let targetY = player.y;
let score = 0;
let totalScore = 0;
let level = 1;
let enemies = [];
let points = [];
let bonusTops = [];
let trail = [];
let trailColor = 'rgba(0,255,0,0.7)';
let startTime = 0;
let elapsedTime = 0;
let finalScore = 0;
let finalTime = 0;
let animationFrameId = null;
let levelEnemies = { normal: 0, fast: 0, big: 0 };
let lastGameId = null;

// Durum paneli çizimi
function drawStatus() {
const hearts = '❤️'.repeat(playerLives);
statusDisplay.innerHTML = `
<span>Puan: ${score} / ${POINTS_PER_LEVEL}</span>
<span>Bölüm: ${level}</span>
<span>Süre: ${elapsedTime} sn</span>
<span>Can: ${hearts}</span>
 `;}

// Oyun sonu butonları
function drawEndGameButtons() {
ctx.fillStyle = '#4CAF50';
ctx.fillRect(20, canvas.height - 60, 160, 40);
ctx.fillStyle = '#fff';
ctx.font = '18px Arial';
ctx.fillText('Yeniden Başla', 100, canvas.height - 33);

ctx.fillStyle = '#f44336';
ctx.fillRect(canvas.width - 180, canvas.height - 60, 160, 40);
ctx.fillStyle = '#fff';
ctx.fillText('Ana Menü', canvas.width - 100, canvas.height - 33);
}

// Yeni seviye kurulumu
function setupLevel() {
score = 0;
enemies = [];
points = [];
bonusTops = [];
isMovingToTarget = false;
player.x = canvas.width / 2;
player.y = canvas.height / 2;

if (level === 1) {
levelEnemies = { normal: 1, fast: 0, big: 0 };
} else {
let totalNormal = levelEnemies.normal + (levelEnemies.fast * 5) + (levelEnemies.big * 15) + 1;
let newBig = Math.floor(totalNormal / 15);
let remaining = totalNormal % 15;
let newFast = Math.floor(remaining / 5);
let newNormal = remaining % 5;
levelEnemies = { normal: newNormal, fast: newFast, big: newBig };}

const maxTopCount = 6;
let currentTopCount = levelEnemies.normal + levelEnemies.fast + levelEnemies.big;
if (currentTopCount > maxTopCount) {
let excess = currentTopCount - maxTopCount;
while(excess > 0) {
if (levelEnemies.big > 0) { levelEnemies.big--; }
else if (levelEnemies.fast > 0) { levelEnemies.fast--; }
else if (levelEnemies.normal > 0) { levelEnemies.normal--; }
else break;
}}

const currentLevelEnemies = {...levelEnemies};
for (const type in currentLevelEnemies) {
const count = currentLevelEnemies[type];
let speed = ENEMY_NORMAL_SPEED;
let radius = PLAYER_RADIUS;
let color = 'red';
if (type === 'fast') { speed = ENEMY_FAST_SPEED; color = 'blue'; }
else if (type === 'big') { speed = ENEMY_BIG_SPEED; radius = ENEMY_BIG_RADIUS; color = 'purple'; }

for (let i = 0; i < count; i++) {
let enemyX, enemyY;
const edge = Math.floor(Math.random() * 4);
if (edge === 0) { enemyX = Math.random() * canvas.width; enemyY = ENEMY_START_MARGIN; }
else if (edge === 1) { enemyX = canvas.width - ENEMY_START_MARGIN; enemyY = Math.random() * canvas.height; }
else if (edge === 2) { enemyX = Math.random() * canvas.width; enemyY = canvas.height - ENEMY_START_MARGIN; }
else { enemyX = ENEMY_START_MARGIN; enemyY = Math.random() * canvas.height; }

let angle = Math.atan2(player.y - enemyY, player.x - enemyX) + (Math.random() - 0.5) * Math.PI / 4;
let dx = speed * Math.cos(angle);
let dy = speed * Math.sin(angle);

enemies.push({ x: enemyX, y: enemyY, radius: radius, dx, dy, isActive: true, type, color });
}}
for (let i = 0; i < POINTS_PER_LEVEL / 5; i++) {
points.push({ x: Math.random() * (canvas.width - 20) + 10, y: Math.random() * (canvas.height - 20) + 10 });
}
createBonusTops();
}

// Bonus top oluştur
function createBonusTops() {
bonusTops = [];
const bonusTypes = ['speed','invincible','surprise','life'];
for (let i=0;i<2;i++){
 const type = bonusTypes[Math.floor(Math.random()*bonusTypes.length)]
 let color = type==='speed'?'green':type==='invincible'?'gold':type==='life'?'pink':'yellow'
bonusTops.push({ x: Math.random()*(canvas.width-20)+10, y: Math.random()*(canvas.height-20)+10, type, color, radius:10, collected:false });
 }}

// Çizim fonksiyonları
function drawEnemies() { enemies.forEach(e=>{ ctx.fillStyle=e.color; ctx.beginPath(); ctx.arc(e.x,e.y,e.radius,0,Math.PI*2); ctx.fill(); ctx.closePath(); }); }
function drawPoints() { points.forEach(p=>{ ctx.fillStyle='lightblue'; ctx.beginPath(); ctx.arc(p.x,p.y,10,0,Math.PI*2); ctx.fill(); ctx.closePath(); }); }
function drawBonusTops() { bonusTops.forEach(top=>{ if(top.collected)return; ctx.beginPath(); ctx.arc(top.x,top.y,top.radius,0,Math.PI*2); ctx.fillStyle=top.color; ctx.fill(); ctx.closePath(); if(top.type==='surprise'){ ctx.fillStyle='black'; ctx.font='16px Arial'; ctx.textAlign='center'; ctx.fillText('?',top.x,top.y+6); } }); }

function drawTrail() {
for (let i=0;i<trail.length;i++){
const point=trail.at(-1-i); if(!point)continue;
const age=Date.now()-point.timestamp;
const opacity=Math.max(0,1-age/TRAIL_LIFETIME);
if(opacity>0){ ctx.beginPath(); ctx.arc(point.x,point.y,player.radius*0.5*opacity,0,Math.PI*2); ctx.fillStyle=trailColor.replace('0.7',opacity); ctx.fill(); ctx.closePath(); }
}
while(trail.length>0 && Date.now()-trail.at(0).timestamp>TRAIL_LIFETIME) trail.shift();
}

function drawPlayer() {
drawTrail();
if(player.image.complete && player.image.naturalWidth!==0){
ctx.save(); ctx.beginPath(); ctx.arc(player.x,player.y,player.radius,0,Math.PI*2); ctx.clip();
ctx.drawImage(player.image,player.x-player.radius,player.y-player.radius,player.radius*2,player.radius*2); ctx.restore();
} else { ctx.beginPath(); ctx.arc(player.x,player.y,player.radius,0,Math.PI*2); ctx.fillStyle='lime'; ctx.fill(); ctx.closePath(); }
if(player.isMoving){ ctx.shadowColor='rgba(0,255,0,0.7)'; ctx.shadowBlur=10; trail.push({x:player.x,y:player.y,timestamp:Date.now()}); } else { ctx.shadowBlur=0; }
ctx.fillStyle='#fff'; ctx.font='16px Arial'; ctx.textAlign='center'; ctx.fillText(player.name,player.x,player.y-player.radius-10);
}

// Çarpışmalar
function checkCollisions(){
for(let i=points.length-1;i>=0;i--){ if(Math.hypot(player.x-points[i].x,player.y-points[i].y)<player.radius+10){ score+=5; totalScore+=5; points.splice(i,1); } }
bonusTops.forEach(top=>{ if(top.collected)return; if(Math.hypot(player.x-top.x,player.y-top.y)<player.radius+top.radius){ top.collected=true;
if(top.type==='speed'){ player.speed*=1.4; trailColor='green'; setTimeout(()=>{player.speed=PLAYER_SPEED; trailColor='rgba(0,255,0,0.7)';},BONUS_EFFECT_DURATION); }
else if(top.type==='invincible'){ invincible=true; trailColor='gold'; setTimeout(()=>{invincible=false; trailColor='rgba(0,255,0,0.7)';},BONUS_EFFECT_DURATION); }
else if(top.type==='life' && playerLives<MAX_LIVES) playerLives++;
else if(top.type==='surprise'){ const r=Math.random(); if(r<0.4){ player.speed*=1.4; trailColor='green'; setTimeout(()=>{player.speed=PLAYER_SPEED;if(trailColor!=='red')trailColor='rgba(0,255,0,0.7)';},BONUS_EFFECT_DURATION); } 
else if(r<0.7){ invincible=true; trailColor='gold'; setTimeout(()=>{invincible=false;if(trailColor!=='red')trailColor='rgba(0,255,0,0.7)';},BONUS_EFFECT_DURATION); } 
else if(r<0.9){ if(playerLives<MAX_LIVES) playerLives++; } else { playerLives--; } } } });
enemies.forEach(enemy=>{ if(invincible||!canTakeDamage)return; if(Math.hypot(player.x-enemy.x,player.y-enemy.y)<player.radius+enemy.radius){ playerLives--; trailColor='red'; canTakeDamage=false;
setTimeout(()=>{ canTakeDamage=true; if(trailColor==='red')trailColor='rgba(0,255,0,0.7)'; },HIT_INVINCIBILITY_DURATION);
if(playerLives<=0){ endGame(); } else { player.x=canvas.width/2; player.y=canvas.height/2; isMovingToTarget=false; } } });}

// Oyun güncelleme
function updateGame(){
enemies.forEach(enemy=>{ enemy.x+=enemy.dx; enemy.y+=enemy.dy; if(enemy.x+enemy.radius>canvas.width||enemy.x-enemy.radius<0)enemy.dx*=-1; if(enemy.y+enemy.radius>canvas.height||enemy.y-enemy.radius<0)enemy.dy*=-1; });
if(score>=POINTS_PER_LEVEL){ level++; startNewLevel(); }
}

// --- EndGame ve skor yönetimi ---
function endGame(){
if(!isGameRunning)return;
isGameRunning=false;
finalScore=totalScore;
finalTime=elapsedTime;
saveScore(finalScore,player.name);
drawEndGameScreen();
}

function drawEndGameScreen(message = 'GAME OVER') {
ctx.clearRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = 'red';
ctx.shadowColor = 'rgba(255,0,0,1)';
ctx.shadowBlur = 15;
ctx.font = 'bold 80px Arial';
ctx.textAlign = 'center';
ctx.fillText(message, canvas.width / 2, 100);
ctx.shadowBlur = 0;
ctx.fillStyle = '#fff';
ctx.font = '28px Arial';
ctx.fillText(`Skorunuz: ${finalScore}`, canvas.width / 2, 160);
ctx.fillText(`Geçen Süre: ${finalTime} sn`, canvas.width / 2, 200);

const highScores = getHighScores();

    // Skor kutusu
const boxWidth = 400;
const boxHeight = 10 * 30 + 60; // 10 satır ve başlık için sabit yükseklik
const boxX = canvas.width / 2 - boxWidth / 2;
const boxY = 230;
ctx.fillStyle = 'rgba(0,0,0,0.6)';
ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

    // Skor başlığı
 ctx.fillStyle = 'yellow';
 ctx.font = '24px Arial';
 ctx.fillText('En İyi 10 Skor', canvas.width / 2, boxY + 30);
 // Skorlar
 ctx.font = '20px Arial';
 const startY = boxY + 60;
 const lineHeight = 30;
 let yourScoreDrawn = false;
 let yourRank = -1;
 for (let i = 0; i < highScores.length; i++) {
 if (highScores[i].gameId === lastGameId) {
 yourRank = i + 1;
 break;
 }}

for (let i = 0; i < 10; i++) {
const entry = highScores[i];
let text = `${i + 1}. . . . . . . . . .`;
let color = '#fff';
let fontStyle = '20px Arial';
if (entry) {
text = `${i + 1}. ${entry.name} - ${entry.score} puan - ${entry.date}`;
if (i + 1 === yourRank) {
text = `${i + 1}. Oyununuz: ${entry.name} - ${entry.score} puan - ${entry.date}`;
color = '#ffcc00'; // Sarı renk
fontStyle = 'bold 20px Arial'; // Kalın font
yourScoreDrawn = true;
}
}

ctx.fillStyle = color;
ctx.font = fontStyle;
ctx.fillText(text, canvas.width / 2, startY + i * lineHeight);
}

    // Eğer skorunuz ilk 10'a giremezse en altta göster.
 if (!yourScoreDrawn && yourRank === -1) {
ctx.fillStyle = '#ffcc00'; // Sarı renk
ctx.font = 'bold 20px Arial'; // Kalın font
const lastEntryY = startY + (10) * lineHeight;
ctx.fillText(`Oyununuz: ${player.name} - ${finalScore} puan - ${new Date().toLocaleDateString('tr-TR')}`, canvas.width / 2, lastEntryY);
}

drawEndGameButtons();
}

// Skor kaydetme ve yükleme
function saveScore(score, playerName) {
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

const now = new Date();
const dateString = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
const gameId = Date.now();
lastGameId = gameId;

 // Yeni skor ekle
highScores.push({ name: playerName, score, date: dateString, gameId: gameId });

    // Skorları önce puana, sonra zamana göre (büyükten küçüğe) sırala
highScores.sort((a, b) => {
if (b.score !== a.score) {
return b.score - a.score;
}
return a.gameId - b.gameId;
});

localStorage.setItem('highScores', JSON.stringify(highScores));
}

function getHighScores() {
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
highScores.sort((a, b) => {
if (b.score !== a.score) {
return b.score - a.score;
}
return a.gameId - b.gameId;
});

return highScores;
}

// --- Oyun başlatma ve döngü ---
function startNewLevel(){ if(animationFrameId) cancelAnimationFrame(animationFrameId); isGameRunning=true; canTakeDamage=true; invincible=false; trailColor='rgba(0,255,0,0.7)'; startTime=Date.now(); setupLevel(); gameLoop(); }
function startNewGame(){ if(animationFrameId) cancelAnimationFrame(animationFrameId); isGameRunning=true; level=1; score=0; totalScore=0; playerLives=3; invincible=false; canTakeDamage=true; enemies=[]; points=[]; bonusTops=[]; trail=[]; player.speed=PLAYER_SPEED; levelEnemies={normal:0,fast:0,big:0}; lastGameId = null; startNewLevel(); }

// Profil oluşturma
function readAndLoadProfile(){
const playerName = playerNameInput.value.trim();
const file = playerImageInput.files[0];
const selectedAvatar = document.querySelector('.avatar.selected');

if (!playerName) {
alert('Lütfen karakter adınızı girin.');
return;
}
if (!file && !selectedAvatar) {
alert('Lütfen bir resim yükleyin ya da bir avatar seçin.');
 return;}

 player.name = playerName;
 profileScreen.style.display = 'none';
 gameScreen.style.display = 'flex';

 startNewGame(); // Oyunu hemen başlat

    // Avatarı arka planda yükle
if (file) {
const reader = new FileReader();
reader.onload = (e) => {
player.image.src = e.target.result;
};
reader.readAsDataURL(file);
} else if (selectedAvatar) {
player.image.src = selectedAvatar.src;
}}

// Oyun döngüsü
function gameLoop(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 if(isGameRunning){
 elapsedTime=Math.floor((Date.now()-startTime)/1000);
 if(isMouseDown||isMovingToTarget){
 const dx=targetX-player.x; const dy=targetY-player.y; const dist=Math.sqrt(dx*dx+dy*dy);
 if(dist>5){ const angle=Math.atan2(dy,dx); player.x+=player.speed*Math.cos(angle); player.y+=player.speed*Math.sin(angle); player.isMoving=true; }
 else{ player.x=targetX; player.y=targetY; player.isMoving=false; isMovingToTarget=false; }
} else player.isMoving=false;
 updateGame(); checkCollisions(); drawEnemies(); drawPoints(); drawBonusTops(); drawPlayer(); drawStatus();
 } else drawEndGameScreen();
 animationFrameId=requestAnimationFrame(gameLoop);
}

// Mouse kontrolleri
createProfileBtn.addEventListener('click', readAndLoadProfile);
canvas.addEventListener('mousedown',e=>{ isMouseDown=true; isMovingToTarget=true; updateTargetPosition(e); });
canvas.addEventListener('mouseup',()=>{ isMouseDown=false; });
canvas.addEventListener('mousemove',e=>{ if(isMouseDown) updateTargetPosition(e); });
canvas.addEventListener('click',e=>{
if(!isGameRunning){
const rect=canvas.getBoundingClientRect();
const mouseX=e.clientX-rect.left;
const mouseY=e.clientY-rect.top;
if(mouseX>20 && mouseX<180 && mouseY>canvas.height-60 && mouseY<canvas.height-20){ startNewGame(); }
if(mouseX>canvas.width-180 && mouseX<canvas.width-20 && mouseY>canvas.height-60 && mouseY<canvas.height-20){
gameScreen.style.display='none';
profileScreen.style.display='flex';
playerNameInput.value=''; playerImageInput.value=''; avatars.forEach(a=>a.classList.remove('selected'));
}}});

function updateTargetPosition(e){ const rect=canvas.getBoundingClientRect(); targetX=e.clientX-rect.left; targetY=e.clientY-rect.top; }