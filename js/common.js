// 游戏资源管理
window.GameImgs = {
    backgrounds: {
        num_1: 'https://picsum.photos/1040/600?random=1',
        num_2: 'https://picsum.photos/1040/600?random=2',
        num_3: 'https://picsum.photos/1040/600?random=3'
    },
    role: {
        stand: 'https://picsum.photos/60/80?random=10',
        walk: {
            num_1: 'https://picsum.photos/60/80?random=11',
            num_2: 'https://picsum.photos/60/80?random=12',
            num_3: 'https://picsum.photos/60/80?random=13',
            num_4: 'https://picsum.photos/60/80?random=14'
        },
        bullets: {
            num_1: 'https://picsum.photos/10/10?random=20'
        }
    },
    enemy: {
        soldier: 'https://picsum.photos/50/70?random=30',
        tank: 'https://picsum.photos/80/60?random=31',
        drone: 'https://picsum.photos/40/40?random=32',
        boss: 'https://picsum.photos/150/180?random=33'
    },
    powerups: {
        health: 'https://picsum.photos/30/30?random=40',
        speed: 'https://picsum.photos/30/30?random=41',
        damage: 'https://picsum.photos/30/30?random=42',
        shield: 'https://picsum.photos/30/30?random=43',
        ammo: 'https://picsum.photos/30/30?random=44'
    },
    effects: {
        explosion: 'https://picsum.photos/50/50?random=50',
        hit: 'https://picsum.photos/30/30?random=51',
        shield: 'https://picsum.photos/40/40?random=52',
        bossSpawn: 'https://picsum.photos/60/60?random=53'
    }
};

// 游戏角色属性
window.role = {
    x: 100,
    y: 480,
    width: 60,
    height: 80,
    hp: 150,
    maxHp: 150,
    speed: 5,
    baseSpeed: 5,
    damage: 10,
    baseDamage: 10,
    fireRate: 200,
    lastFire: 0,
    invincible: false,
    invincibleTime: 0,
    shield: 0,
    grenades: 3,
    maxGrenades: 5,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    scoreMultiplier: 1
};

// 武器类型
window.weapons = {
    pistol: {
        name: '手枪',
        damage: 10,
        fireRate: 200,
        bulletSpeed: 12,
        bulletSize: 10,
        unlimited: true
    },
    rifle: {
        name: '步枪',
        damage: 15,
        fireRate: 100,
        bulletSpeed: 15,
        bulletSize: 8,
        unlimited: true,
        unlockRound: 2
    },
    shotgun: {
        name: '霰弹枪',
        damage: 8,
        fireRate: 400,
        bulletSpeed: 10,
        bulletSize: 12,
        bulletCount: 5,
        spread: 0.3,
        unlimited: true,
        unlockRound: 4
    },
    sniper: {
        name: '狙击枪',
        damage: 50,
        fireRate: 800,
        bulletSpeed: 25,
        bulletSize: 6,
        unlimited: false,
        ammo: 10,
        unlockRound: 6
    }
};

// 当前武器
window.currentWeapon = 'pistol';

// 敌人属性模板
window.enemyTypes = {
    soldier: {
        width: 50,
        height: 70,
        speed: 2,
        hp: 20,
        score: 10,
        image: window.GameImgs.enemy.soldier,
        unlockRound: 1,
        color: '#ff4444'
    },
    tank: {
        width: 80,
        height: 60,
        speed: 1,
        hp: 100,
        score: 50,
        image: window.GameImgs.enemy.tank,
        unlockRound: 5,
        color: '#888888'
    },
    drone: {
        width: 40,
        height: 40,
        speed: 3,
        hp: 15,
        score: 15,
        image: window.GameImgs.enemy.drone,
        unlockRound: 3,
        color: '#ff8800'
    },
    boss: {
        width: 150,
        height: 180,
        speed: 0.5,
        hp: 500,
        score: 200,
        image: window.GameImgs.enemy.boss,
        isBoss: true,
        unlockRound: 5,
        color: '#8800ff'
    }
};

// 游戏状态
window.gameState = {
    score: 0,
    highScore: parseInt(localStorage.getItem('shotgod_highscore')) || 0,
    lives: 3,
    round: 1,
    gameActive: false,
    paused: false,
    enemiesKilled: 0,
    roundEnemies: 10,
    bossRound: 5,
    isBossRound: false,
    boss: null,
    achievements: [],
    difficulty: 'normal'
};

// 游戏配置
window.GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    enemySpawnInterval: 1500,
    powerupSpawnChance: 0.08,
    roundIncrease: 5,
    speedIncrease: 0.15,
    comboTimeWindow: 2000,
    comboMultiplier: 0.1
};

// 子弹数组
window.r_bullets = [];

// 敌人数组
window.enemies = [];

// 道具数组
window.powerups = [];

// 特效数组
window.effects = [];

// 伤害数字数组
window.damageNumbers = [];

// 成就定义
window.achievements = {
    first_blood: { name: '初露锋芒', desc: '击杀第一个敌人', unlocked: false },
    combo_5: { name: '连击达人', desc: '达成5连击', unlocked: false },
    combo_10: { name: '连击大师', desc: '达成10连击', unlocked: false },
    kill_50: { name: '士兵杀手', desc: '累计击杀50敌人', unlocked: false },
    kill_100: { name: '战场收割者', desc: '累计击杀100敌人', unlocked: false },
    score_1000: { name: '千分大师', desc: '单局获得1000分', unlocked: false },
    score_5000: { name: '万分大师', desc: '单局获得5000分', unlocked: false },
    round_10: { name: '坚持不懈', desc: '到达第10回合', unlocked: false },
    no_damage: { name: '完美主义', desc: '一回合内不受到伤害', unlocked: false }
};

window.totalKills = 0;
window.roundDamageTaken = 0;