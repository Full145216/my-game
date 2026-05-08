// 全局变量
window.mouseX = 400;
window.mouseY = 300;
window.keysDown = [0, 0, 0, 0];
window.keyAttack = false;
window.openRwa = false;
const kspeed = 5;
let shootInterval = null;

function focusCanvas() {
    const canvas = document.getElementById('main_canvas');
    if (canvas) {
        canvas.focus();
    }
}

window.addEventListener('DOMContentLoaded', function() {
    focusCanvas();
    
    const canvas = document.getElementById('main_canvas');
    if (canvas) {
        canvas.addEventListener('click', focusCanvas);
    }
});

// 键盘事件监听
window.addEventListener("keydown", function (e) {
    const key = e.key.toLowerCase();
    switch (key) {
        case 'w':
        case 'arrowup':
            window.keysDown[0] = kspeed;
            break;
        case 'a':
        case 'arrowleft':
            window.keysDown[1] = kspeed;
            break;
        case 'd':
        case 'arrowright':
            window.keysDown[2] = kspeed;
            break;
        case 's':
        case 'arrowdown':
            window.keysDown[3] = kspeed;
            break;
        case 'j':
        case ' ':
            e.preventDefault();
            if (!window.keyAttack && window.gameState && window.gameState.gameActive && !window.gameState.paused) {
                window.keyAttack = true;
                if (typeof window.fireBullet === 'function') {
                    window.fireBullet(Date.now());
                }
                shootInterval = setInterval(() => {
                    if (window.gameState && window.gameState.gameActive && !window.gameState.paused && window.keyAttack) {
                        if (typeof window.fireBullet === 'function') {
                            window.fireBullet(Date.now());
                        }
                    } else {
                        clearInterval(shootInterval);
                    }
                }, 100);
            }
            break;
        case 'escape':
        case 'p':
            if (window.gameState && window.gameState.gameActive) {
                togglePause();
            }
            break;
        case 'g':
        case 'e':
            if (window.gameState && window.gameState.gameActive && !window.gameState.paused && window.role && window.role.grenades > 0) {
                throwGrenade();
            }
            break;
        case '1':
            switchWeapon('pistol');
            break;
        case '2':
            switchWeapon('rifle');
            break;
        case '3':
            switchWeapon('shotgun');
            break;
        case '4':
            switchWeapon('sniper');
            break;
        case 'r':
            if (window.gameState && window.gameState.gameActive && !window.gameState.paused) {
                reloadWeapon();
            }
            break;
    }
    if ((window.keysDown[0] || window.keysDown[1] || window.keysDown[2] || window.keysDown[3]) == kspeed) {
        window.openRwa = true;
    }
});

addEventListener("keyup", function (e) {
    const key = e.key.toLowerCase();
    switch (key) {
        case 'w':
        case 'arrowup':
            window.keysDown[0] = 0;
            break;
        case 'a':
        case 'arrowleft':
            window.keysDown[1] = 0;
            break;
        case 'd':
        case 'arrowright':
            window.keysDown[2] = 0;
            break;
        case 's':
        case 'arrowdown':
            window.keysDown[3] = 0;
            break;
        case 'j':
        case ' ':
            window.keyAttack = false;
            if (shootInterval) {
                clearInterval(shootInterval);
                shootInterval = null;
            }
            break;
    }
    if ((window.keysDown[0] == 0 && window.keysDown[1] == 0 && window.keysDown[2] == 0 && window.keysDown[3] == 0) &&
        (key == 'w' || key == 'a' || key == 'd' || key == 's' ||
         key == 'arrowup' || key == 'arrowleft' || key == 'arrowright' || key == 'arrowdown')) {
        window.openRwa = false;
    }
});

function setupMouseEvents(canvas) {
    canvas.setAttribute('tabindex', '0');
    canvas.style.cursor = 'crosshair';
    
    const updateMousePosition = (e) => {
        const rect = canvas.getBoundingClientRect();
        window.mouseX = e.clientX - rect.left;
        window.mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener('mousemove', updateMousePosition);
    canvas.addEventListener('mouseenter', updateMousePosition);

    canvas.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.gameState && window.gameState.gameActive && !window.gameState.paused) {
            const rect = canvas.getBoundingClientRect();
            window.mouseX = e.clientX - rect.left;
            window.mouseY = e.clientY - rect.top;
            if (typeof window.fireBullet === 'function') {
                window.fireBullet(Date.now());
            }
        }
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (window.gameState && window.gameState.gameActive && !window.gameState.paused && window.role && window.role.grenades > 0) {
            throwGrenade();
        }
    });

    canvas.addEventListener('focus', () => {
        canvas.style.outline = 'none';
    });
}

document.addEventListener('mousemove', (e) => {
    const mainCanvas = document.getElementById('main_canvas');
    if (mainCanvas) {
        const rect = mainCanvas.getBoundingClientRect();
        const mouseXInCanvas = e.clientX - rect.left;
        const mouseYInCanvas = e.clientY - rect.top;
        
        if (mouseXInCanvas >= 0 && mouseXInCanvas <= mainCanvas.width &&
            mouseYInCanvas >= 0 && mouseYInCanvas <= mainCanvas.height) {
            window.mouseX = mouseXInCanvas;
            window.mouseY = mouseYInCanvas;
        }
    }
});

document.addEventListener('click', (e) => {
    const mainCanvas = document.getElementById('main_canvas');
    if (mainCanvas && window.gameState && window.gameState.gameActive && !window.gameState.paused) {
        const rect = mainCanvas.getBoundingClientRect();
        const mouseXInCanvas = e.clientX - rect.left;
        const mouseYInCanvas = e.clientY - rect.top;
        
        if (mouseXInCanvas >= 0 && mouseXInCanvas <= mainCanvas.width &&
            mouseYInCanvas >= 0 && mouseYInCanvas <= mainCanvas.height) {
            window.mouseX = mouseXInCanvas;
            window.mouseY = mouseYInCanvas;
            if (typeof window.fireBullet === 'function') {
                window.fireBullet(Date.now());
            }
        }
    }
});

function togglePause() {
    if (!window.gameState) return;
    window.gameState.paused = !window.gameState.paused;
    if (window.gameState.paused) {
        showPauseScreen();
    } else {
        hidePauseScreen();
    }
}

function showPauseScreen() {
    const pauseDiv = document.createElement('div');
    pauseDiv.id = 'pauseScreen';
    pauseDiv.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 50;
    `;
    pauseDiv.innerHTML = `
        <h2 style="color: #fff; font-size: 48px; margin-bottom: 20px;">游戏暂停</h2>
        <p style="color: #ccc; font-size: 18px;">按 ESC 或 P 继续</p>
    `;
    document.getElementById('gameContainer').appendChild(pauseDiv);
}

function hidePauseScreen() {
    const pauseScreen = document.getElementById('pauseScreen');
    if (pauseScreen) {
        pauseScreen.remove();
    }
}

function switchWeapon(weaponName) {
    if (!window.weapons || !window.weapons[weaponName]) return;
    if (!window.gameState || window.gameState.round < window.weapons[weaponName].unlockRound) return;
    
    window.currentWeapon = weaponName;
    if (window.role) {
        window.role.damage = window.weapons[weaponName].damage;
        window.role.fireRate = window.weapons[weaponName].fireRate;
    }
    showWeaponChange(weaponName);
}

function showWeaponChange(weaponName) {
    const weapon = window.weapons[weaponName];
    const hint = document.createElement('div');
    hint.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #00ff00;
        font-size: 24px;
        font-weight: bold;
        text-shadow: 0 0 10px rgba(0, 255, 0, 0.8);
        z-index: 30;
        pointer-events: none;
    `;
    hint.textContent = `[${weapon.name}]`;
    document.getElementById('gameContainer').appendChild(hint);
    setTimeout(() => hint.remove(), 1000);
}

function throwGrenade() {
    if (!window.role || window.role.grenades <= 0) return;
    
    window.role.grenades--;
    
    const grenade = {
        x: window.role.x + window.role.width / 2,
        y: window.role.y + window.role.height / 2,
        targetX: window.mouseX,
        targetY: window.mouseY,
        radius: 100,
        damage: 50,
        timer: 30
    };
    
    if (!window.grenades) window.grenades = [];
    window.grenades.push(grenade);
    if (window.addEffect) {
        window.addEffect(grenade.x, grenade.y, 'explosion');
    }
}

function reloadWeapon() {
    const weapon = window.weapons && window.weapons[window.currentWeapon];
    if (!weapon || weapon.unlimited || weapon.ammo === undefined) return;
    
    weapon.ammo = 10;
    showReloadMessage();
}

function showReloadMessage() {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #ffff00;
        font-size: 18px;
        z-index: 30;
        pointer-events: none;
    `;
    msg.textContent = '已装填!';
    document.getElementById('gameContainer').appendChild(msg);
    setTimeout(() => msg.remove(), 1000);
}