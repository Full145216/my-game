// 游戏逻辑处理

let RrmOrder = 0;

function rolePosition(canvas) {
    if (!window.role) return;
    
    window.role.x += (window.keysDown[2] - window.keysDown[1]) * (window.role.speed / 5);
    window.role.y += (window.keysDown[3] - window.keysDown[0]) * (window.role.speed / 5);
    
    if (window.role.x > canvas.width - window.role.width) window.role.x = canvas.width - window.role.width;
    if (window.role.x < 0) window.role.x = 0;
    if (window.role.y < 0) window.role.y = 0;
    if (window.role.y > canvas.height - window.role.height) window.role.y = canvas.height - window.role.height;
}

function drawRoleShape(ctx, x, y, width, height) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(x + width*0.2, y + height*0.3, width*0.6, height*0.5);
    ctx.fillRect(x, y + height*0.1, width, height*0.2);
    ctx.fillRect(x + width*0.35, y, width*0.3, height*0.15);
    ctx.fillStyle = '#006600';
    ctx.fillRect(x + width*0.15, y + height*0.75, width*0.2, height*0.25);
    ctx.fillRect(x + width*0.65, y + height*0.75, width*0.2, height*0.25);
    
    ctx.fillStyle = '#ff8800';
    const gunLength = 30;
    const dx = window.mouseX - (x + width / 2);
    const dy = window.mouseY - (y + height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const angle = Math.atan2(dy, dx);
    
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(angle);
    ctx.fillRect(0, -3, gunLength, 6);
    ctx.restore();
}

function runRwalk(roleCtx) {
    if (!window.role) return;
    
    if (window.openRwa == true) {
        roleCtx.clearRect(0, 0, roleCtx.canvas.width, roleCtx.canvas.height);
        
        if (window.role.invincible && Math.floor(Date.now() / 100) % 2 == 0) {
            roleCtx.globalAlpha = 0.5;
        }
        if (window.role.shield > 0) {
            roleCtx.shadowColor = '#00ffff';
            roleCtx.shadowBlur = 20;
        }
        
        drawRoleShape(roleCtx, window.role.x, window.role.y, window.role.width, window.role.height);
        
        roleCtx.shadowBlur = 0;
        roleCtx.globalAlpha = 1;
        
        RrmOrder++;
        if (RrmOrder >= 4) RrmOrder = 0;
    }
}

function runRstand(roleCtx) {
    if (!window.role) return;
    
    if (window.openRwa == false) {
        roleCtx.clearRect(0, 0, roleCtx.canvas.width, roleCtx.canvas.height);
        
        if (window.role.invincible && Math.floor(Date.now() / 100) % 2 == 0) {
            roleCtx.globalAlpha = 0.5;
        }
        if (window.role.shield > 0) {
            roleCtx.shadowColor = '#00ffff';
            roleCtx.shadowBlur = 20;
        }
        
        drawRoleShape(roleCtx, window.role.x, window.role.y, window.role.width, window.role.height);
        
        roleCtx.shadowBlur = 0;
        roleCtx.globalAlpha = 1;
    }
}

function drawRHp(mainCtx) {
    if (!window.role) return;
    
    mainCtx.clearRect(50, 500, 50, 150);
    
    const hpRatio = window.role.hp / window.role.maxHp;
    let hpColor;
    if (hpRatio > 0.6) hpColor = '#00ff00';
    else if (hpRatio > 0.3) hpColor = '#ffff00';
    else hpColor = '#ff0000';
    
    mainCtx.fillStyle = '#333';
    mainCtx.fillRect(50, 500, 30, 150);
    mainCtx.fillStyle = hpColor;
    mainCtx.fillRect(50, 650 - hpRatio * 150, 30, hpRatio * 150);
    mainCtx.strokeStyle = "#fff";
    mainCtx.strokeRect(50, 500, 30, 150);
    
    if (window.role.shield > 0) {
        mainCtx.fillStyle = '#333';
        mainCtx.fillRect(85, 500, 20, 150);
        mainCtx.fillStyle = '#00ffff';
        mainCtx.fillRect(85, 650 - (window.role.shield / 100) * 150, 20, (window.role.shield / 100) * 150);
        mainCtx.strokeStyle = "#00ffff";
        mainCtx.strokeRect(85, 500, 20, 150);
    }
}

function getAvailableEnemyTypes() {
    if (!window.enemyTypes) return ['soldier'];
    
    const available = [];
    for (const type in window.enemyTypes) {
        if (window.gameState && window.gameState.round >= window.enemyTypes[type].unlockRound) {
            available.push(type);
        }
    }
    return available;
}

function getRandomEnemyType() {
    const available = getAvailableEnemyTypes().filter(t => !window.enemyTypes[t].isBoss);
    return available[Math.floor(Math.random() * available.length)] || 'soldier';
}

function spawnEnemy() {
    if (!window.gameState || !window.enemyTypes) return;
    if (window.gameState.isBossRound && !window.gameState.boss) return;
    
    const type = getRandomEnemyType();
    const template = window.enemyTypes[type];
    const speedMultiplier = 1 + (window.gameState.round - 1) * window.GameConfig.speedIncrease;
    
    const newEnemy = {
        type: type,
        x: Math.random() * (window.GameConfig.canvasWidth - template.width),
        y: -template.height,
        width: template.width,
        height: template.height,
        speed: template.speed * speedMultiplier,
        hp: template.hp * (1 + (window.gameState.round - 1) * 0.2),
        maxHp: template.hp * (1 + (window.gameState.round - 1) * 0.2),
        score: template.score,
        color: template.color,
        movePattern: Math.random() > 0.5 ? 'straight' : 'zigzag',
        moveOffset: 0,
        moveDirection: 1
    };
    window.enemies.push(newEnemy);
}

function spawnBoss() {
    if (!window.enemyTypes || !window.gameState) return;
    
    const template = window.enemyTypes.boss;
    const hpMultiplier = 1 + (Math.floor(window.gameState.round / 5)) * 0.5;
    
    window.gameState.boss = {
        type: 'boss',
        x: window.GameConfig.canvasWidth / 2 - template.width / 2,
        y: -template.height,
        width: template.width,
        height: template.height,
        speed: template.speed,
        hp: template.hp * hpMultiplier,
        maxHp: template.hp * hpMultiplier,
        score: template.score,
        color: template.color,
        phase: 1,
        attackTimer: 0,
        moveDirection: 1
    };
    
    addEffect(window.gameState.boss.x + template.width / 2, window.gameState.boss.y + template.height / 2, 'bossSpawn');
}

function spawnPowerup(x, y) {
    if (!window.GameConfig) return;
    if (Math.random() > window.GameConfig.powerupSpawnChance) return;
    
    const types = ['health', 'speed', 'damage', 'shield', 'ammo'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    window.powerups.push({
        type: type,
        x: x,
        y: y,
        width: 30,
        height: 30,
        vy: 1
    });
}

function addEffect(x, y, type) {
    if (!window.effects) window.effects = [];
    window.effects.push({
        x: x,
        y: y,
        type: type,
        frame: 0,
        maxFrames: 12
    });
    createExplosionParticles(x, y, type);
}

function createExplosionParticles(x, y, type) {
    if (!window.particles) window.particles = [];
    
    const particleCount = type === 'explosion' ? 25 : 15;
    const colors = type === 'explosion' 
        ? ['#ff4757', '#ff6b81', '#ffa502', '#ffd700', '#ffffff']
        : ['#4a9eff', '#00d2d3', '#54a0ff', '#5f27cd'];
    
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        
        window.particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            size: 3 + Math.random() * 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: type
        });
    }
}

function addDamageNumber(x, y, damage, isCombo = false) {
    if (!window.damageNumbers) window.damageNumbers = [];
    window.damageNumbers.push({
        x: x,
        y: y,
        damage: damage,
        frame: 0,
        maxFrames: 20,
        isCombo: isCombo
    });
}

function updateEnemies() {
    if (!window.enemies) return;
    
    for (let i = window.enemies.length - 1; i >= 0; i--) {
        const enemy = window.enemies[i];
        
        enemy.y += enemy.speed;
        
        if (enemy.movePattern === 'zigzag') {
            enemy.moveOffset += 0.05 * enemy.moveDirection;
            if (Math.abs(enemy.moveOffset) > Math.PI) {
                enemy.moveDirection *= -1;
            }
            enemy.x += Math.sin(enemy.moveOffset) * 2;
        }
        
        if (enemy.x < 0) enemy.x = 0;
        if (enemy.x > window.GameConfig.canvasWidth - enemy.width) {
            enemy.x = window.GameConfig.canvasWidth - enemy.width;
        }
        
        if (enemy.y > window.GameConfig.canvasHeight) {
            window.enemies.splice(i, 1);
            window.roundDamageTaken++;
        }
        
        checkEnemyPlayerCollision(enemy, i);
    }
    
    if (window.gameState && window.gameState.boss) {
        updateBoss();
    }
}

function updateBoss() {
    if (!window.gameState || !window.gameState.boss) return;
    
    const boss = window.gameState.boss;
    
    boss.y += boss.speed;
    
    if (boss.y < 50) {
        boss.y += boss.speed;
    } else {
        boss.x += Math.sin(Date.now() / 1000) * 2;
        
        if (boss.x < 0) boss.x = 0;
        if (boss.x > window.GameConfig.canvasWidth - boss.width) {
            boss.x = window.GameConfig.canvasWidth - boss.width;
        }
        
        boss.attackTimer++;
        if (boss.attackTimer > 60) {
            bossAttack();
            boss.attackTimer = 0;
        }
    }
    
    if (boss.hp <= 0) {
        window.gameState.score += boss.score;
        addEffect(boss.x + boss.width / 2, boss.y + boss.height / 2, 'explosion');
        addEffect(boss.x + boss.width / 2, boss.y + boss.height / 2, 'explosion');
        window.gameState.boss = null;
        window.gameState.isBossRound = false;
        nextRound();
    }
}

function bossAttack() {
    if (!window.gameState || !window.gameState.boss) return;
    
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI / 4) + (Math.random() * Math.PI / 2);
        window.r_bullets.push({
            x: window.gameState.boss.x + window.gameState.boss.width / 2,
            y: window.gameState.boss.y + window.gameState.boss.height,
            width: 15,
            height: 15,
            speed: 5,
            directionX: Math.cos(angle) * 0.5,
            directionY: Math.sin(angle),
            damage: 10,
            isEnemy: true,
            color: '#ff0000',
            trail: []
        });
    }
}

function checkEnemyPlayerCollision(enemy, enemyIndex) {
    if (!window.role) return;
    if (window.role.invincible || window.role.shield > 0) return;
    
    if (
        enemy.x < window.role.x + window.role.width &&
        enemy.x + enemy.width > window.role.x &&
        enemy.y < window.role.y + window.role.height &&
        enemy.y + enemy.height > window.role.y
    ) {
        window.enemies.splice(enemyIndex, 1);
        const damage = enemy.isBoss ? 50 : 30;
        window.role.hp -= damage;
        window.roundDamageTaken++;
        window.role.invincible = true;
        window.role.invincibleTime = Date.now();
        addEffect(window.role.x + window.role.width / 2, window.role.y + window.role.height / 2, 'hit');
        
        if (window.role.hp <= 0) {
            window.role.hp = 0;
            window.gameState.lives--;
            addEffect(window.role.x + window.role.width / 2, window.role.y + window.role.height / 2, 'explosion');
        }
        
        checkAchievements();
    }
}

function updateInvincible() {
    if (!window.role) return;
    
    if (window.role.invincible && Date.now() - window.role.invincibleTime > 1500) {
        window.role.invincible = false;
    }
    
    if (window.role.comboTimer > 0) {
        window.role.comboTimer--;
        if (window.role.comboTimer <= 0) {
            window.role.combo = 0;
        }
    }
}

function updateGrenades() {
    if (!window.grenades) return;
    
    for (let i = window.grenades.length - 1; i >= 0; i--) {
        const grenade = window.grenades[i];
        
        grenade.x += (grenade.targetX - grenade.x) * 0.1;
        grenade.y += (grenade.targetY - grenade.y) * 0.1;
        grenade.timer--;
        
        if (grenade.timer <= 0) {
            explodeGrenade(grenade);
            window.grenades.splice(i, 1);
        }
    }
}

function explodeGrenade(grenade) {
    addEffect(grenade.x, grenade.y, 'explosion');
    
    if (!window.enemies) return;
    
    for (let i = window.enemies.length - 1; i >= 0; i--) {
        const enemy = window.enemies[i];
        const dx = enemy.x + enemy.width / 2 - grenade.x;
        const dy = enemy.y + enemy.height / 2 - grenade.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < grenade.radius) {
            enemy.hp -= grenade.damage;
            if (enemy.hp <= 0) {
                killEnemy(i);
            }
        }
    }
    
    if (window.gameState && window.gameState.boss) {
        const dx = window.gameState.boss.x + window.gameState.boss.width / 2 - grenade.x;
        const dy = window.gameState.boss.y + window.gameState.boss.height / 2 - grenade.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < grenade.radius * 1.5) {
            window.gameState.boss.hp -= grenade.damage * 2;
            addDamageNumber(window.gameState.boss.x + window.gameState.boss.width / 2, window.gameState.boss.y, grenade.damage * 2);
        }
    }
}

window.fireBullet = function(timestamp) {
    if (!window.weapons) {
        console.log('fireBullet: weapons not initialized');
        return;
    }
    if (!window.currentWeapon) {
        console.log('fireBullet: currentWeapon not set');
        return;
    }
    if (!window.role) {
        console.log('fireBullet: role not initialized');
        return;
    }
    
    const weapon = window.weapons[window.currentWeapon];
    if (!weapon) {
        console.log('fireBullet: weapon not found');
        return;
    }
    
    const currentTime = timestamp || Date.now();
    
    if (currentTime - window.role.lastFire < window.role.fireRate) {
        return;
    }
    
    if (!weapon.unlimited && weapon.ammo !== undefined && weapon.ammo <= 0) {
        return;
    }
    
    const startX = window.role.x + window.role.width / 2;
    const startY = window.role.y + window.role.height / 2;
    const dx = window.mouseX - startX;
    const dy = window.mouseY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const directionX = dx / distance;
    const directionY = dy / distance;

    const bulletCount = weapon.bulletCount || 1;
    const spread = weapon.spread || 0;
    
    for (let i = 0; i < bulletCount; i++) {
        const spreadAngle = (i - (bulletCount - 1) / 2) * spread;
        const cos = Math.cos(spreadAngle);
        const sin = Math.sin(spreadAngle);
        
        const bulletX = startX - weapon.bulletSize / 2;
        const bulletY = startY - weapon.bulletSize / 2;
        
        const finalDirX = directionX * cos - directionY * sin;
        const finalDirY = directionX * sin + directionY * cos;
        
        if (!window.r_bullets) window.r_bullets = [];
        
        window.r_bullets.push({
            x: bulletX,
            y: bulletY,
            width: weapon.bulletSize,
            height: weapon.bulletSize,
            speed: weapon.bulletSpeed,
            directionX: finalDirX,
            directionY: finalDirY,
            damage: weapon.damage,
            isEnemy: false,
            color: '#ffff00',
            trail: [{x: bulletX, y: bulletY}]
        });
    }
    
    if (!weapon.unlimited && weapon.ammo !== undefined) {
        weapon.ammo--;
    }
    
    window.role.lastFire = currentTime;
};

function updateBullets(rBulletsCtx, timestamp) {
    if (!window.r_bullets) return;
    
    rBulletsCtx.clearRect(0, 0, rBulletsCtx.canvas.width, rBulletsCtx.canvas.height);

    for (let i = window.r_bullets.length - 1; i >= 0; i--) {
        const bullet = window.r_bullets[i];
        
        if (bullet.trail) {
            bullet.trail.unshift({x: bullet.x, y: bullet.y});
            if (bullet.trail.length > 2) {
                bullet.trail.pop();
            }
            
            for (let j = 0; j < bullet.trail.length; j++) {
                const alpha = (1 - j / bullet.trail.length) * 0.3;
                const size = bullet.width * (1 - j / bullet.trail.length * 0.5);
                rBulletsCtx.fillStyle = bullet.isEnemy ? 
                    `rgba(255, 0, 0, ${alpha})` : 
                    `rgba(255, 255, 255, ${alpha})`;
                rBulletsCtx.beginPath();
                rBulletsCtx.arc(
                    bullet.trail[j].x + bullet.width / 2, 
                    bullet.trail[j].y + bullet.height / 2, 
                    size / 2, 
                    0, 
                    Math.PI * 2
                );
                rBulletsCtx.fill();
            }
        }
        
        bullet.x += bullet.speed * bullet.directionX;
        bullet.y += bullet.speed * bullet.directionY;

        if (bullet.x < 0 || bullet.x > window.GameConfig.canvasWidth || 
            bullet.y < 0 || bullet.y > window.GameConfig.canvasHeight) {
            window.r_bullets.splice(i, 1);
        } else {
            rBulletsCtx.save();
            rBulletsCtx.shadowColor = bullet.isEnemy ? '#ff0000' : '#ffff00';
            rBulletsCtx.shadowBlur = 10;
            
            rBulletsCtx.fillStyle = bullet.color || '#ffff00';
            rBulletsCtx.beginPath();
            rBulletsCtx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2 + 2, 0, Math.PI * 2);
            rBulletsCtx.fill();
            
            rBulletsCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            rBulletsCtx.beginPath();
            rBulletsCtx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 4, 0, Math.PI * 2);
            rBulletsCtx.fill();
            
            rBulletsCtx.restore();

            if (bullet.isEnemy) {
                checkEnemyBulletCollision(bullet, i);
            } else {
                checkBulletEnemyCollision(bullet, i);
            }
        }
    }
}

function checkEnemyBulletCollision(bullet, bulletIndex) {
    if (!window.role) return;
    if (window.role.invincible || window.role.shield > 0) {
        window.r_bullets.splice(bulletIndex, 1);
        return;
    }
    
    if (
        bullet.x < window.role.x + window.role.width &&
        bullet.x + bullet.width > window.role.x &&
        bullet.y < window.role.y + window.role.height &&
        bullet.y + bullet.height > window.role.y
    ) {
        window.r_bullets.splice(bulletIndex, 1);
        window.role.hp -= bullet.damage;
        window.roundDamageTaken++;
        addEffect(bullet.x, bullet.y, 'hit');
        
        if (window.role.hp <= 0) {
            window.role.hp = 0;
            window.gameState.lives--;
            addEffect(window.role.x + window.role.width / 2, window.role.y + window.role.height / 2, 'explosion');
        }
    }
}

function checkBulletEnemyCollision(bullet, bulletIndex) {
    if (!window.enemies) return;
    
    for (let i = window.enemies.length - 1; i >= 0; i--) {
        const enemy = window.enemies[i];
        if (
            bullet.x < enemy.x + enemy.width &&
            bullet.x + bullet.width > enemy.x &&
            bullet.y < enemy.y + enemy.height &&
            bullet.y + bullet.height > enemy.y
        ) {
            window.r_bullets.splice(bulletIndex, 1);
            enemy.hp -= bullet.damage;
            addDamageNumber(enemy.x + enemy.width / 2, enemy.y, bullet.damage);
            
            if (enemy.hp <= 0) {
                killEnemy(i);
            } else {
                addEffect(bullet.x, bullet.y, 'hit');
            }
            break;
        }
    }
    
    if (window.gameState && window.gameState.boss) {
        const boss = window.gameState.boss;
        if (
            bullet.x < boss.x + boss.width &&
            bullet.x + bullet.width > boss.x &&
            bullet.y < boss.y + boss.height &&
            bullet.y + bullet.height > boss.y
        ) {
            window.r_bullets.splice(bulletIndex, 1);
            boss.hp -= bullet.damage;
            addDamageNumber(boss.x + boss.width / 2, boss.y, bullet.damage);
            addEffect(bullet.x, bullet.y, 'hit');
        }
    }
}

function killEnemy(index) {
    if (!window.enemies || !window.role || !window.gameState) return;
    
    const enemy = window.enemies[index];
    window.enemies.splice(index, 1);
    
    window.role.combo++;
    window.role.comboTimer = window.GameConfig.comboTimeWindow;
    
    if (window.role.combo > window.role.maxCombo) {
        window.role.maxCombo = window.role.combo;
    }
    
    const comboBonus = 1 + window.role.combo * window.GameConfig.comboMultiplier;
    const score = Math.floor(enemy.score * comboBonus);
    window.gameState.score += score;
    window.gameState.enemiesKilled++;
    window.totalKills++;
    
    spawnPowerup(enemy.x, enemy.y);
    addEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 'explosion');
    
    checkAchievements();
    checkRoundComplete();
}

function checkRoundComplete() {
    if (!window.gameState) return;
    if (window.gameState.isBossRound) return;
    
    if (window.gameState.enemiesKilled >= window.gameState.roundEnemies) {
        if (window.gameState.round % window.gameState.bossRound === 0) {
            startBossRound();
        } else {
            nextRound();
        }
    }
}

function startBossRound() {
    if (!window.gameState) return;
    
    window.gameState.isBossRound = true;
    showBossWarning();
    setTimeout(() => {
        spawnBoss();
    }, 2000);
}

function showBossWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ff0000;
        font-size: 48px;
        font-weight: bold;
        text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
        z-index: 40;
        pointer-events: none;
        animation: blink 0.5s infinite;
    `;
    warning.textContent = '⚠ BOSS来袭! ⚠';
    warning.innerHTML += `<style>@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }</style>`;
    document.getElementById('gameContainer').appendChild(warning);
    setTimeout(() => warning.remove(), 2000);
}

function nextRound() {
    if (!window.gameState) return;
    
    window.gameState.round++;
    window.gameState.enemiesKilled = 0;
    window.gameState.roundEnemies += window.GameConfig.roundIncrease;
    window.roundDamageTaken = 0;
    
    if (window.gameState.round === 10) {
        unlockAchievement('round_10');
    }
    
    checkAchievements();
}

function updatePowerups() {
    if (!window.powerups) return;
    
    for (let i = window.powerups.length - 1; i >= 0; i--) {
        const powerup = window.powerups[i];
        powerup.y += powerup.vy;
        
        if (powerup.y > window.GameConfig.canvasHeight) {
            window.powerups.splice(i, 1);
            continue;
        }
        
        if (!window.role) continue;
        
        if (
            powerup.x < window.role.x + window.role.width &&
            powerup.x + powerup.width > window.role.x &&
            powerup.y < window.role.y + window.role.height &&
            powerup.y + powerup.height > window.role.y
        ) {
            applyPowerup(powerup);
            window.powerups.splice(i, 1);
        }
    }
}

function applyPowerup(powerup) {
    if (!window.role || !window.weapons) return;
    
    switch (powerup.type) {
        case 'health':
            window.role.hp = Math.min(window.role.hp + 30, window.role.maxHp);
            break;
        case 'speed':
            window.role.speed = window.role.baseSpeed * 1.5;
            setTimeout(() => { window.role.speed = window.role.baseSpeed; }, 8000);
            break;
        case 'damage':
            window.role.damage = window.role.baseDamage * 2;
            setTimeout(() => { window.role.damage = window.role.baseDamage; }, 8000);
            break;
        case 'shield':
            window.role.shield = 100;
            break;
        case 'ammo':
            window.weapons.sniper.ammo = 10;
            break;
    }
    addEffect(powerup.x, powerup.y, 'hit');
}

function updateEffects(effectCtx) {
    if (!window.effects) return;
    
    effectCtx.clearRect(0, 0, effectCtx.canvas.width, effectCtx.canvas.height);
    
    for (let i = window.effects.length - 1; i >= 0; i--) {
        const effect = window.effects[i];
        effect.frame++;
        
        if (effect.frame >= effect.maxFrames) {
            window.effects.splice(i, 1);
            continue;
        }
        
        const alpha = 1 - (effect.frame / effect.maxFrames);
        const size = 15 + effect.frame * 3;
        const pulseSize = Math.sin(effect.frame * 0.5) * 5;
        
        if (effect.type === 'explosion') {
            effectCtx.fillStyle = `rgba(255, 80, 0, ${alpha * 0.9})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, size + pulseSize, 0, Math.PI * 2);
            effectCtx.fill();
            
            effectCtx.fillStyle = `rgba(255, 150, 0, ${alpha * 0.7})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, size * 0.7 + pulseSize * 0.5, 0, Math.PI * 2);
            effectCtx.fill();
            
            effectCtx.fillStyle = `rgba(255, 255, 100, ${alpha * 0.5})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, size * 0.4 + pulseSize * 0.3, 0, Math.PI * 2);
            effectCtx.fill();
            
            effectCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, size * 0.2, 0, Math.PI * 2);
            effectCtx.fill();
        } else if (effect.type === 'hit') {
            const hitSize = 10 + effect.frame * 2;
            effectCtx.fillStyle = `rgba(255, 200, 0, ${alpha})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, hitSize, 0, Math.PI * 2);
            effectCtx.fill();
            
            effectCtx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, hitSize * 0.5, 0, Math.PI * 2);
            effectCtx.fill();
        } else {
            effectCtx.fillStyle = `rgba(100, 150, 255, ${alpha})`;
            effectCtx.beginPath();
            effectCtx.arc(effect.x, effect.y, size, 0, Math.PI * 2);
            effectCtx.fill();
        }
    }
}

function updateParticles(particlesCtx) {
    if (!window.particles) return;
    
    particlesCtx.clearRect(0, 0, particlesCtx.canvas.width, particlesCtx.canvas.height);
    
    for (let i = window.particles.length - 1; i >= 0; i--) {
        const particle = window.particles[i];
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life -= particle.decay;
        
        if (particle.life <= 0) {
            window.particles.splice(i, 1);
            continue;
        }
        
        particlesCtx.save();
        particlesCtx.globalAlpha = particle.life;
        particlesCtx.fillStyle = particle.color;
        particlesCtx.shadowColor = particle.color;
        particlesCtx.shadowBlur = 10;
        
        if (particle.type === 'explosion') {
            particlesCtx.beginPath();
            particlesCtx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            particlesCtx.fill();
        } else {
            particlesCtx.fillRect(
                particle.x - particle.size / 2,
                particle.y - particle.size / 2,
                particle.size,
                particle.size
            );
        }
        
        particlesCtx.restore();
    }
}

function updateDamageNumbers(mainCtx) {
    if (!window.damageNumbers) return;
    
    for (let i = window.damageNumbers.length - 1; i >= 0; i--) {
        const dn = window.damageNumbers[i];
        dn.frame++;
        dn.y -= 1;
        
        if (dn.frame >= dn.maxFrames) {
            window.damageNumbers.splice(i, 1);
            continue;
        }
        
        const alpha = 1 - dn.frame / dn.maxFrames;
        mainCtx.font = `bold ${dn.isCombo ? 24 : 18}px Arial`;
        mainCtx.fillStyle = dn.isCombo ? 
            `rgba(255, 215, 0, ${alpha})` : 
            `rgba(255, 255, 255, ${alpha})`;
        mainCtx.fillText(dn.damage, dn.x, dn.y);
    }
}

function drawEnemyShape(ctx, enemy) {
    ctx.fillStyle = enemy.color;
    
    if (enemy.type === 'soldier') {
        ctx.fillRect(enemy.x + enemy.width*0.2, enemy.y + enemy.height*0.25, enemy.width*0.6, enemy.height*0.5);
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height*0.2);
        ctx.fillRect(enemy.x + enemy.width*0.35, enemy.y - enemy.height*0.1, enemy.width*0.3, enemy.height*0.2);
    } else if (enemy.type === 'tank') {
        ctx.fillRect(enemy.x, enemy.y + enemy.height*0.3, enemy.width, enemy.height*0.7);
        ctx.fillRect(enemy.x + enemy.width*0.3, enemy.y, enemy.width*0.4, enemy.height*0.4);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width*0.15, enemy.y + enemy.height, enemy.width*0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width*0.85, enemy.y + enemy.height, enemy.width*0.1, 0, Math.PI * 2);
        ctx.fill();
    } else if (enemy.type === 'drone') {
        ctx.fillRect(enemy.x, enemy.y + enemy.height*0.3, enemy.width, enemy.height*0.4);
        ctx.fillRect(enemy.x - enemy.width*0.2, enemy.y, enemy.width*0.4, enemy.height*0.2);
        ctx.fillRect(enemy.x + enemy.width*0.8, enemy.y, enemy.width*0.4, enemy.height*0.2);
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width*0.5, enemy.y + enemy.height*0.5, enemy.width*0.2, 0, Math.PI * 2);
        ctx.fill();
    } else if (enemy.type === 'boss') {
        ctx.fillRect(enemy.x, enemy.y + enemy.height*0.2, enemy.width, enemy.height*0.8);
        ctx.fillRect(enemy.x + enemy.width*0.2, enemy.y, enemy.width*0.6, enemy.height*0.3);
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width*0.2, enemy.y + enemy.height*0.5, enemy.width*0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(enemy.x + enemy.width*0.8, enemy.y + enemy.height*0.5, enemy.width*0.15, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawEnemies(enemyCtx) {
    if (!window.enemies) return;
    
    enemyCtx.clearRect(0, 0, enemyCtx.canvas.width, enemyCtx.canvas.height);

    window.enemies.forEach(enemy => {
        drawEnemyShape(enemyCtx, enemy);
        
        if (enemy.hp < enemy.maxHp) {
            const hpWidth = enemy.width * (enemy.hp / enemy.maxHp);
            enemyCtx.fillStyle = '#333';
            enemyCtx.fillRect(enemy.x, enemy.y - 10, enemy.width, 6);
            enemyCtx.fillStyle = '#00ff00';
            enemyCtx.fillRect(enemy.x, enemy.y - 10, hpWidth, 6);
        }
    });
    
    if (window.gameState && window.gameState.boss) {
        const boss = window.gameState.boss;
        drawEnemyShape(enemyCtx, boss);
        
        const hpWidth = boss.width * (boss.hp / boss.maxHp);
        enemyCtx.fillStyle = '#333';
        enemyCtx.fillRect(boss.x, boss.y - 15, boss.width, 10);
        enemyCtx.fillStyle = '#ff0000';
        enemyCtx.fillRect(boss.x, boss.y - 15, hpWidth, 10);
        
        enemyCtx.font = 'bold 14px Arial';
        enemyCtx.fillStyle = '#fff';
        enemyCtx.fillText('BOSS', boss.x + boss.width / 2 - 20, boss.y - 20);
    }
}

function drawPowerupShape(ctx, powerup) {
    let color;
    switch (powerup.type) {
        case 'health': color = '#ff4444'; break;
        case 'speed': color = '#ffff00'; break;
        case 'damage': color = '#ff8800'; break;
        case 'shield': color = '#00ffff'; break;
        case 'ammo': color = '#00ff00'; break;
        default: color = '#ffffff';
    }
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(powerup.x + powerup.width / 2, powerup.y + powerup.height / 2, powerup.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = '#000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    let icon = '?';
    switch (powerup.type) {
        case 'health': icon = '+'; break;
        case 'speed': icon = '⚡'; break;
        case 'damage': icon = '💥'; break;
        case 'shield': icon = '🛡'; break;
        case 'ammo': icon = '∞'; break;
    }
    ctx.fillText(icon, powerup.x + powerup.width / 2, powerup.y + powerup.height / 2 + 4);
}

function drawPowerups(powerupCtx) {
    if (!window.powerups) return;
    
    powerupCtx.clearRect(0, 0, powerupCtx.canvas.width, powerupCtx.canvas.height);
    
    window.powerups.forEach(powerup => {
        drawPowerupShape(powerupCtx, powerup);
    });
}

function drawBackground(backGroundCtx) {
    if (!window.GameConfig) return;
    
    const gradient = backGroundCtx.createLinearGradient(0, 0, 0, window.GameConfig.canvasHeight);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    backGroundCtx.fillStyle = gradient;
    backGroundCtx.fillRect(0, 0, window.GameConfig.canvasWidth, window.GameConfig.canvasHeight);
    
    for (let i = 0; i < 50; i++) {
        const x = (i * 30) % window.GameConfig.canvasWidth;
        backGroundCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        backGroundCtx.beginPath();
        backGroundCtx.arc(x, Math.random() * window.GameConfig.canvasHeight * 0.5, 1, 0, Math.PI * 2);
        backGroundCtx.fill();
    }
    
    backGroundCtx.fillStyle = '#2a2a4a';
    for (let i = 0; i < 8; i++) {
        const x = (i * 120) % (window.GameConfig.canvasWidth + 120) - 60;
        backGroundCtx.fillRect(x, window.GameConfig.canvasHeight - 80, 100, 60);
    }
    
    backGroundCtx.fillStyle = '#1a1a3a';
    for (let i = 0; i < 12; i++) {
        const x = (i * 80) % (window.GameConfig.canvasWidth + 80) - 40;
        backGroundCtx.fillRect(x, window.GameConfig.canvasHeight - 40, 60, 30);
    }
}

function checkAchievements() {
    if (!window.achievements || !window.totalKills || !window.role || !window.gameState) return;
    
    if (window.totalKills >= 1 && !window.achievements.first_blood.unlocked) {
        unlockAchievement('first_blood');
    }
    if (window.role.combo >= 5 && !window.achievements.combo_5.unlocked) {
        unlockAchievement('combo_5');
    }
    if (window.role.combo >= 10 && !window.achievements.combo_10.unlocked) {
        unlockAchievement('combo_10');
    }
    if (window.totalKills >= 50 && !window.achievements.kill_50.unlocked) {
        unlockAchievement('kill_50');
    }
    if (window.totalKills >= 100 && !window.achievements.kill_100.unlocked) {
        unlockAchievement('kill_100');
    }
    if (window.gameState.score >= 1000 && !window.achievements.score_1000.unlocked) {
        unlockAchievement('score_1000');
    }
    if (window.gameState.score >= 5000 && !window.achievements.score_5000.unlocked) {
        unlockAchievement('score_5000');
    }
    if (window.roundDamageTaken === 0 && window.gameState.enemiesKilled >= 5 && !window.achievements.no_damage.unlocked) {
        unlockAchievement('no_damage');
    }
}

function unlockAchievement(id) {
    if (!window.achievements) return;
    if (window.achievements[id].unlocked) return;
    
    window.achievements[id].unlocked = true;
    if (!window.gameState.achievements) window.gameState.achievements = [];
    window.gameState.achievements.push(window.achievements[id]);
    showAchievementPopup(window.achievements[id]);
}

function showAchievementPopup(achievement) {
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #ffd700, #ff8c00);
        padding: 15px 30px;
        border-radius: 10px;
        z-index: 50;
        animation: slideDown 0.5s ease-out;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
    `;
    popup.innerHTML = `
        <div style="color: #000; font-size: 14px;">成就解锁!</div>
        <div style="color: #fff; font-size: 18px; font-weight: bold;">${achievement.name}</div>
        <div style="color: #333; font-size: 12px;">${achievement.desc}</div>
        <style>@keyframes slideDown { from { transform: translateX(-50%) translateY(-100px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }</style>
    `;
    document.getElementById('gameContainer').appendChild(popup);
    setTimeout(() => popup.remove(), 3000);
}

function checkGameOver() {
    if (!window.gameState) return;
    
    if (window.gameState.lives <= 0) {
        window.gameState.gameActive = false;
        
        if (window.gameState.score > window.gameState.highScore) {
            window.gameState.highScore = window.gameState.score;
            localStorage.setItem('shotgod_highscore', window.gameState.highScore);
        }
        
        document.getElementById('gameOver').style.display = 'flex';
        document.getElementById('finalScore').textContent = window.gameState.score;
    }
}