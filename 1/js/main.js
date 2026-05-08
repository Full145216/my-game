// 游戏主循环

let mainCtx, backGroundCtx, roleCtx, enemyCtx, rBulletsCtx, powerupCtx, effectCtx, particlesCtx;

function initCanvas() {
    const mainCanvas = document.getElementById("main_canvas");
    mainCtx = mainCanvas.getContext("2d");
    mainCanvas.width = window.GameConfig.canvasWidth;
    mainCanvas.height = window.GameConfig.canvasHeight;
    
    const backGroundCanvas = document.getElementById("bg_canvas");
    backGroundCtx = backGroundCanvas.getContext("2d");
    backGroundCanvas.width = window.GameConfig.canvasWidth;
    backGroundCanvas.height = window.GameConfig.canvasHeight;
    
    const roleCanvas = document.getElementById("role_canvas");
    roleCtx = roleCanvas.getContext("2d");
    roleCanvas.width = window.GameConfig.canvasWidth;
    roleCanvas.height = window.GameConfig.canvasHeight;
    
    const enemyCanvas = document.getElementById("enemy_canvas");
    enemyCtx = enemyCanvas.getContext("2d");
    enemyCanvas.width = window.GameConfig.canvasWidth;
    enemyCanvas.height = window.GameConfig.canvasHeight;
    
    const rBulletsCanvas = document.getElementById("r_bullets_canvas");
    rBulletsCtx = rBulletsCanvas.getContext("2d");
    rBulletsCanvas.width = window.GameConfig.canvasWidth;
    rBulletsCanvas.height = window.GameConfig.canvasHeight;
    
    const particlesCanvas = document.getElementById("particles_canvas");
    particlesCtx = particlesCanvas.getContext("2d");
    particlesCanvas.width = window.GameConfig.canvasWidth;
    particlesCanvas.height = window.GameConfig.canvasHeight;
    
    const powerupCanvas = document.createElement('canvas');
    powerupCanvas.id = 'powerup_canvas';
    powerupCanvas.width = window.GameConfig.canvasWidth;
    powerupCanvas.height = window.GameConfig.canvasHeight;
    powerupCanvas.style.position = 'absolute';
    powerupCanvas.style.top = '0';
    powerupCanvas.style.left = '0';
    powerupCanvas.style.zIndex = '6';
    document.getElementById('gameContainer').appendChild(powerupCanvas);
    powerupCtx = powerupCanvas.getContext("2d");
    
    const effectCanvas = document.createElement('canvas');
    effectCanvas.id = 'effect_canvas';
    effectCanvas.width = window.GameConfig.canvasWidth;
    effectCanvas.height = window.GameConfig.canvasHeight;
    effectCanvas.style.position = 'absolute';
    effectCanvas.style.top = '0';
    effectCanvas.style.left = '0';
    effectCanvas.style.zIndex = '7';
    document.getElementById('gameContainer').appendChild(effectCanvas);
    effectCtx = effectCanvas.getContext("2d");
    
    setupMouseEvents(mainCanvas);
    setupMobileControls();
    
    let lastTimestamp = 0;
    let lastEnemySpawn = 0;
    
    function gameLoop(timestamp) {
        if (!window.gameState.gameActive) return;
        
        if (window.gameState.paused) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        lastTimestamp = timestamp;
        
        const spawnInterval = Math.max(400, window.GameConfig.enemySpawnInterval - (window.gameState.round - 1) * 80);
        if (!window.gameState.isBossRound && timestamp - lastEnemySpawn > spawnInterval) {
            spawnEnemy();
            lastEnemySpawn = timestamp;
        }
        
        if (window.keyAttack && window.gameState?.gameActive && !window.gameState?.paused) {
            window.fireBullet(timestamp);
        }
        
        rolePosition(mainCtx.canvas);
        updateEnemies();
        updateBullets(rBulletsCtx, timestamp);
        updateGrenades();
        updatePowerups();
        updateEffects(effectCtx);
        updateParticles(particlesCtx);
        updateDamageNumbers(mainCtx);
        updateInvincible();
        updateHealthBar();
        
        drawBackground(backGroundCtx);
        drawEnemies(enemyCtx);
        drawPowerups(powerupCtx);
        runRwalk(roleCtx);
        runRstand(roleCtx);
        drawRHp(mainCtx);
        drawGameInfo(mainCtx);
        drawWeaponInfo();
        drawComboInfo();
        
        checkGameOver();
        
        requestAnimationFrame(gameLoop);
    }
    
    requestAnimationFrame(gameLoop);
}

function updateHealthBar() {
    const healthPercent = (window.role.hp / window.role.maxHp) * 100;
    document.getElementById('health-fill').style.width = `${healthPercent}%`;
    document.getElementById('health-text').textContent = `HP: ${Math.round(healthPercent)}%`;
    
    const healthFill = document.getElementById('health-fill');
    if (healthPercent > 50) {
        healthFill.style.background = 'linear-gradient(90deg, #2ed573, #7bed9f)';
    } else if (healthPercent > 25) {
        healthFill.style.background = 'linear-gradient(90deg, #ffa502, #ffcc00)';
    } else {
        healthFill.style.background = 'linear-gradient(90deg, #ff4757, #ff6b81)';
    }
}

function setupMobileControls() {
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnShoot = document.getElementById('btn-shoot');
    
    function handleLeftPress(e) {
        e.preventDefault();
        window.keysDown[1] = 1;
        btnLeft.classList.add('active');
    }
    
    function handleLeftRelease(e) {
        e.preventDefault();
        window.keysDown[1] = 0;
        btnLeft.classList.remove('active');
    }
    
    function handleRightPress(e) {
        e.preventDefault();
        window.keysDown[2] = 1;
        btnRight.classList.add('active');
    }
    
    function handleRightRelease(e) {
        e.preventDefault();
        window.keysDown[2] = 0;
        btnRight.classList.remove('active');
    }
    
    function handleShootPress(e) {
        e.preventDefault();
        window.keyAttack = true;
        btnShoot.classList.add('active');
    }
    
    function handleShootRelease(e) {
        e.preventDefault();
        window.keyAttack = false;
        btnShoot.classList.remove('active');
    }
    
    btnLeft.addEventListener('touchstart', handleLeftPress);
    btnLeft.addEventListener('touchend', handleLeftRelease);
    btnLeft.addEventListener('touchcancel', handleLeftRelease);
    btnLeft.addEventListener('mousedown', handleLeftPress);
    btnLeft.addEventListener('mouseup', handleLeftRelease);
    btnLeft.addEventListener('mouseleave', handleLeftRelease);
    
    btnRight.addEventListener('touchstart', handleRightPress);
    btnRight.addEventListener('touchend', handleRightRelease);
    btnRight.addEventListener('touchcancel', handleRightRelease);
    btnRight.addEventListener('mousedown', handleRightPress);
    btnRight.addEventListener('mouseup', handleRightRelease);
    btnRight.addEventListener('mouseleave', handleRightRelease);
    
    btnShoot.addEventListener('touchstart', handleShootPress);
    btnShoot.addEventListener('touchend', handleShootRelease);
    btnShoot.addEventListener('touchcancel', handleShootRelease);
    btnShoot.addEventListener('mousedown', handleShootPress);
    btnShoot.addEventListener('mouseup', handleShootRelease);
    btnShoot.addEventListener('mouseleave', handleShootRelease);
}

function drawGameInfo(mainCtx) {
    mainCtx.clearRect(0, 0, 200, 150);
    
    mainCtx.font = "bold 16px Arial";
    mainCtx.fillStyle = "#00ff00";
    mainCtx.fillText(`分数: ${window.gameState.score}`, 10, 25);
    
    mainCtx.fillStyle = "#ff4444";
    mainCtx.fillText(`生命: ${window.gameState.lives}`, 10, 50);
    
    mainCtx.fillStyle = "#4444ff";
    mainCtx.fillText(`回合: ${window.gameState.round}`, 10, 75);
    
    mainCtx.fillStyle = "#ffff00";
    mainCtx.fillText(`击杀: ${window.gameState.enemiesKilled}/${window.gameState.roundEnemies}`, 10, 100);
    
    mainCtx.fillStyle = "#00ffff";
    mainCtx.fillText(`最高分: ${window.gameState.highScore}`, 10, 125);
    
    document.getElementById('score').textContent = window.gameState.score;
    document.getElementById('lives').textContent = window.gameState.lives;
    document.getElementById('round').textContent = window.gameState.round;
}

function drawWeaponInfo() {
    const weapon = window.weapons[window.currentWeapon];
    
    const infoDiv = document.getElementById('weaponInfo');
    if (!infoDiv) {
        const div = document.createElement('div');
        div.id = 'weaponInfo';
        div.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            color: #fff;
            font-size: 14px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            z-index: 10;
        `;
        document.getElementById('gameContainer').appendChild(div);
    }
    
    document.getElementById('weaponInfo').innerHTML = `
        <div style="color: #00ff00; font-weight: bold;">[${weapon.name}]</div>
        <div>弹药: ${weapon.unlimited ? '∞' : weapon.ammo}</div>
        <div>手雷: ${window.role.grenades}</div>
    `;
}

function drawComboInfo() {
    if (window.role.combo >= 3) {
        const comboDiv = document.getElementById('comboInfo');
        if (!comboDiv) {
            const div = document.createElement('div');
            div.id = 'comboInfo';
            div.style.cssText = `
                position: absolute;
                top: 100px;
                right: 10px;
                color: #ffd700;
                font-size: 24px;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
                z-index: 10;
            `;
            document.getElementById('gameContainer').appendChild(div);
        }
        
        const comboMultiplier = (1 + window.role.combo * window.GameConfig.comboMultiplier).toFixed(1);
        document.getElementById('comboInfo').textContent = `${window.role.combo} COMBO! x${comboMultiplier}`;
    } else {
        const comboDiv = document.getElementById('comboInfo');
        if (comboDiv) comboDiv.remove();
    }
}

function startGame() {
    window.gameState.score = 0;
    window.gameState.lives = 3;
    window.gameState.round = 1;
    window.gameState.gameActive = true;
    window.gameState.paused = false;
    window.gameState.enemiesKilled = 0;
    window.gameState.roundEnemies = 10;
    window.gameState.isBossRound = false;
    window.gameState.boss = null;
    window.gameState.achievements = [];
    
    window.role.x = 100;
    window.role.y = window.GameConfig.canvasHeight - 120;
    window.role.hp = window.role.maxHp;
    window.role.speed = window.role.baseSpeed;
    window.role.damage = window.role.baseDamage;
    window.role.invincible = false;
    window.role.shield = 0;
    window.role.grenades = 3;
    window.role.combo = 0;
    window.role.maxCombo = 0;
    window.role.comboTimer = 0;
    window.role.lastFire = 0;
    
    window.currentWeapon = 'pistol';
    window.weapons.sniper.ammo = 10;
    
    window.enemies.length = 0;
    window.r_bullets.length = 0;
    window.powerups.length = 0;
    window.effects.length = 0;
    window.damageNumbers.length = 0;
    window.particles = [];
    if (!window.grenades) window.grenades = [];
    window.grenades.length = 0;
    
    window.totalKills = 0;
    window.roundDamageTaken = 0;
    
    for (const key in window.achievements) {
        window.achievements[key].unlocked = false;
    }
    
    const oldPowerup = document.getElementById('powerup_canvas');
    if (oldPowerup) oldPowerup.remove();
    const oldEffect = document.getElementById('effect_canvas');
    if (oldEffect) oldEffect.remove();
    const oldWeapon = document.getElementById('weaponInfo');
    if (oldWeapon) oldWeapon.remove();
    const oldCombo = document.getElementById('comboInfo');
    if (oldCombo) oldCombo.remove();
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';
    
    document.getElementById('health-fill').style.width = '100%';
    document.getElementById('health-text').textContent = 'HP: 100%';
    
    initCanvas();
}

function restartGame() {
    startGame();
}

if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function() {
        document.getElementById('startButton').addEventListener('click', startGame);
        document.getElementById('restartButton').addEventListener('click', restartGame);
    });
}