/**
 * Module Moteur de Jeu - GameEngine
 * Gère la boucle de jeu 60 FPS, le rendu du donjon gothique, la caméra,
 * les collisions, le spawner de vagues et l'interface utilisateur.
 */
import { sfx } from './audio.js';
import { UPGRADE_CATALOG } from './config.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Projectile, Gem } from './entities.js';

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // UI Écrans
    this.startScreen = document.getElementById('start-screen');
    this.levelupScreen = document.getElementById('levelup-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.upgradeContainer = document.getElementById('upgrade-cards-container');
    this.equipmentHud = document.getElementById('equipment-hud');

    // UI Stats
    this.timeDisplay = document.getElementById('time-display');
    this.killsDisplay = document.getElementById('kills-display');
    this.gemsDisplay = document.getElementById('gems-display');
    this.hpNumbers = document.getElementById('hp-numbers');
    this.hpBarFill = document.getElementById('hp-bar-fill');
    this.dashBarFill = document.getElementById('dash-bar-fill');
    this.xpBarFill = document.getElementById('xp-bar-fill');
    this.playerLevelSpan = document.getElementById('player-level');
    this.btnSound = document.getElementById('btn-sound');
    this.btnPause = document.getElementById('btn-pause');

    // Boss HUD
    this.bossHud = document.getElementById('boss-hud');
    this.bossBarFill = document.getElementById('boss-bar-fill');
    this.bossName = document.getElementById('boss-name');

    // Stats de fin
    this.endTime = document.getElementById('end-time');
    this.endKills = document.getElementById('end-kills');
    this.endLevel = document.getElementById('end-level');
    this.endGems = document.getElementById('end-gems');
    this.endWave = document.getElementById('end-wave');

    // Éléments HUD de Vagues & Bannière
    this.waveDisplay = document.getElementById('wave-display');
    this.monstersLeftDisplay = document.getElementById('monsters-left-display');
    this.waveBanner = document.getElementById('wave-banner');
    this.waveBannerSub = document.getElementById('wave-banner-sub');
    this.waveBannerTitle = document.getElementById('wave-banner-title');
    this.waveBannerInfo = document.getElementById('wave-banner-info');
    this.bannerTimeout = null;

    // Boutons d'Amélioration en attente & Répit
    this.btnUpgradePending = document.getElementById('btn-upgrade-pending');
    this.pendingUpgradeCount = document.getElementById('pending-upgrade-count');
    this.btnSkipIntermission = document.getElementById('btn-skip-intermission');
    this.skipTimerBadge = document.getElementById('skip-timer-badge');
    this.pendingUpgrades = 0;

    // Dimensions arène agrandie (7000 px) & Caméra très dézoomée (0.45)
    this.worldSize = 7000;
    this.zoom = 0.45; // Dézoom très large pour une vue panoramique stratégique de l'arène
    this.camera = { x: 3500, y: 3500 };
    this.screenShake = 0;

    // 4 Portails Démoniaques Cardinaux
    this.portals = [
      { id: 'north', name: 'PORTAIL NORD', x: 3500, y: 400, angle: Math.PI / 2, active: false, pulse: 0 },
      { id: 'south', name: 'PORTAIL SUD', x: 3500, y: 6600, angle: -Math.PI / 2, active: false, pulse: 0 },
      { id: 'west',  name: 'PORTAIL OUEST', x: 400, y: 3500, angle: 0, active: false, pulse: 0 },
      { id: 'east',  name: 'PORTAIL EST', x: 6600, y: 3500, angle: Math.PI, active: false, pulse: 0 }
    ];

    // Piliers de pierre anciens moussus (Décoration d'ambiance)
    this.pillars = [];
    const pillarPositions = [
      { x: 1800, y: 1800 }, { x: 3500, y: 1800 }, { x: 5200, y: 1800 },
      { x: 1800, y: 3500 },                         { x: 5200, y: 3500 },
      { x: 1800, y: 5200 }, { x: 3500, y: 5200 }, { x: 5200, y: 5200 },
      { x: 2600, y: 2600 }, { x: 4400, y: 2600 },
      { x: 2600, y: 4400 }, { x: 4400, y: 4400 }
    ];
    for (const pos of pillarPositions) {
      this.pillars.push({
        x: pos.x,
        y: pos.y,
        radius: 42,
        seed: Math.abs(Math.sin(pos.x * 2.3 + pos.y * 5.7))
      });
    }

    // Particules de spores vertes ambiantes (Moisissure en lévitation)
    this.ambientSpores = [];
    for (let i = 0; i < 50; i++) {
      this.ambientSpores.push({
        x: Math.random() * this.worldSize,
        y: Math.random() * this.worldSize,
        vx: (Math.random() - 0.5) * 20,
        vy: -15 - Math.random() * 25,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Système de Vagues par Élimination (Option A)
    this.wave = 1;
    this.waveState = 'INTERMISSION';
    this.intermissionTimer = 3.0;
    this.waveQueue = [];
    this.totalWaveEnemies = 0;
    this.portalSpawnTimer = 0;

    // État du jeu
    this.state = 'START';
    this.gameTime = 0;
    this.kills = 0;
    this.totalGemsCollected = 0;
    this.lastTimestamp = 0;

    // Entités
    this.player = null;
    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.activeBoss = null;

    // Clavier & Input
    this.keys = {};
    this.joystickVector = { x: 0, y: 0 };

    this.initWindow();
    this.setupInputs();
    this.setupUIEvents();
    
    // Lancement du cycle de rendu initial
    requestAnimationFrame((t) => this.loop(t));
  }

  initWindow() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  setupInputs() {
    // Clavier
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Dash avec Barre Espace
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (this.player && this.state === 'PLAYING') {
          this.player.triggerDash(this);
        }
      }

      // Pause avec Échap ou P
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.togglePause();
      }

      // Raccourci 'U' pour ouvrir les améliorations disponibles
      if (e.key === 'u' || e.key === 'U') {
        if (this.pendingUpgrades > 0 && this.state === 'PLAYING') {
          this.openUpgradeModal();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });

    // Clic droit optionnel pour Dash
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        e.preventDefault();
        if (this.player && this.state === 'PLAYING') {
          this.player.triggerDash(this);
        }
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (this.state === 'PLAYING') {
        e.preventDefault();
      }
    });

    // Molette souris pour ajuster le zoom en jeu (entre 0.25 et 0.85)
    window.addEventListener('wheel', (e) => {
      if (this.state === 'PLAYING') {
        if (e.deltaY > 0) {
          this.zoom = Math.max(0.25, +(this.zoom - 0.04).toFixed(2));
        } else {
          this.zoom = Math.min(0.85, +(this.zoom + 0.04).toFixed(2));
        }
      }
    }, { passive: true });

    // Joystick Tactile pour support mobile
    const joystick = document.getElementById('virtual-joystick');
    const knob = document.getElementById('joystick-knob');
    if (joystick && knob) {
      let isTouching = false;
      let startX = 0, startY = 0;

      const handleTouch = (touch) => {
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        const dist = Math.hypot(dx, dy);
        const maxDist = 40;
        const clampedDist = Math.min(dist, maxDist);
        const angle = Math.atan2(dy, dx);
        
        const knobX = Math.cos(angle) * clampedDist;
        const knobY = Math.sin(angle) * clampedDist;
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

        this.joystickVector.x = clampedDist > 5 ? knobX / maxDist : 0;
        this.joystickVector.y = clampedDist > 5 ? knobY / maxDist : 0;
      };

      joystick.addEventListener('touchstart', (e) => {
        isTouching = true;
        const rect = joystick.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.top + rect.height / 2;
        handleTouch(e.touches[0]);
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        handleTouch(e.touches[0]);
      }, { passive: false });

      const endTouch = () => {
        isTouching = false;
        knob.style.transform = `translate(0px, 0px)`;
        this.joystickVector.x = 0;
        this.joystickVector.y = 0;
      };

      window.addEventListener('touchend', endTouch);
      window.addEventListener('touchcancel', endTouch);
    }
  }

  setupUIEvents() {
    document.getElementById('btn-start').addEventListener('click', () => {
      sfx.init();
      this.startNewGame();
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
      sfx.init();
      this.startNewGame();
    });

    document.getElementById('btn-resume').addEventListener('click', () => {
      this.togglePause();
    });

    // Bouton Amélioration Disponible
    if (this.btnUpgradePending) {
      this.btnUpgradePending.addEventListener('click', () => {
        if (this.pendingUpgrades > 0 && (this.state === 'PLAYING' || this.state === 'PAUSED')) {
          this.openUpgradeModal();
        }
      });
    }

    // Bouton Passer le Répit (20s)
    if (this.btnSkipIntermission) {
      this.btnSkipIntermission.addEventListener('click', () => {
        if (this.waveState === 'INTERMISSION') {
          this.intermissionTimer = 0;
        }
      });
    }

    this.btnSound.addEventListener('click', () => {
      sfx.init();
      const muted = sfx.toggleMute();
      this.btnSound.textContent = muted ? '🔇' : '🔊';
    });

    this.btnPause.addEventListener('click', () => {
      this.togglePause();
    });
  }

  startNewGame() {
    this.startScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.levelupScreen.classList.remove('active');
    this.bossHud.classList.add('hidden');

    this.gameTime = 0;
    this.kills = 0;
    this.totalGemsCollected = 0;
    this.screenShake = 0;
    this.activeBoss = null;

    this.enemies = [];
    this.projectiles = [];
    this.gems = [];
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];

    // Création Joueur au centre de la vaste arène et centrage caméra
    this.player = new Player(this.worldSize / 2, this.worldSize / 2);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    
    // Débloque l'arme de départ (Baguette magique niveau 1)
    this.player.upgrades['wand'] = 1;
    this.updateEquipmentHud();

    this.state = 'PLAYING';
    this.pendingUpgrades = 0;
    this.updatePendingUpgradeButton();
    if (this.btnSkipIntermission) {
      this.btnSkipIntermission.classList.add('hidden');
    }
    
    // Démarrage de la Vague 1
    this.startWave(1);
    this.updateHUD();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.add('active');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.remove('active');
    }
  }

  // ==========================================
  // MONTÉE DE NIVEAU & AMÉLIORATIONS (À LA DEMANDE)
  // ==========================================
  openUpgradeModal() {
    if (this.pendingUpgrades <= 0) return;
    this.state = 'LEVELUP';
    sfx.playLevelUp();

    const available = UPGRADE_CATALOG.filter(up => {
      const currentLvl = this.player.upgrades[up.id] || 0;
      return currentLvl < up.maxLevel;
    });

    if (available.length === 0) {
      this.player.heal(this.player.maxHp);
      this.pendingUpgrades = Math.max(0, this.pendingUpgrades - 1);
      this.updatePendingUpgradeButton();
      this.state = 'PLAYING';
      return;
    }

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);

    this.upgradeContainer.innerHTML = '';
    choices.forEach(up => {
      const currentLvl = this.player.upgrades[up.id] || 0;
      const isNew = currentLvl === 0;
      const nextLvl = currentLvl + 1;

      const card = document.createElement('div');
      card.className = 'upgrade-card-item';
      card.innerHTML = `
        <span class="card-type-tag">${up.tag} • ${isNew ? 'NOUVEAU' : `NIVEAU ${nextLvl}/${up.maxLevel}`}</span>
        <div class="card-header-row">
          <span class="card-icon">${up.icon}</span>
          <div>
            <div class="card-name">${up.name}</div>
            <div class="card-level-tag">${isNew ? 'DÉBLOCAGE' : `RANG ${nextLvl}`}</div>
          </div>
        </div>
        <p class="card-desc">${up.getDescription(currentLvl)}</p>
      `;

      card.addEventListener('click', () => {
        this.selectUpgrade(up.id);
      });

      this.upgradeContainer.appendChild(card);
    });

    this.levelupScreen.classList.add('active');
  }

  selectUpgrade(upgradeId) {
    this.player.upgrades[upgradeId] = (this.player.upgrades[upgradeId] || 0) + 1;
    this.player.applyUpgrade(upgradeId);
    this.pendingUpgrades = Math.max(0, this.pendingUpgrades - 1);

    this.updateEquipmentHud();
    this.updateHUD();
    this.updatePendingUpgradeButton();

    if (this.pendingUpgrades > 0) {
      // D'autres améliorations en attente
      this.openUpgradeModal();
    } else {
      this.levelupScreen.classList.remove('active');
      this.state = 'PLAYING';
    }
  }

  updatePendingUpgradeButton() {
    if (!this.btnUpgradePending) return;
    if (this.pendingUpgrades > 0) {
      this.btnUpgradePending.classList.remove('hidden');
      if (this.pendingUpgradeCount) {
        this.pendingUpgradeCount.textContent = this.pendingUpgrades;
      }
    } else {
      this.btnUpgradePending.classList.add('hidden');
    }
  }

  updateEquipmentHud() {
    this.equipmentHud.innerHTML = '';
    for (const [id, lvl] of Object.entries(this.player.upgrades)) {
      if (lvl > 0) {
        const item = UPGRADE_CATALOG.find(u => u.id === id);
        if (item) {
          const slot = document.createElement('div');
          slot.className = 'equip-slot';
          slot.title = `${item.name} (Niveau ${lvl})`;
          slot.innerHTML = `
            <span>${item.icon}</span>
            <span class="equip-level">${lvl}</span>
          `;
          this.equipmentHud.appendChild(slot);
        }
      }
    }
  }

  // ==========================================
  // SYSTÈME DE VAGUES PAR ÉLIMINATION & PORTAILS
  // ==========================================
  startWave(waveNum) {
    this.wave = waveNum;
    this.waveState = 'ACTIVE';
    this.portalSpawnTimer = 0;

    const isBossWave = (waveNum % 5 === 0);

    // Déterminer les portails actifs selon la vague
    let activeIds = [];
    if (waveNum === 1) {
      activeIds = ['north'];
    } else if (waveNum === 2) {
      activeIds = ['east', 'west'];
    } else if (waveNum === 3) {
      activeIds = ['north', 'south'];
    } else if (waveNum === 4) {
      activeIds = ['north', 'east', 'west'];
    } else {
      activeIds = ['north', 'south', 'east', 'west'];
    }

    for (const p of this.portals) {
      p.active = activeIds.includes(p.id);
    }

    // Composition de la vague
    let enemyCount = 14 + waveNum * 6;
    if (isBossWave) enemyCount = Math.floor(enemyCount * 0.7);

    this.waveQueue = [];
    for (let i = 0; i < enemyCount; i++) {
      let type = 'bat';
      const r = Math.random();
      if (waveNum >= 4 && r < 0.28) {
        type = 'demon';
      } else if (waveNum >= 3 && r < 0.45) {
        type = 'zombie';
      } else if (waveNum >= 2 && r < 0.6) {
        type = 'skeleton';
      }
      this.waveQueue.push(type);
    }

    this.totalWaveEnemies = this.waveQueue.length + (isBossWave ? 1 : 0);

    // Annonce bannière
    const activePortalNames = this.portals
      .filter(p => p.active)
      .map(p => p.name.replace('PORTAIL ', ''))
      .join(' • ');

    this.showWaveBanner(
      isBossWave ? '⚠️ TITAN ANCESTRAL RÉVEILLÉ' : 'DÉFERLANTE DE MONSTRES',
      `VAGUE ${waveNum}`,
      `Brèches actives : ${activePortalNames}`,
      isBossWave,
      2800
    );

    sfx.playWaveStart(isBossWave);

    // Si vague de boss, le colosse émerge d'un portail actif
    if (isBossWave) {
      const bossPortal = this.portals.find(p => p.id === 'north') || this.portals[0];
      this.spawnColossalBoss(bossPortal.x, bossPortal.y);
    }

    this.updateHUD();
  }

  handleWaveProgression(dt) {
    // Animation du pulse des portails
    for (const p of this.portals) {
      if (p.pulse > 0) p.pulse = Math.max(0, p.pulse - dt * 2);
    }

    // Phase d'intermission entre 2 vagues (20 secondes de répit)
    if (this.waveState === 'INTERMISSION') {
      this.intermissionTimer -= dt;
      if (this.skipTimerBadge) {
        this.skipTimerBadge.textContent = `(${Math.ceil(Math.max(0, this.intermissionTimer))}s)`;
      }

      if (this.intermissionTimer <= 0) {
        if (this.btnSkipIntermission) {
          this.btnSkipIntermission.classList.add('hidden');
        }
        this.startWave(this.wave + 1);
      }
      return;
    }

    // Phase ACTIVE : flux continu de monstres émergeant des portails actifs
    const activePortals = this.portals.filter(p => p.active);
    if (activePortals.length === 0) return;

    this.portalSpawnTimer += dt;
    const spawnCadence = Math.max(0.18, 0.45 - (this.wave - 1) * 0.02);

    if (this.portalSpawnTimer >= spawnCadence && this.waveQueue.length > 0) {
      this.portalSpawnTimer = 0;
      for (const portal of activePortals) {
        if (this.waveQueue.length === 0) break;
        const enemyType = this.waveQueue.shift();
        this.spawnEnemyAtPortal(portal, enemyType);
      }
    }

    // Vérification de la purification de la vague
    if (this.waveQueue.length === 0 && this.enemies.length === 0) {
      this.waveState = 'INTERMISSION';
      this.intermissionTimer = 20.0; // 20 secondes de répit comme demandé !

      for (const p of this.portals) {
        p.active = false;
      }

      sfx.playWaveClear();

      // Pluie de récompense équilibrée (3 gemmes vertes + 1 cœur)
      for (let g = 0; g < 3; g++) {
        const a = (g / 3) * Math.PI * 2;
        this.gems.push(new Gem(this.player.x + Math.cos(a) * 45, this.player.y + Math.sin(a) * 45, 4, 'green'));
      }
      this.gems.push(new Gem(this.player.x, this.player.y, 0, 'heart'));

      if (this.btnSkipIntermission) {
        this.btnSkipIntermission.classList.remove('hidden');
      }

      this.showWaveBanner(
        'ACCALMIE DANS L\'ARÈNE (20s)',
        `VAGUE ${this.wave} PURIFIÉE !`,
        `Prenez le temps d'activer vos améliorations !`,
        false,
        4000
      );
    }
  }

  showWaveBanner(sub, title, info, isBoss = false, duration = 2800) {
    if (!this.waveBanner) return;
    this.waveBannerSub.textContent = sub;
    this.waveBannerTitle.textContent = title;
    this.waveBannerInfo.textContent = info;

    if (isBoss) {
      this.waveBanner.classList.add('boss-banner');
    } else {
      this.waveBanner.classList.remove('boss-banner');
    }

    this.waveBanner.classList.remove('hidden');

    if (this.bannerTimeout) clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      this.waveBanner.classList.add('hidden');
    }, duration);
  }

  spawnEnemyAtPortal(portal, type) {
    const angle = Math.random() * Math.PI * 2;
    const offset = 30 + Math.random() * 40;
    const x = portal.x + Math.cos(angle) * offset;
    const y = portal.y + Math.sin(angle) * offset;

    this.enemies.push(new Enemy(x, y, type, this.gameTime, this.wave));
    portal.pulse = 1.0;

    // Effet visuel d'apparition
    this.createHitParticles(portal.x, portal.y, '#e056fd', 3);
  }

  spawnColossalBoss(x, y) {
    const boss = new Enemy(x, y, 'boss', this.gameTime, this.wave);
    this.enemies.push(boss);
    this.activeBoss = boss;

    this.bossHud.classList.remove('hidden');
    this.bossName.textContent = `MALGOK • SEIGNEUR DU CRIMSON (VAGUE ${this.wave})`;
    this.triggerScreenShake(14);
    this.addShockwave(x, y, 400, '#ff0055', 8);
    this.addFloatingText(this.player.x, this.player.y - 70, "⚠️ TITAN DÉMONIAQUE ENTRAVE L'ARÈNE !", '#ff0055', 26);
  }

  // ==========================================
  // EFFETS VISUELS & FEEDBACK
  // ==========================================
  addFloatingText(x, y, text, color = '#ffffff', size = 16) {
    this.floatingTexts.push({
      x, y,
      text,
      color,
      size,
      alpha: 1,
      vy: -2.0,
      life: 0.75
    });
  }

  createHitParticles(x, y, color = '#ff2a55', count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 5.0;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2.5 + Math.random() * 3.5,
        color,
        alpha: 1,
        life: 0.28 + Math.random() * 0.35
      });
    }
  }

  addShockwave(x, y, maxRadius, color = '#ff2a55', lineWidth = 4) {
    this.shockwaves.push({
      x, y,
      radius: 5,
      maxRadius,
      color,
      lineWidth,
      alpha: 1,
      speed: maxRadius * 3.2
    });
  }

  triggerScreenShake(intensity = 6) {
    this.screenShake = Math.max(this.screenShake, intensity);
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.bossHud.classList.add('hidden');
    sfx.playGameOver();

    const min = Math.floor(this.gameTime / 60);
    const sec = Math.floor(this.gameTime % 60);
    const formatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    this.endTime.textContent = formatted;
    this.endKills.textContent = this.kills;
    this.endLevel.textContent = this.player.level;
    this.endGems.textContent = this.totalGemsCollected;
    if (this.endWave) this.endWave.textContent = this.wave;

    this.gameoverScreen.classList.add('active');
  }

  // ==========================================
  // BOUCLE DE JEU (UPDATE & RENDER)
  // ==========================================
  loop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = timestamp;

    if (this.state === 'PLAYING') {
      this.update(dt);
    }
    
    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.gameTime += dt;

    // 1. Déplacement Clavier (ZQSD / WASD / Flèches)
    let moveX = 0, moveY = 0;
    if (this.keys['z'] || this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['q'] || this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // 2. Joystick tactile
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      moveX = this.joystickVector.x;
      moveY = this.joystickVector.y;
    }

    // Orientation du regard selon la direction de déplacement
    if (moveX !== 0 || moveY !== 0) {
      this.player.facingAngle = Math.atan2(moveY, moveX);
    }

    // Mise à jour Joueur
    this.player.update(dt, moveX, moveY, this.worldSize);

    // Mise à jour des spores vertes ambiantes
    for (const spore of this.ambientSpores) {
      spore.x += spore.vx * dt;
      spore.y += spore.vy * dt;
      spore.phase += dt * 1.5;
      if (spore.y < 0) spore.y = this.worldSize;
      if (spore.x < 0) spore.x = this.worldSize;
      if (spore.x > this.worldSize) spore.x = 0;
    }

    // Caméra lisse centrée sur le joueur (dézoomée)
    this.camera.x += (this.player.x - this.camera.x) * 0.12;
    this.camera.y += (this.player.y - this.camera.y) * 0.12;

    // Screen Shake
    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Gestion des armes & pouvoirs de zone du joueur
    this.player.updateWeapons(dt, this);

    // Gestion de la progression des vagues & apparition par portails
    this.handleWaveProgression(dt);

    // Mise à jour du Boss actif
    if (this.activeBoss) {
      if (this.activeBoss.hp <= 0) {
        this.activeBoss = null;
        this.bossHud.classList.add('hidden');
      } else {
        const bossHpRatio = Math.max(0, this.activeBoss.hp / this.activeBoss.maxHp);
        this.bossBarFill.style.width = `${bossHpRatio * 100}%`;
      }
    }

    // Ennemis
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, this.player, this);

      // Contact avec le joueur
      const distToPlayer = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (distToPlayer < enemy.radius + this.player.radius) {
        if (this.player.invulnTimer <= 0) {
          const dmg = enemy.damage;
          this.player.takeDamage(dmg);
          this.triggerScreenShake(8);
          sfx.playHit();
          this.addFloatingText(this.player.x, this.player.y - 20, `-${dmg}`, '#ff2a55', 22);
          
          if (this.player.hp <= 0) {
            this.gameOver();
            return;
          }
        }
      }

      // Mort de l'ennemi
      if (enemy.hp <= 0) {
        this.kills++;
        this.createHitParticles(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 50 : 12);
        
        if (enemy.type === 'boss') {
          this.triggerScreenShake(16);
          this.addShockwave(enemy.x, enemy.y, 350, '#ff0055', 6);
          this.addFloatingText(enemy.x, enemy.y - 50, "👑 BOSS ÉLIMINÉ !", '#ffd23f', 32);

          for (let g = 0; g < 5; g++) {
            const angle = (g / 5) * Math.PI * 2;
            const distG = 40 + Math.random() * 60;
            this.gems.push(new Gem(enemy.x + Math.cos(angle) * distG, enemy.y + Math.sin(angle) * distG, 12, 'red'));
          }
          this.gems.push(new Gem(enemy.x, enemy.y, 0, 'heart'));
        } else {
          let gemType = 'blue';
          let gemValue = 1;
          if (enemy.type === 'skeleton') {
            gemValue = 2;
          } else if (enemy.type === 'zombie') {
            gemType = 'green';
            gemValue = 3;
          } else if (enemy.type === 'demon') {
            gemType = 'green';
            gemValue = 5;
          }

          this.gems.push(new Gem(enemy.x, enemy.y, gemValue, gemType));

          if (Math.random() < 0.03) {
            this.gems.push(new Gem(enemy.x + 8, enemy.y, 0, 'heart'));
          }
        }

        this.enemies.splice(i, 1);
      }
    }

    // Ondes de choc (Shockwaves)
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += sw.speed * dt;
      sw.alpha = Math.max(0, 1 - (sw.radius / sw.maxRadius));
      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this);

      if (proj.isEnemy) {
        const d = Math.hypot(proj.x - this.player.x, proj.y - this.player.y);
        if (d < proj.radius + this.player.radius && this.player.invulnTimer <= 0) {
          this.player.takeDamage(proj.damage);
          this.triggerScreenShake(7);
          sfx.playHit();
          this.addFloatingText(this.player.x, this.player.y - 20, `-${proj.damage}`, '#ff0055', 20);
          proj.dead = true;
          if (this.player.hp <= 0) {
            this.gameOver();
            return;
          }
        }
      } else {
        for (const enemy of this.enemies) {
          if (proj.hitList.has(enemy)) continue;

          const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
          if (dist < proj.radius + enemy.radius) {
            enemy.hp -= proj.damage;
            enemy.hitFlash = 0.1;
            
            const angle = Math.atan2(enemy.y - proj.y, enemy.x - proj.x);
            enemy.x += Math.cos(angle) * proj.knockback;
            enemy.y += Math.sin(angle) * proj.knockback;

            this.addFloatingText(enemy.x, enemy.y - 12, Math.round(proj.damage), '#ffffff', 14);
            this.createHitParticles(proj.x, proj.y, '#00f0ff', 3);
            sfx.playHit();

            proj.hitList.add(enemy);
            proj.pierce--;
            if (proj.pierce <= 0) {
              proj.dead = true;
              break;
            }
          }
        }
      }

      if (proj.isExpired() || proj.dead) {
        this.projectiles.splice(i, 1);
      }
    }

    // Gemmes
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const gem = this.gems[i];
      gem.update(dt, this.player);

      const dist = Math.hypot(gem.x - this.player.x, gem.y - this.player.y);
      if (dist < this.player.radius + gem.radius) {
        if (gem.type === 'heart') {
          this.player.heal(35);
          this.addFloatingText(this.player.x, this.player.y - 25, '+35 PV', '#00ff88', 18);
        } else {
          this.totalGemsCollected++;
          const leveledUp = this.player.addXp(gem.value);
          sfx.playGem();
          if (leveledUp) {
            this.pendingUpgrades++;
            sfx.playLevelUp();
            this.addFloatingText(this.player.x, this.player.y - 40, `⭐ NIVEAU ${this.player.level} !`, '#ffd700', 26);
            this.updatePendingUpgradeButton();
          }
        }
        this.gems.splice(i, 1);
      }
    }

    // Particules
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / 0.45);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Textes Flottants
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.75);
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    this.updateHUD();
  }

  updateHUD() {
    const min = Math.floor(this.gameTime / 60);
    const sec = Math.floor(this.gameTime % 60);
    this.timeDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    this.killsDisplay.textContent = this.kills;
    this.gemsDisplay.textContent = this.totalGemsCollected;

    // Vagues & Ennemis restants
    if (this.waveDisplay) {
      this.waveDisplay.textContent = `VAGUE ${this.wave}`;
    }
    if (this.monstersLeftDisplay) {
      if (this.waveState === 'INTERMISSION') {
        this.monstersLeftDisplay.textContent = `RÉPIT (${Math.ceil(this.intermissionTimer)}s)`;
      } else {
        const remaining = this.waveQueue.length + this.enemies.length;
        this.monstersLeftDisplay.textContent = `${remaining} restants`;
      }
    }

    // HP
    const hpRatio = Math.max(0, this.player.hp / this.player.maxHp);
    this.hpBarFill.style.width = `${hpRatio * 100}%`;
    this.hpNumbers.textContent = `${Math.ceil(this.player.hp)} / ${this.player.maxHp}`;

    // Dash Bar
    if (this.dashBarFill) {
      const dashRatio = Math.max(0, Math.min(1, 1 - (this.player.dashTimer / this.player.dashCooldown)));
      this.dashBarFill.style.width = `${dashRatio * 100}%`;
      this.dashBarFill.style.background = dashRatio >= 1 
        ? 'linear-gradient(90deg, #00f0ff, #70e000)' 
        : 'linear-gradient(90deg, #0077b6, #00b4d8)';
    }

    // XP
    const xpRatio = Math.min(1, this.player.xp / this.player.xpToNext);
    this.xpBarFill.style.width = `${xpRatio * 100}%`;
    this.playerLevelSpan.textContent = this.player.level;
  }

  // ==========================================
  // RENDU VISUEL AMÉLIORÉ
  // ==========================================
  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    let shakeX = 0, shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake * 2;
      shakeY = (Math.random() - 0.5) * this.screenShake * 2;
    }

    this.ctx.save();
    this.ctx.translate(this.width / 2 + shakeX, this.height / 2 + shakeY);
    this.ctx.scale(this.zoom, this.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Dalles de donjon gothique & runes anciennes avec moisissure verte
    this.renderDungeonFloor();

    // 1.2. Piliers de pierre moussus & végétation sombre
    this.renderPillarsAndMossDecor();

    // 1.5. Portails Démoniaques de chaque côté
    this.renderPortals();

    // 1.8. Spores vertes flottantes d'ambiance
    this.renderAmbientSpores();

    // 2. Ondes de choc (Shockwaves)
    for (const sw of this.shockwaves) {
      this.ctx.save();
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = sw.lineWidth;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 3. Aura du joueur (Vortex de Sang)
    if (this.player && this.player.upgrades['aura'] > 0) {
      this.renderPlayerAura();
    }

    // 4. Gemmes au sol (Rendu cristal brillant)
    for (const gem of this.gems) {
      gem.draw(this.ctx);
    }

    // 5. Ennemis & Colosses
    for (const enemy of this.enemies) {
      enemy.draw(this.ctx);
    }

    // 6. Projectiles
    for (const proj of this.projectiles) {
      proj.draw(this.ctx);
    }

    // 7. Joueur & ses orbes tournoyants
    if (this.player) {
      this.player.draw(this.ctx);
    }

    // 8. Particules
    for (const p of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 9. Textes flottants (dégâts, critiques, alertes)
    for (const ft of this.floatingTexts) {
      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.font = `bold ${ft.size}px 'Rajdhani', sans-serif`;
      this.ctx.fillStyle = ft.color;
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = 'rgba(0,0,0,0.9)';
      this.ctx.shadowBlur = 5;
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    }

    // 10. Éclairage d'ambiance (Vignette & Lanterne arcanique autour du joueur)
    if (this.player) {
      this.renderDynamicLighting();
    }

    this.ctx.restore();
  }

  renderDungeonFloor() {
    const tileSize = 130;
    const viewW = this.width / this.zoom;
    const viewH = this.height / this.zoom;
    const startX = Math.max(0, Math.floor((this.camera.x - viewW / 2) / tileSize) * tileSize - tileSize);
    const endX = Math.min(this.worldSize, this.camera.x + viewW / 2 + tileSize * 2);
    const startY = Math.max(0, Math.floor((this.camera.y - viewH / 2) / tileSize) * tileSize - tileSize);
    const endY = Math.min(this.worldSize, this.camera.y + viewH / 2 + tileSize * 2);

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        const tileHash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const mossHash = Math.abs(Math.sin(x * 37.112 + y * 19.823) * 29421.631) % 1;
        const detailHash = Math.abs(Math.sin(x * 91.12 + y * 43.87) * 85321.12) % 1;

        // 1. Sol en dalles de pierre médiévale BIEN ÉCLAIRÉ & VIF
        this.ctx.fillStyle = tileHash > 0.5 ? '#1c2438' : '#222d46';
        this.ctx.fillRect(x, y, tileSize, tileSize);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, tileSize, tileSize);

        // 2. DÉCORATION DE MOISISSURE, MOUSSE ET LICHEN VERT SUR LE SOL
        if (mossHash > 0.48) {
          // Tache de mousse vert émeraude / jade vibrante
          const mx = x + 20 + detailHash * 60;
          const my = y + 20 + tileHash * 60;
          const mr = 20 + mossHash * 28;

          this.ctx.fillStyle = mossHash > 0.75 ? 'rgba(45, 106, 79, 0.65)' : 'rgba(27, 67, 50, 0.50)';
          this.ctx.beginPath();
          this.ctx.arc(mx, my, mr, 0, Math.PI * 2);
          this.ctx.fill();

          // Cœur de moisissure vert clair vif
          this.ctx.fillStyle = 'rgba(82, 183, 136, 0.85)';
          this.ctx.beginPath();
          this.ctx.arc(mx + 3, my - 2, mr * 0.5, 0, Math.PI * 2);
          this.ctx.fill();

          // Champignon ou spore luminescente fluorescente
          if (mossHash > 0.80) {
            this.ctx.fillStyle = '#95d5b2';
            this.ctx.beginPath();
            this.ctx.arc(mx - 4, my + 5, 4.5, 0, Math.PI * 2);
            this.ctx.fill();

            // Halo fluorescent
            this.ctx.fillStyle = 'rgba(116, 198, 157, 0.35)';
            this.ctx.beginPath();
            this.ctx.arc(mx - 4, my + 5, 16, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        // 3. Fissures rocheuses avec moisissure infiltrée
        if (tileHash > 0.85) {
          this.ctx.strokeStyle = 'rgba(45, 106, 79, 0.35)';
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 12, y + 18);
          this.ctx.lineTo(x + tileSize * 0.5, y + tileSize * 0.6);
          this.ctx.lineTo(x + tileSize - 16, y + tileSize * 0.4);
          this.ctx.stroke();
        }

        // 4. Petits cercles runiques anciens incrustés
        if (tileHash < 0.10) {
          this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.08)';
          this.ctx.beginPath();
          this.ctx.arc(x + tileSize / 2, y + tileSize / 2, 22, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      }
    }

    // 5. Runes Majeures de l'Arène (adaptées à 7000 px)
    const runeCenters = [
      { x: this.worldSize / 2, y: this.worldSize / 2 },
      { x: 2000, y: 2000 }, { x: 5000, y: 2000 },
      { x: 2000, y: 5000 }, { x: 5000, y: 5000 }
    ];

    for (const rc of runeCenters) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.16)';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.arc(rc.x, rc.y, 160, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(rc.x, rc.y, 100, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const rx = rc.x + Math.cos(a) * 100;
        const ry = rc.y + Math.sin(a) * 100;
        if (i === 0) this.ctx.moveTo(rx, ry);
        else this.ctx.lineTo(rx, ry);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Bordure extérieure de l'immense arène
    this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.85)';
    this.ctx.lineWidth = 10;
    this.ctx.shadowColor = '#ff2a55';
    this.ctx.shadowBlur = 24;
    this.ctx.strokeRect(0, 0, this.worldSize, this.worldSize);
    this.ctx.shadowBlur = 0;
  }

  // ==========================================
  // RENDU DES PILIERS & DÉCOR DE MOUSSE / MOISISSURE
  // ==========================================
  renderPillarsAndMossDecor() {
    for (const pillar of this.pillars) {
      this.ctx.save();
      this.ctx.translate(pillar.x, pillar.y);

      // Ombre du pilier
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.ctx.beginPath();
      this.ctx.ellipse(10, 18, pillar.radius * 1.1, pillar.radius * 0.6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Base du pilier en pierre sculptée
      this.ctx.fillStyle = '#111522';
      this.ctx.strokeStyle = '#232a3d';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, pillar.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Anneau intérieur de pierre usée
      this.ctx.fillStyle = '#181f33';
      this.ctx.beginPath();
      this.ctx.arc(0, -6, pillar.radius * 0.75, 0, Math.PI * 2);
      this.ctx.fill();

      // MOUSSE & MOISISSURE VERTE ENROULÉE SUR LE PILIER
      this.ctx.fillStyle = 'rgba(45, 106, 79, 0.8)';
      this.ctx.beginPath();
      this.ctx.arc(-pillar.radius * 0.35, -pillar.radius * 0.3, 16, 0, Math.PI * 2);
      this.ctx.arc(-pillar.radius * 0.5, 4, 14, 0, Math.PI * 2);
      this.ctx.fill();

      // Feuilles / lichen vert vif
      this.ctx.fillStyle = 'rgba(82, 183, 136, 0.9)';
      this.ctx.beginPath();
      this.ctx.arc(-pillar.radius * 0.35 + 2, -pillar.radius * 0.3 - 2, 7, 0, Math.PI * 2);
      this.ctx.arc(-pillar.radius * 0.5 + 3, 2, 6, 0, Math.PI * 2);
      this.ctx.fill();

      // Fissure de pierre
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(0, -pillar.radius * 0.5);
      this.ctx.lineTo(8, 0);
      this.ctx.lineTo(2, pillar.radius * 0.4);
      this.ctx.stroke();

      this.ctx.restore();
    }
  }

  // ==========================================
  // SPORES VERTES FLOTTANTES DANS L'AIR
  // ==========================================
  renderAmbientSpores() {
    this.ctx.save();
    for (const spore of this.ambientSpores) {
      const alphaPulse = Math.sin(spore.phase) * 0.15 + spore.alpha;
      this.ctx.globalAlpha = Math.max(0.1, alphaPulse);

      this.ctx.fillStyle = '#52b788';
      this.ctx.beginPath();
      this.ctx.arc(spore.x, spore.y, spore.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Halo brillant
      this.ctx.fillStyle = 'rgba(116, 198, 157, 0.25)';
      this.ctx.beginPath();
      this.ctx.arc(spore.x, spore.y, spore.radius * 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // ==========================================
  // RENDU DES 4 PORTAILS DÉMONIAQUES
  // ==========================================
  renderPortals() {
    const time = this.gameTime;

    for (const portal of this.portals) {
      this.ctx.save();
      this.ctx.translate(portal.x, portal.y);

      const isActive = portal.active;
      const swirlSpeed = isActive ? 4.5 : 1.2;
      const glowColor = isActive ? '#ff0055' : '#8a2be2';
      const portalRadius = isActive ? 75 : 60;
      const pulseEffect = Math.sin(time * swirlSpeed) * 6 + (portal.pulse * 20);

      // 1. Pilier gauche et droit (Monolithes d'obsidienne)
      this.ctx.fillStyle = '#140c1e';
      this.ctx.strokeStyle = isActive ? 'rgba(255, 0, 85, 0.6)' : 'rgba(138, 43, 226, 0.4)';
      this.ctx.lineWidth = 3;

      // Piliers orientés selon l'angle
      const pOffsetX = Math.cos(portal.angle + Math.PI / 2) * 85;
      const pOffsetY = Math.sin(portal.angle + Math.PI / 2) * 85;

      // Colonne 1
      this.ctx.beginPath();
      this.ctx.arc(pOffsetX, pOffsetY, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Colonne 2
      this.ctx.beginPath();
      this.ctx.arc(-pOffsetX, -pOffsetY, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // 2. Halo d'énergie mystique
      this.ctx.fillStyle = isActive ? 'rgba(255, 0, 85, 0.18)' : 'rgba(138, 43, 226, 0.10)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, portalRadius + 30 + pulseEffect, 0, Math.PI * 2);
      this.ctx.fill();

      // 3. Tourbillon dimensionnel central
      const grad = this.ctx.createRadialGradient(0, 0, 10, 0, 0, portalRadius + pulseEffect);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, isActive ? '#ff2a55' : '#a855f7');
      grad.addColorStop(0.8, isActive ? '#67001f' : '#3b0764');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, portalRadius + pulseEffect, 0, Math.PI * 2);
      this.ctx.fill();

      // 4. Anneaux runiques tournoyants
      this.ctx.save();
      this.ctx.rotate(time * swirlSpeed * (isActive ? 1.5 : 0.8));
      this.ctx.strokeStyle = isActive ? '#ff6b8b' : '#c084fc';
      this.ctx.lineWidth = isActive ? 3 : 2;
      this.ctx.setLineDash([14, 10]);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, portalRadius * 0.8, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.rotate(-time * swirlSpeed * 2.2);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, portalRadius * 0.5, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      // 5. Texte d'identification au-dessus du portail
      this.ctx.font = "bold 15px 'Rajdhani', sans-serif";
      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = isActive ? '#ff6b8b' : '#a0aec0';
      this.ctx.fillText(portal.name, 0, -90);

      this.ctx.font = "600 12px 'Rajdhani', sans-serif";
      this.ctx.fillStyle = isActive ? '#ff0055' : '#64748b';
      this.ctx.fillText(isActive ? '⚡ BRÈCHE ACTIVE' : '💤 EN SOMMEIL', 0, -74);

      this.ctx.restore();
    }
  }

  renderDynamicLighting() {
    // Lumière d'ambiance claire et nette sans obscurcir la salle
    this.ctx.save();
    const light = this.ctx.createRadialGradient(
      this.player.x, this.player.y, 250,
      this.player.x, this.player.y, 2500
    );
    light.addColorStop(0, 'rgba(0, 240, 255, 0.03)');
    light.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
    light.addColorStop(1, 'rgba(0, 0, 0, 0.12)'); // Très léger dégradé uniquement aux confins absolus

    this.ctx.fillStyle = light;
    const viewW = this.width / this.zoom;
    const viewH = this.height / this.zoom;
    this.ctx.fillRect(
      this.camera.x - viewW / 2 - 200,
      this.camera.y - viewH / 2 - 200,
      viewW + 400,
      viewH + 400
    );
    this.ctx.restore();
  }

  renderPlayerAura() {
    const lvl = this.player.upgrades['aura'];
    const radius = 90 + lvl * 24;

    const pulse = Math.sin(this.gameTime * 10) * 6;
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, this.player.y, radius + pulse, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 42, 85, 0.12)';
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.6)';
    this.ctx.lineWidth = 2.5;
    this.ctx.setLineDash([10, 8]);
    this.ctx.stroke();
    this.ctx.restore();
  }
}
