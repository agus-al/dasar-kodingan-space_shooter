// ==================== SETUP CANVAS ====================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const healthSpan = document.getElementById('health');
const gameOverlay = document.getElementById('gameOverlay');
const gameMessage = document.getElementById('gameMessage');

// ==================== KONFIGURASI GAME ====================
const CONFIG = {
    PLAYER_SPEED: 5,
    BULLET_SPEED: -7,
    ENEMY_SPEED: 2,
    BULLET_COOLDOWN: 10,
    ENEMY_SPAWN_RATE: 30,
    MAX_ENEMIES: 15,
    INVINCIBLE_DURATION: 120
};

// [TEMPAT 1] - TAMBAHKAN ENEMY TYPES DI SINI
const ENEMY_TYPES = {
    SCOUT: 'scout',
    FIGHTER: 'fighter',
    BOMBER: 'bomber',
    BOSS: 'boss',
    UFO: 'ufo'
};

// ==================== OBJEK GAME ====================
let gameRunning = true;
let frameCount = 0;
let score = 0;
let health = 3;
let invincibleFrames = 0;

// [TEMPAT 2] - TAMBAHKAN PLAYER UPGRADE DI SINI
let playerUpgrade = {
    level: 1,
    skin: 'default' // 'default', 'jet', 'stealth', 'space'
};

// Player
let player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: CONFIG.PLAYER_SPEED
};

// Array untuk objek game
let bullets = [];
let enemies = [];
let explosions = [];

// ==================== KEYBOARD CONTROL ====================
let keys = {};
let shootPressed = false;
let shootCooldown = 0;

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        shootPressed = true;
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    if (e.key === ' ') {
        shootPressed = false;
    }
});

// ==================== [TEMPAT 3] - FUNGSI MENGGAMBAR PESAWAT ====================
// TARUH SEMUA FUNGSI DRAW PLAYER DI SINI
function drawPlayer(x, y, width, height, upgrade) {
    const centerX = x + width/2;
    
    if (upgrade.skin === 'stealth') {
        drawStealthFighter(x, y, width, height);
    } else if (upgrade.skin === 'space') {
        drawSpaceShip(x, y, width, height);
    } else {
        drawJetFighter(x, y, width, height, upgrade.level);
    }
}

function drawJetFighter(x, y, width, height, level) {
    const centerX = x + width/2;
    
    // Badan utama
    ctx.fillStyle = '#4a90e2';
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + width, y + height * 0.4);
    ctx.lineTo(x + width - 10, y + height * 0.6);
    ctx.lineTo(x + width - 10, y + height);
    ctx.lineTo(x + 10, y + height);
    ctx.lineTo(x + 10, y + height * 0.6);
    ctx.lineTo(x, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
    
    // Kokpit
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.ellipse(centerX, y + height * 0.2, width * 0.15, height * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Sayap utama
    ctx.fillStyle = '#2c3e50';
    // Sayap kiri
    ctx.beginPath();
    ctx.moveTo(x, y + height * 0.4);
    ctx.lineTo(x - 20, y + height * 0.5);
    ctx.lineTo(x - 15, y + height * 0.7);
    ctx.lineTo(x, y + height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Sayap kanan
    ctx.beginPath();
    ctx.moveTo(x + width, y + height * 0.4);
    ctx.lineTo(x + width + 20, y + height * 0.5);
    ctx.lineTo(x + width + 15, y + height * 0.7);
    ctx.lineTo(x + width, y + height * 0.6);
    ctx.closePath();
    ctx.fill();
    
    // Api mesin
    drawEngineFire(x, y, width, height, level);
    
    // Detail tambahan sesuai level
    if (level >= 2) {
        drawMissiles(x, y, width, height);
    }
    if (level >= 3) {
        drawWingsLights(x, y, width, height);
    }
}

function drawStealthFighter(x, y, width, height) {
    const centerX = x + width/2;
    
    ctx.fillStyle = '#2c3e50';
    ctx.shadowColor = '#7f8c8d';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, y);
    ctx.lineTo(x + width, y + height * 0.3);
    ctx.lineTo(x + width - 10, y + height * 0.7);
    ctx.lineTo(centerX, y + height);
    ctx.lineTo(x + 10, y + height * 0.7);
    ctx.lineTo(x, y + height * 0.3);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(x + 5, y + height * 0.3);
    ctx.lineTo(x + width - 5, y + height * 0.3);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.shadowBlur = 0;
}

function drawSpaceShip(x, y, width, height) {
    const centerX = x + width/2;
    
    ctx.fillStyle = '#3498db';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.ellipse(centerX, y + height/2, width/2, height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#b0e0e6';
    ctx.beginPath();
    ctx.ellipse(centerX, y + height/3, width/4, height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(centerX, y + height/2, width/2.5, height/4, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(centerX - 20, y + height);
    ctx.lineTo(centerX + 20, y + height);
    ctx.lineTo(centerX, y + height + 30);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    
    ctx.shadowBlur = 0;
}

function drawEngineFire(x, y, width, height, level) {
    const fireLength = level === 1 ? 15 : (level === 2 ? 25 : 35);
    
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    
    for (let i = 0; i < 3; i++) {
        let fireX = x + 10 + (i * 10);
        
        let gradient = ctx.createLinearGradient(fireX, y + height, fireX, y + height + fireLength);
        gradient.addColorStop(0, '#ffff00');
        gradient.addColorStop(0.6, '#ff9900');
        gradient.addColorStop(1, '#ff3300');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(fireX - 3, y + height);
        ctx.lineTo(fireX + 3, y + height);
        ctx.lineTo(fireX, y + height + fireLength);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.shadowBlur = 0;
}

function drawMissiles(x, y, width, height) {
    ctx.fillStyle = '#c0392b';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 5;
    
    // Rudal kiri
    ctx.fillRect(x - 10, y + height * 0.3, 5, 15);
    ctx.beginPath();
    ctx.arc(x - 7.5, y + height * 0.3 - 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    
    // Rudal kanan
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x + width + 5, y + height * 0.3, 5, 15);
    ctx.beginPath();
    ctx.arc(x + width + 7.5, y + height * 0.3 - 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

function drawWingsLights(x, y, width, height) {
    ctx.shadowBlur = 10;
    
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(x - 5, y + height * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#44ff44';
    ctx.shadowColor = '#00ff00';
    ctx.beginPath();
    ctx.arc(x + width + 5, y + height * 0.5, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
}

// ==================== [TEMPAT 4] - FUNGSI MENGGAMBAR MUSUH ====================
// TARUH SEMUA FUNGSI DRAW ENEMY DI SINI
function drawEnemy(enemy) {
    switch(enemy.type) {
        case ENEMY_TYPES.SCOUT:
            drawScout(enemy);
            break;
        case ENEMY_TYPES.FIGHTER:
            drawFighter(enemy);
            break;
        case ENEMY_TYPES.BOMBER:
            drawBomber(enemy);
            break;
        case ENEMY_TYPES.BOSS:
            drawBoss(enemy);
            break;
        case ENEMY_TYPES.UFO:
            drawUFO(enemy);
            break;
        default:
            // Fallback ke gambar lama
            drawOldEnemy(enemy);
    }
    
    if (enemy.hp > 1) {
        drawHealthBar(enemy);
    }
}

function drawScout(enemy) {
    const centerX = enemy.x + enemy.width/2;
    const centerY = enemy.y + enemy.height/2;
    
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.moveTo(centerX, enemy.y);
    ctx.lineTo(enemy.x + enemy.width, centerY);
    ctx.lineTo(centerX, enemy.y + enemy.height);
    ctx.lineTo(enemy.x, centerY);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(centerX - 5, centerY - 3, 3, 0, Math.PI * 2);
    ctx.arc(centerX + 5, centerY - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 5, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.arc(centerX + 5, centerY - 3, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawFighter(enemy) {
    const centerX = enemy.x + enemy.width/2;
    
    ctx.fillStyle = '#cc3333';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.ellipse(centerX, enemy.y + enemy.height/2, enemy.width/2, enemy.height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#aa2222';
    ctx.beginPath();
    ctx.moveTo(enemy.x, enemy.y + enemy.height/2);
    ctx.lineTo(enemy.x - 15, enemy.y + enemy.height/3);
    ctx.lineTo(enemy.x - 15, enemy.y + enemy.height*2/3);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(enemy.x + enemy.width, enemy.y + enemy.height/2);
    ctx.lineTo(enemy.x + enemy.width + 15, enemy.y + enemy.height/3);
    ctx.lineTo(enemy.x + enemy.width + 15, enemy.y + enemy.height*2/3);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#660000';
    ctx.beginPath();
    ctx.ellipse(centerX, enemy.y + enemy.height/3, enemy.width/6, enemy.height/6, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.fillRect(centerX - 2, enemy.y + enemy.height/2 - 5, 4, 10);
}

function drawBomber(enemy) {
    const centerX = enemy.x + enemy.width/2;
    
    ctx.fillStyle = '#884422';
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.ellipse(centerX, enemy.y + enemy.height/2, enemy.width/2, enemy.height/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#663311';
    ctx.fillRect(enemy.x - 10, enemy.y + enemy.height/3, 10, enemy.height/3);
    ctx.fillRect(enemy.x + enemy.width, enemy.y + enemy.height/3, 10, enemy.height/3);
    
    for (let i = 0; i < 3; i++) {
        let bombX = enemy.x + 15 + (i * 20);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.ellipse(bombX, enemy.y + enemy.height - 5, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#ccc';
        ctx.fillRect(bombX - 1, enemy.y + enemy.height - 12, 2, 5);
    }
    
    ctx.shadowBlur = 10;
    ctx.fillStyle = frameCount % 20 < 10 ? '#ff0' : '#f00';
    ctx.beginPath();
    ctx.arc(enemy.x - 5, enemy.y + 5, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawUFO(enemy) {
    const centerX = enemy.x + enemy.width/2;
    const centerY = enemy.y + enemy.height/2;
    
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    
    ctx.fillStyle = '#44aaff';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, enemy.width/2, enemy.height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#aaddff';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 8, enemy.width/4, enemy.height/4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, enemy.width/2.2, enemy.height/3.5, frameCount * 0.02, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    if (enemy.attacking) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#88ddff';
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY + 10);
        ctx.lineTo(centerX + 10, centerY + 10);
        ctx.lineTo(centerX, centerY + 50);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function drawBoss(enemy) {
    const centerX = enemy.x + enemy.width/2;
    
    ctx.fillStyle = '#8b0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 30;
    
    ctx.beginPath();
    ctx.ellipse(centerX, enemy.y + enemy.height/2, enemy.width/2, enemy.height/3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#660000';
    ctx.fillRect(centerX - 20, enemy.y + 10, 40, 20);
    
    for (let i = 0; i < 5; i++) {
        let cannonX = enemy.x + 20 + (i * 30);
        ctx.fillStyle = '#333';
        ctx.fillRect(cannonX - 3, enemy.y + 5, 6, 15);
    }
    
    if (enemy.hp > 5) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.ellipse(centerX, enemy.y + enemy.height/2, enemy.width/2 + 10, enemy.height/2 + 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(centerX - 15, enemy.y + 25, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 15, enemy.y + 25, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - 15, enemy.y + 25, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 15, enemy.y + 25, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawOldEnemy(enemy) {
    // Gambar musuh versi lama (kotak merah)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = '#fff';
    ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
    ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
}

function drawHealthBar(enemy) {
    const barWidth = enemy.width;
    const barHeight = 5;
    const healthPercent = enemy.hp / enemy.maxHp;
    
    ctx.fillStyle = '#333';
    ctx.fillRect(enemy.x, enemy.y - 10, barWidth, barHeight);
    
    ctx.fillStyle = healthPercent > 0.6 ? '#00ff00' : (healthPercent > 0.3 ? '#ffff00' : '#ff0000');
    ctx.fillRect(enemy.x, enemy.y - 10, barWidth * healthPercent, barHeight);
    
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(enemy.x, enemy.y - 10, barWidth, barHeight);
}

// ==================== [TEMPAT 5] - UPDATE FUNGSI SPAWN ENEMY ====================
// GANTI fungsi spawn enemy yang lama dengan yang ini
function spawnEnemy() {
    if (enemies.length >= CONFIG.MAX_ENEMIES) return;
    
    const rand = Math.random();
    let enemyType;
    let hp = 1;
    let width = 35;
    let height = 35;
    let speed = CONFIG.ENEMY_SPEED;
    
    if (score < 500) {
        enemyType = rand < 0.6 ? ENEMY_TYPES.SCOUT : ENEMY_TYPES.FIGHTER;
        speed = rand < 0.6 ? 3 : 2;
    } else if (score < 2000) {
        if (rand < 0.4) {
            enemyType = ENEMY_TYPES.SCOUT;
            speed = 3.5;
        } else if (rand < 0.7) {
            enemyType = ENEMY_TYPES.FIGHTER;
        } else if (rand < 0.9) {
            enemyType = ENEMY_TYPES.BOMBER;
            width = 50;
            height = 50;
            hp = 3;
            speed = 1.5;
        } else {
            enemyType = ENEMY_TYPES.UFO;
            hp = 2;
            speed = 2;
        }
    } else {
        if (rand < 0.3) {
            enemyType = ENEMY_TYPES.SCOUT;
        } else if (rand < 0.6) {
            enemyType = ENEMY_TYPES.FIGHTER;
        } else if (rand < 0.85) {
            enemyType = ENEMY_TYPES.BOMBER;
            width = 50;
            height = 50;
            hp = 3;
        } else if (rand < 0.98) {
            enemyType = ENEMY_TYPES.UFO;
            hp = 2;
        } else {
            if (frameCount % 600 === 0) {
                enemyType = ENEMY_TYPES.BOSS;
                width = 120;
                height = 80;
                hp = 10;
                speed = 0.8;
            } else {
                enemyType = ENEMY_TYPES.FIGHTER;
            }
        }
    }
    
    enemies.push({
        x: Math.random() * (canvas.width - width),
        y: -height,
        width: width,
        height: height,
        speed: speed,
        type: enemyType,
        hp: hp,
        maxHp: hp,
        attacking: false
    });
}

// ==================== FUNGSI UTAMA UPDATE ====================
function update() {
    if (!gameRunning) return;
    
    frameCount++;
    if (invincibleFrames > 0) invincibleFrames--;
    
    // Gerakkan player
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
    
    // Tembak
    if (shootPressed && shootCooldown <= 0) {
        bullets.push({
            x: player.x + player.width/2 - 2.5,
            y: player.y - 10,
            width: 5,
            height: 10,
            speed: CONFIG.BULLET_SPEED
        });
        shootCooldown = CONFIG.BULLET_COOLDOWN;
    }
    if (shootCooldown > 0) shootCooldown--;
    
    // Update peluru
    bullets = bullets.filter(bullet => {
        bullet.y += bullet.speed;
        return bullet.y + bullet.height > 0;
    });
    
    // [TEMPAT 6] - PANGGIL FUNGSI SPAWN ENEMY YANG BARU
    if (frameCount % CONFIG.ENEMY_SPAWN_RATE === 0 && enemies.length < CONFIG.MAX_ENEMIES) {
        spawnEnemy(); // Ini akan memanggil fungsi spawnEnemy() yang baru
    }
    
    // Update musuh
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        
        // Cek tabrakan dengan peluru
        for (let i = bullets.length - 1; i >= 0; i--) {
            if (collision(bullets[i], enemy)) {
                bullets.splice(i, 1);
                enemy.hp--;
                
                if (enemy.hp <= 0) {
                    // Skor berdasarkan tipe musuh
                    let enemyScore = 20;
                    if (enemy.type === ENEMY_TYPES.SCOUT) enemyScore = 30;
                    else if (enemy.type === ENEMY_TYPES.FIGHTER) enemyScore = 40;
                    else if (enemy.type === ENEMY_TYPES.BOMBER) enemyScore = 60;
                    else if (enemy.type === ENEMY_TYPES.UFO) enemyScore = 50;
                    else if (enemy.type === ENEMY_TYPES.BOSS) enemyScore = 200;
                    
                    score += enemyScore;
                    scoreSpan.textContent = score;
                    
                    explosions.push({
                        x: enemy.x,
                        y: enemy.y,
                        width: enemy.width,
                        height: enemy.height,
                        frame: 0
                    });
                    
                    return false;
                }
            }
        }
        
        // Cek tabrakan dengan player
        if (invincibleFrames <= 0 && collision(player, enemy)) {
            health--;
            healthSpan.textContent = health;
            invincibleFrames = CONFIG.INVINCIBLE_DURATION;
            
            explosions.push({
                x: player.x,
                y: player.y,
                width: player.width,
                height: player.height,
                frame: 0
            });
            
            if (health <= 0) {
                gameOver();
            }
            
            return false;
        }
        
        return enemy.y < canvas.height + 50;
    });
    
    // Update ledakan
    explosions = explosions.filter(exp => {
        exp.frame++;
        return exp.frame < 20;
    });
}

// ==================== FUNGSI RENDER ====================
function draw() {
    // Bersihkan canvas
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Gambar bintang latar
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 50; i++) {
        let x = (i * 17 + frameCount) % canvas.width;
        let y = (i * 13) % canvas.height;
        let size = Math.random() * 2 + 1;
        ctx.globalAlpha = 0.5 + Math.sin(frameCount * 0.01 + i) * 0.3;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
    
    // [TEMPAT 7] - GAMBAR PLAYER DENGAN FUNGSI BARU
    drawPlayer(player.x, player.y, player.width, player.height, playerUpgrade);
    
    // Gambar peluru
    bullets.forEach(bullet => {
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 10;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        ctx.fillStyle = '#ffaa00';
        ctx.fillRect(bullet.x - 2, bullet.y + 5, bullet.width + 4, 2);
    });
    
    // [TEMPAT 8] - GAMBAR MUSUH DENGAN FUNGSI BARU
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
    
    ctx.shadowBlur = 0;
    
    // Gambar ledakan
    explosions.forEach(exp => {
        let size = exp.frame * 2;
        ctx.fillStyle = `rgba(255, ${200 - exp.frame * 10}, 0, ${1 - exp.frame/20})`;
        ctx.beginPath();
        ctx.arc(exp.x + exp.width/2, exp.y + exp.height/2, size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${1 - exp.frame/20})`;
        ctx.beginPath();
        ctx.arc(exp.x + exp.width/2, exp.y + exp.height/2, size/2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ==================== FUNGSI COLLISION ====================
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ==================== GAME OVER ====================
function gameOver() {
    gameRunning = false;
    gameMessage.textContent = 'GAME OVER';
    gameOverlay.style.display = 'block';
}

// ==================== RESET GAME ====================
function resetGame() {
    gameRunning = true;
    health = 3;
    score = 0;
    player.x = canvas.width / 2 - 20;
    bullets = [];
    enemies = [];
    explosions = [];
    invincibleFrames = 0;
    frameCount = 0;
    playerUpgrade.level = 1; // Reset upgrade level
    
    healthSpan.textContent = health;
    scoreSpan.textContent = score;
    gameOverlay.style.display = 'none';
}

// ==================== LOOP UTAMA ====================
function gameLoop() {
    if (gameRunning) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Mulai game
resetGame();
gameLoop();

// Export fungsi untuk tombol restart
window.resetGame = resetGame;