/**
 * Module Moteur de Jeu - GameEngine
 * Gère la boucle de jeu 60 FPS, le rendu du donjon gothique, la caméra,
 * les collisions, le spawner de vagues et l'interface utilisateur.
 */
import { sfx } from './audio.js';
import { UPGRADE_CATALOG, GRIMOIRES_CATALOG } from './config.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Projectile, Gem } from './entities.js';
import { CHARACTERS, spriteLoader } from './sprites.js';
import { WorldMap } from './world.js';
import { ControlsManager } from './controls.js';

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Sélection du personnage actif
    this.selectedCharacterId = 'warrior';
    spriteLoader.preloadAll();
    
    // UI Écrans
    this.startScreen = document.getElementById('start-screen');
    this.levelupScreen = document.getElementById('levelup-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.gameoverScreen = document.getElementById('gameover-screen');
    this.libraryScreen = document.getElementById('library-screen');
    this.grimoiresGrid = document.getElementById('grimoires-grid');
    this.libraryGoldAmount = document.getElementById('library-gold-amount');
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
    this.btnLibrary = document.getElementById('btn-library');
    this.btnCloseLibrary = document.getElementById('btn-close-library');

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

    // Dimensions arène agrandie (7000 px) & Caméra zoomée de près (0.85)
    this.worldSize = 7000;
    this.zoom = 0.85; // Caméra plus rapprochée pour mettre en valeur les personnages et décors
    this.camera = { x: 3500, y: 3500 };
    this.screenShake = 0;

    // Grande Carte du Monde Ouvert (3 Villages, Rivière sinueuse, Ponts, Forêts denses, Falaises)
    this.worldMap = new WorldMap(this.worldSize);

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

    // Gestionnaire des Contrôles & Périphériques (Clavier, Souris LoL, Manette, Tactile, Réglages)
    this.controls = new ControlsManager(this);

    this.initWindow();
    this.setupInputs();
    this.setupUIEvents();
    this.setupCharacterSelectionUI();
    
    // Lancement du cycle de rendu initial
    requestAnimationFrame((t) => this.loop(t));
  }
  
  get keys() {
    return this.controls ? this.controls.keys : {};
  }

  setupCharacterSelectionUI() {
    const grid = document.getElementById('char-selection-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const charList = Object.values(CHARACTERS);

    charList.forEach((char) => {
      const isSelected = char.id === this.selectedCharacterId;
      const card = document.createElement('div');
      card.className = `char-card ${isSelected ? 'active' : ''}`;
      card.dataset.charId = char.id;

      card.innerHTML = `
        <div class="char-avatar-box">
          <canvas class="char-preview-canvas" width="32" height="32" id="preview-${char.id}"></canvas>
        </div>
        <div class="char-info">
          <div class="char-name-row">
            <span class="char-icon">${char.icon}</span>
            <span class="char-name">${char.name}</span>
          </div>
          <div class="char-title">${char.title}</div>
          <div class="char-bonus">${char.desc}</div>
          <div class="char-loadout">
            <span class="weapon-tag">⚔️ ${char.mainName || 'Arme'}</span>
            <span class="skill-tag">✨ ${char.specialName || 'Compétence'}</span>
          </div>
        </div>
        <div class="char-check-badge">✓</div>
      `;

      card.addEventListener('click', () => {
        this.selectedCharacterId = char.id;
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        sfx.playPickup();
      });

      grid.appendChild(card);
    });

    this.startCharacterPreviewAnimation();
  }

  startCharacterPreviewAnimation() {
    let animFrame = 0;
    const animatePreviews = () => {
      animFrame++;
      const walkFrame = Math.floor(animFrame / 11) % 4;

      for (const char of Object.values(CHARACTERS)) {
        const canvas = document.getElementById(`preview-${char.id}`);
        if (!canvas) continue;
        const ctx = canvas.getContext('2d');
        const img = spriteLoader.getImage(char.sprite);

        if (img && img.complete && img.naturalWidth > 0) {
          ctx.clearRect(0, 0, 32, 32);
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, walkFrame * 32, 0, 32, 32, 0, 0, 32, 32);
        }
      }

      if (this.startScreen && this.startScreen.classList.contains('active')) {
        requestAnimationFrame(animatePreviews);
      }
    };

    requestAnimationFrame(animatePreviews);
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
    // Zoom fixe verrouillé : la molette ne modifie plus le zoom de la carte
    window.addEventListener('wheel', (e) => {
      e.preventDefault();
    }, { passive: false });
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

    if (this.btnLibrary) {
      this.btnLibrary.addEventListener('click', () => {
        this.toggleLibrary();
      });
    }

    if (this.btnCloseLibrary) {
      this.btnCloseLibrary.addEventListener('click', () => {
        this.closeLibrary();
      });
    }
  }

  startNewGame() {
    this.startScreen.classList.remove('active');
    this.gameoverScreen.classList.remove('active');
    this.pauseScreen.classList.remove('active');
    this.levelupScreen.classList.remove('active');
    if (this.libraryScreen) this.libraryScreen.classList.remove('active');
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

    // Création Joueur sur la place de la Cité d'Oakhaven (Safe Zone de départ)
    this.player = new Player(3160, 3540, this.selectedCharacterId);
    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    if (this.controls) {
      this.controls.resetMovement();
    }
    
    // Configuration de la barre d'action selon le héros choisi
    this.setupActionBar();

    this.state = 'PLAYING';
    this.pendingUpgrades = 0;
    this.updatePendingUpgradeButton();
    if (this.btnSkipIntermission) {
      this.btnSkipIntermission.classList.add('hidden');
    }
    
    // Peuplement du monde ouvert (camps de monstres et forêts)
    this.populateWorldCamps();
    this.showWaveBanner(
      "ROYAUME D'INVAZION",
      "BIENVENUE À OAKHAVEN",
      "Explorez les forêts, trouvez les coffres et défiez les 3 donjons !",
      false,
      5000
    );
    this.updateHUD();
  }

  togglePause() {
    if (this.state === 'LIBRARY') {
      this.closeLibrary();
      return;
    }
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.pauseScreen.classList.add('active');
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.pauseScreen.classList.remove('active');
    }
  }

  // ==========================================
  // GESTION DE LA BIBLIOTHÈQUE DES ARCANES & GRIMOIRES
  // ==========================================
  openLibrary() {
    if (this.state !== 'PLAYING' && this.state !== 'PAUSED') return;
    this.state = 'LIBRARY';
    sfx.playBook();
    if (this.libraryScreen) {
      this.libraryScreen.classList.add('active');
    }
    this.renderGrimoiresGrid();
  }

  closeLibrary() {
    if (this.state === 'LIBRARY') {
      this.state = 'PLAYING';
      if (this.libraryScreen) {
        this.libraryScreen.classList.remove('active');
      }
    }
  }

  toggleLibrary() {
    if (this.state === 'LIBRARY') {
      this.closeLibrary();
    } else if (this.state === 'PLAYING') {
      this.openLibrary();
    }
  }

  renderGrimoiresGrid() {
    if (!this.grimoiresGrid) return;
    this.grimoiresGrid.innerHTML = '';

    const p = this.player;
    const currentGold = p ? (p.gold || 0) : 0;
    if (this.libraryGoldAmount) {
      this.libraryGoldAmount.textContent = currentGold;
    }

    const isMage = p && p.characterId === 'mage';

    Object.values(GRIMOIRES_CATALOG).forEach(g => {
      const card = document.createElement('div');
      card.className = 'grimoire-card';

      const isUnlocked = p && p.unlockedGrimoires && p.unlockedGrimoires.includes(g.id);
      const isEquipped = p && p.equippedGrimoire === g.id;

      if (isEquipped) {
        card.classList.add('active-book');
      }

      card.innerHTML = `
        <div class="grimoire-top">
          <span class="grimoire-icon" style="color: ${g.color};">${g.icon}</span>
          <span class="grimoire-badge ${g.price > 0 ? 'gold' : ''}">${isUnlocked ? '✓ Acquis' : (g.price > 0 ? `${g.price} 🪙` : 'Gratuit')}</span>
        </div>
        <h3 class="grimoire-name" style="color: ${g.color};">${g.name}</h3>
        <p class="grimoire-lore">${g.desc}</p>
        <div class="grimoire-skills-preview">
          <div class="grimoire-skill-row">
            <span class="grimoire-skill-title">⚔️ ${g.mainName}</span>
            <span class="grimoire-skill-desc">${g.mainDesc}</span>
          </div>
          <div class="grimoire-skill-row">
            <span class="grimoire-skill-title">⚡ ${g.specialName} (${g.specialCd}s)</span>
            <span class="grimoire-skill-desc">${g.specialDesc}</span>
          </div>
        </div>
      `;

      const btnContainer = document.createElement('div');
      btnContainer.style.marginTop = 'auto';

      if (!isMage) {
        btnContainer.innerHTML = `<div class="badge-equipped" style="color: #94a3b8; border-color: #475569;">Réservé à Eldrin le Mage</div>`;
      } else if (isEquipped) {
        btnContainer.innerHTML = `<div class="badge-equipped">✨ ÉQUIPÉ EN MAIN</div>`;
      } else if (isUnlocked) {
        const equipBtn = document.createElement('button');
        equipBtn.className = 'grimoire-action-btn btn-equip-book';
        equipBtn.innerHTML = `<span>ÉQUIPER LE GRIMOIRE</span> <span>📖</span>`;
        equipBtn.addEventListener('click', () => {
          this.equipGrimoire(g.id);
        });
        btnContainer.appendChild(equipBtn);
      } else {
        const buyBtn = document.createElement('button');
        buyBtn.className = 'grimoire-action-btn btn-buy-book';
        const canAfford = currentGold >= g.price;
        buyBtn.disabled = !canAfford;
        buyBtn.innerHTML = canAfford 
          ? `<span>ACHETER (${g.price} 🪙)</span> <span>✨</span>` 
          : `<span>OR INSUFFISANT (${g.price} 🪙)</span> <span>🔒</span>`;
        buyBtn.addEventListener('click', () => {
          this.buyGrimoire(g.id);
        });
        btnContainer.appendChild(buyBtn);
      }

      card.appendChild(btnContainer);
      this.grimoiresGrid.appendChild(card);
    });
  }

  buyGrimoire(grimoireId) {
    const g = GRIMOIRES_CATALOG[grimoireId];
    if (!g || !this.player) return;

    const currentGold = this.player.gold || 0;
    if (currentGold < g.price) return;

    this.player.gold -= g.price;
    if (!this.player.unlockedGrimoires) this.player.unlockedGrimoires = ['arcane'];
    this.player.unlockedGrimoires.push(grimoireId);

    sfx.playLevelUp();
    this.player.equipGrimoire(grimoireId, this);
    this.renderGrimoiresGrid();
    this.updateHUD();
  }

  equipGrimoire(grimoireId) {
    if (!this.player) return;
    this.player.equipGrimoire(grimoireId, this);
    this.renderGrimoiresGrid();
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

  setupActionBar() {
    if (!this.player) return;
    const char = this.player.characterConfig || CHARACTERS[this.player.characterId] || CHARACTERS.warrior;

    const slotMainName = document.getElementById('slot-main-name');
    const slotMainIcon = document.getElementById('slot-main-icon');
    const slotSpecialName = document.getElementById('slot-special-name');
    const slotSpecialIcon = document.getElementById('slot-special-icon');

    const icons = {
      sword: '⚔️',
      spear: '🗡️',
      bow: '🏹',
      arcane_bolt: '🔮',
      lightning_bolt: '⚡',
      frost_bolt: '❄️',
      fire_orb: '🔥',
      wind_blade: '🍃',
      fireball: '🔥',
      greatsword: '🪓',
      shield_bash: '🛡️',
      spear_charge: '⚡',
      multishot: '🏹',
      arcane_nova: '💫',
      lightning_storm: '🌩️',
      frost_blizzard: '❄️',
      fire_eruption: '🌋',
      wind_cyclone: '🌪️',
      flame_wave: '🌊',
      ground_slam: '💥'
    };

    const currentMain = this.player.mainWeapon || char.mainWeapon;
    const currentMainName = this.player.mainName || char.mainName;
    const currentSpecial = this.player.specialSkill || char.specialSkill;
    const currentSpecialName = this.player.specialName || char.specialName;

    if (slotMainName) slotMainName.textContent = currentMainName || 'Attaque';
    if (slotMainIcon) slotMainIcon.textContent = icons[currentMain] || '⚔️';
    if (slotSpecialName) slotSpecialName.textContent = currentSpecialName || 'Compétence';
    if (slotSpecialIcon) slotSpecialIcon.textContent = icons[currentSpecial] || '🛡️';
  }

  // ==========================================
  // SYSTÈME DE VAGUES PAR ÉLIMINATION & PORTAILS
  // ==========================================
  startWave(waveNum) {
    this.wave = waveNum;
    this.waveState = 'ACTIVE';
    this.portalSpawnTimer = 0;
    this.waveStartLevel = 1;
    this.levelsGainedThisWave = 0;

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

      // Pluie de récompense généreuse (5 pièces d'or royales + 1 cœur de soin)
      for (let g = 0; g < 5; g++) {
        const a = (g / 5) * Math.PI * 2;
        this.gems.push(new Gem(this.player.x + Math.cos(a) * 45, this.player.y + Math.sin(a) * 45, 10, 'coin'));
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

  // ==========================================
  // EFFETS DE SORTS ÉLÉMENTAIRES (MAGE)
  // ==========================================
  triggerChainLightning(originX, originY, maxBounces, bounceDamage, initialEnemy = null) {
    if (!this.enemies || this.enemies.length === 0) return;
    let currentX = originX;
    let currentY = originY;
    const hitSet = new Set(initialEnemy ? [initialEnemy] : []);

    for (let b = 0; b < maxBounces; b++) {
      let closest = null;
      let closestDist = 180;

      for (const e of this.enemies) {
        if (hitSet.has(e) || e.hp <= 0) continue;
        const d = Math.hypot(e.x - currentX, e.y - currentY);
        if (d < closestDist) {
          closestDist = d;
          closest = e;
        }
      }

      if (!closest) break;

      hitSet.add(closest);
      closest.hp -= bounceDamage;
      closest.hitFlash = 0.12;
      closest.stunTimer = 0.4;
      this.addFloatingText(closest.x, closest.y - 12, Math.round(bounceDamage), '#ffd700', 14);
      this.createHitParticles(closest.x, closest.y, '#fffb00', 5);

      if (this.player && this.player.attackVisuals) {
        this.player.attackVisuals.push({
          type: 'charge_trail',
          startX: currentX,
          startY: currentY,
          endX: closest.x,
          endY: closest.y,
          color: '#ffd700',
          time: 0,
          duration: 0.14
        });
      }

      currentX = closest.x;
      currentY = closest.y;
    }
    sfx.playLightning();
  }

  triggerFireExplosion(x, y, radius, damage) {
    this.triggerScreenShake(4);
    this.addShockwave(x, y, radius, '#ff4d00', 4);
    this.createHitParticles(x, y, '#ff7700', 16);
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - x, e.y - y);
      if (d <= radius + e.radius) {
        e.hp -= damage;
        e.hitFlash = 0.12;
        this.addFloatingText(e.x, e.y - 12, Math.round(damage), '#ff4d00', 15);
      }
    }
  }

  gameOver() {
    this.state = 'GAMEOVER';
    this.bossHud.classList.add('hidden');
    sfx.playGameOver();

    const min = Math.floor(this.gameTime / 60);
    const sec = Math.floor(this.gameTime % 60);
    const formatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    if (this.endTime) this.endTime.textContent = formatted;
    if (this.endKills) this.endKills.textContent = this.kills;
    if (this.endGems) this.endGems.textContent = this.player ? (this.player.gold || 0) : 0;
    if (this.endWave) this.endWave.textContent = this.wave;

    this.gameoverScreen.classList.add('active');
  }

  // ==========================================
  // ÉCOLOGIE DU MONDE OUVERT & EXPLORATION RPG
  // ==========================================
  populateWorldCamps() {
    this.enemies = [];
    if (!this.worldMap || !this.worldMap.monsterCamps) return;

    for (const camp of this.worldMap.monsterCamps) {
      for (let i = 0; i < camp.count; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = Math.random() * (camp.radius * 0.45);
        const x = camp.x + Math.cos(a) * r;
        const y = camp.y + Math.sin(a) * r;
        this.enemies.push(new Enemy(x, y, camp.monsterType, this.gameTime, camp));
      }
    }
  }

  updateCampRespawns(dt) {
    if (!this.worldMap || !this.worldMap.monsterCamps) return;

    for (const camp of this.worldMap.monsterCamps) {
      // Compter combien d'ennemis vivants appartiennent à ce camp
      let aliveCount = 0;
      for (const e of this.enemies) {
        if (e.camp && e.camp.id === camp.id) {
          aliveCount++;
        }
      }

      // Si le camp a subi des pertes et que le joueur n'est pas en combat au cœur du camp
      if (aliveCount < camp.count) {
        if (!camp._currentTimer) camp._currentTimer = 0;
        camp._currentTimer += dt;

        const distToPlayer = Math.hypot(this.player.x - camp.x, this.player.y - camp.y);
        if (camp._currentTimer >= (camp.respawnTimer || 25) && distToPlayer > 320) {
          camp._currentTimer = 0;
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * (camp.radius * 0.4);
          const x = camp.x + Math.cos(a) * r;
          const y = camp.y + Math.sin(a) * r;
          this.enemies.push(new Enemy(x, y, camp.monsterType, this.gameTime, camp));
          this.createHitParticles(x, y, '#e056fd', 4);
        }
      }
    }
  }

  updateExplorationFeatures(dt) {
    if (!this.worldMap || !this.player) return;

    // 1. Fontaine sacrée des cités (soin continu passif)
    const fountain = this.worldMap.getNearbyFountain(this.player.x, this.player.y);
    if (fountain) {
      if (this.player.hp < this.player.maxHp) {
        this.player.heal(fountain.healPerSec * dt);
        if (Math.random() < 0.22) {
          this.createHitParticles(this.player.x, this.player.y, '#2ec4b6', 1);
        }
      }
    }

    // 2. Coffres au trésor dissimulés
    if (this.worldMap.chests) {
      for (const ch of this.worldMap.chests) {
        if (!ch.opened) {
          const d = Math.hypot(this.player.x - ch.x, this.player.y - ch.y);
          if (d <= 36) {
            ch.opened = true;
            sfx.playLevelUp();
            this.triggerScreenShake(4);
            this.createHitParticles(ch.x, ch.y, '#ffd700', 16);
            this.createHitParticles(ch.x, ch.y, '#2ec4b6', 10);
            this.addFloatingText(ch.x, ch.y - 25, `💰 ${ch.title} DÉVERROUILLÉ !`, '#ffd700', 22);

            // Apparition des pièces d'or étincelantes et cœur de soin
            for (let i = 0; i < (ch.xpGems || 5); i++) {
              const a = (i / (ch.xpGems || 5)) * Math.PI * 2;
              this.gems.push(new Gem(ch.x + Math.cos(a) * 35, ch.y + Math.sin(a) * 35, 6, 'coin'));
            }
            this.gems.push(new Gem(ch.x, ch.y, 0, 'heart'));
          }
        }
      }
    }

    // 3. Sanctuaires et stèles runiques
    if (this.worldMap.shrines) {
      for (const sh of this.worldMap.shrines) {
        const d = Math.hypot(this.player.x - sh.x, this.player.y - sh.y);
        if (d <= 42 && (!sh.activeTimer || sh.activeTimer <= 0)) {
          sh.activeTimer = 25;
          sfx.playLevelUp();
          this.addShockwave(sh.x, sh.y, 160, sh.color, 6);
          this.createHitParticles(sh.x, sh.y, sh.color, 20);
          this.addFloatingText(this.player.x, this.player.y - 35, `✨ ${sh.name} !`, sh.color, 22);
          this.applyShrineBuff(sh.buff, 25);
        }
        if (sh.activeTimer > 0) sh.activeTimer -= dt;
      }
    }

    // 4. Détection de proximité des entrées de Donjons
    for (const v of this.worldMap.villages) {
      if (v.dungeonEntrance) {
        const d = v.dungeonEntrance;
        const dist = Math.hypot(this.player.x - d.x, this.player.y - d.y);
        if (dist <= 50 && (!d._announced || this.gameTime - d._announced > 8)) {
          d._announced = this.gameTime;
          this.addFloatingText(d.x, d.y - 45, `🚪 ${d.name} (${d.sub})`, d.color || '#2ec4b6', 20);
        }
      }
    }

    // 5. Détection de proximité de l'Archimage Kaelen (Bibliothèque)
    const distToKaelen = Math.hypot(this.player.x - 3260, this.player.y - 3490);
    if (distToKaelen <= 50 && (!this._libraryAnnounced || this.gameTime - this._libraryAnnounced > 10)) {
      this._libraryAnnounced = this.gameTime;
      this.addFloatingText(3260, 3435, "📖 OUVREZ LA BIBLIOTHÈQUE (B)", '#c084fc', 20);
    }
  }

  applyShrineBuff(buffType, duration) {
    if (!this.player) return;
    this.shrineBuff = {
      type: buffType,
      timer: duration
    };

    if (buffType === 'speed') {
      this.player.speedMultiplier = 1.40;
    } else if (buffType === 'might') {
      this.player.damageMultiplier = 1.45;
    } else if (buffType === 'magnet') {
      this.player.magnetMultiplier = 2.2;
    }
  }

  updateShrineBuff(dt) {
    if (this.shrineBuff && this.shrineBuff.timer > 0) {
      this.shrineBuff.timer -= dt;
      if (this.shrineBuff.type === 'regen') {
        this.player.heal(8 * dt);
        if (Math.random() < 0.22) {
          this.createHitParticles(this.player.x, this.player.y, '#2ecc71', 1);
        }
      }

      if (this.shrineBuff.timer <= 0) {
        this.player.speedMultiplier = 1.0;
        this.player.damageMultiplier = 1.0;
        this.player.magnetMultiplier = 1.0;
        this.shrineBuff = null;
        this.addFloatingText(this.player.x, this.player.y - 20, "Effet de stèle dissipé", '#aaaaaa', 15);
      }
    }
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

    // Déplacement via ControlsManager (Clavier ZQSD, Souris style LoL, Manette Gamepad 360°, ou Tactile)
    const { moveX, moveY } = this.controls.getMovementVector(dt);

    // Orientation du regard selon la direction de déplacement
    if (moveX !== 0 || moveY !== 0) {
      this.player.facingAngle = Math.atan2(moveY, moveX);
    }

    // Mise à jour Joueur (avec moteur de collision WorldMap)
    this.player.update(dt, moveX, moveY, this.worldSize, this);

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

    // Gestion de l'écologie du monde ouvert (respawn des camps, fontaines sacrées, coffres, sanctuaires)
    this.updateCampRespawns(dt);
    this.updateExplorationFeatures(dt);
    this.updateShrineBuff(dt);

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

          for (let g = 0; g < 6; g++) {
            const angle = (g / 6) * Math.PI * 2;
            const distG = 40 + Math.random() * 60;
            this.gems.push(new Gem(enemy.x + Math.cos(angle) * distG, enemy.y + Math.sin(angle) * distG, 10, 'coin'));
          }
          this.gems.push(new Gem(enemy.x, enemy.y, 0, 'heart'));
        } else {
          let coinValue = 2;
          if (enemy.type === 'skeleton') {
            coinValue = 3;
          } else if (enemy.type === 'zombie') {
            coinValue = 4;
          } else if (enemy.type === 'demon') {
            coinValue = 7;
          }

          this.gems.push(new Gem(enemy.x, enemy.y, coinValue, 'coin'));

          if (Math.random() < 0.06) {
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

      // Collision avec les structures solides (murs de maisons, château, falaises, rochers)
      if (this.worldMap && this.worldMap.isCollidingSolid(proj.x, proj.y, proj.radius)) {
        this.createHitParticles(proj.x, proj.y, proj.isEnemy ? '#ff0055' : '#00f0ff', 5);
        proj.dead = true;
      }

      if (!proj.dead && proj.isEnemy) {
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
      } else if (!proj.dead) {
        for (const enemy of this.enemies) {
          if (proj.hitList.has(enemy)) continue;

          const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
          if (dist < proj.radius + enemy.radius) {
            enemy.hp -= proj.damage;
            enemy.hitFlash = 0.1;
            
            const angle = Math.atan2(enemy.y - proj.y, enemy.x - proj.x);
            const kbX = Math.cos(angle) * proj.knockback;
            const kbY = Math.sin(angle) * proj.knockback;

            if (this.worldMap) {
              const resolved = this.worldMap.resolveMove(enemy.x, enemy.y, enemy.x + kbX, enemy.y + kbY, enemy.radius, false);
              enemy.x = resolved.x;
              enemy.y = resolved.y;
            } else {
              enemy.x += kbX;
              enemy.y += kbY;
            }

            this.addFloatingText(enemy.x, enemy.y - 12, Math.round(proj.damage), '#ffffff', 14);
            this.createHitParticles(proj.x, proj.y, '#00f0ff', 3);
            sfx.playHit();

            // EFFETS ÉLÉMENTAIRES D'IMPACT
            if (proj.type === 'frost_bolt') {
              enemy.slowTimer = 3.0;
              this.createHitParticles(enemy.x, enemy.y, '#38bdf8', 6);
            } else if (proj.type === 'lightning_bolt') {
              enemy.stunTimer = 0.5;
              this.triggerChainLightning(enemy.x, enemy.y, 2, proj.damage * 0.75, enemy);
            } else if (proj.type === 'fire_orb') {
              this.triggerFireExplosion(enemy.x, enemy.y, 80, proj.damage * 0.85);
            }

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

    // Gemmes (Pièces d'or et cœurs de soin)
    for (let i = this.gems.length - 1; i >= 0; i--) {
      const gem = this.gems[i];
      gem.update(dt, this.player);

      const dist = Math.hypot(gem.x - this.player.x, gem.y - this.player.y);
      if (dist < this.player.radius + gem.radius) {
        if (gem.type === 'heart') {
          this.player.heal(35);
          sfx.playPickup();
          this.addFloatingText(this.player.x, this.player.y - 25, '+35 PV', '#00ff88', 18);
        } else {
          const goldGain = gem.value || 1;
          this.player.gold = (this.player.gold || 0) + goldGain;
          this.totalGemsCollected += goldGain;
          sfx.playCoin();
          this.addFloatingText(this.player.x, this.player.y - 25, `+${goldGain} 🪙`, '#ffd700', 16);
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
    if (this.gemsDisplay) {
      this.gemsDisplay.textContent = this.player ? (this.player.gold || 0) : 0;
    }

    // Localisation & Territoire actuel
    const locationDisplay = document.getElementById('location-display');
    const locationIcon = document.getElementById('location-icon');
    if (locationDisplay && locationIcon && this.worldMap && this.player) {
      const v = this.worldMap.getCurrentVillage(this.player.x, this.player.y);
      if (v) {
        locationIcon.textContent = v.dungeonEntrance ? v.dungeonEntrance.icon : '🏛️';
        locationDisplay.textContent = `${v.name.toUpperCase()} • ZONE SÛRE`;
      } else {
        if (this.player.y < 2500) {
          locationIcon.textContent = '🌲';
          locationDisplay.textContent = "FORÊT DES CIMES DU NORD";
        } else if (this.player.y > 4800) {
          locationIcon.textContent = '🌿';
          locationDisplay.textContent = "TERRES FLUVIOLES DU SUD";
        } else if (this.player.x < 2400) {
          locationIcon.textContent = '🐺';
          locationDisplay.textContent = "BOIS SAUVAGE DE L'OUEST";
        } else if (this.player.x > 4800) {
          locationIcon.textContent = '⚔️';
          locationDisplay.textContent = "PLAINES DES BERSERKERS";
        } else {
          locationIcon.textContent = '🌳';
          locationDisplay.textContent = "FORÊT ROYALE D'OAKHAVEN";
        }
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

    // Barre d'Action & Compétences Actives Cooldowns
    if (this.player) {
      const slotMainCd = document.getElementById('slot-main-cd');
      const slotSpecialCd = document.getElementById('slot-special-cd');
      const slotSpecialTimer = document.getElementById('slot-special-timer');
      const slotDashCd = document.getElementById('slot-dash-cd');

      if (slotMainCd) {
        const cdRatio = Math.max(0, Math.min(1, this.player.mainAttackTimer / 0.40));
        slotMainCd.style.height = `${cdRatio * 100}%`;
      }

      if (slotSpecialCd) {
        const cdRatio = Math.max(0, Math.min(1, this.player.specialTimer / (this.player.specialCd || 3.5)));
        slotSpecialCd.style.height = `${cdRatio * 100}%`;
      }

      if (slotSpecialTimer) {
        slotSpecialTimer.textContent = this.player.specialTimer > 0 
          ? `${this.player.specialTimer.toFixed(1)}s` 
          : '';
      }

      if (slotDashCd) {
        const dashCdRatio = Math.max(0, Math.min(1, this.player.dashTimer / this.player.dashCooldown));
        slotDashCd.style.height = `${dashCdRatio * 100}%`;
      }
    }
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

    // 1. Rendu du vaste monde RPG (3 villages, rivière sinueuse, ponts, routes, forêts denses, falaises)
    this.worldMap.render(this.ctx, this, this.camera, this.zoom);

    // 1.2. Marqueurs de clic au sol style League of Legends
    this.controls.renderClickMarkers(this.ctx);

    // 1.5. Portails Démoniaques aux 4 coins cardinaux
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

    // 11. Indicateurs directionnels en bordure d'écran (Flèches rouges vers les portails et boss hors-champ)
    this.renderScreenEdgeIndicators();
  }

  // ==========================================
  // FLÈCHES DIRECTIONNELLES ROUGES EN BORDURE D'ÉCRAN
  // ==========================================
  renderScreenEdgeIndicators() {
    if (this.state !== 'PLAYING') return;

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Marges asymétriques pour dégager totalement les barres de HUD supérieures (XP, stats, boss)
    const marginTop = (this.activeBoss && this.activeBoss.hp > 0) ? 165 : 125;
    const marginBottom = 65;
    const marginLeft = 65;
    const marginRight = 65;

    const minX = marginLeft;
    const maxX = this.width - marginRight;
    const minY = marginTop;
    const maxY = this.height - marginBottom;

    // 1. Indicateurs des 3 Cités Médiévales & Donjons Hors-Champ
    if (this.worldMap && this.worldMap.villages) {
      for (const v of this.worldMap.villages) {
        const targetX = v.x;
        const targetY = v.y;

        // Position projetée sur l'écran
        const screenX = centerX + (targetX - this.camera.x) * this.zoom;
        const screenY = centerY + (targetY - this.camera.y) * this.zoom;

        // Vérifier si la cité est déjà visible dans l'écran
        const isVisible = (
          screenX >= minX && screenX <= maxX &&
          screenY >= minY && screenY <= maxY
        );

        if (!isVisible) {
          const angle = Math.atan2(screenY - centerY, screenX - centerX);
          const dist = Math.hypot(targetX - this.player.x, targetY - this.player.y);
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);

          let tX = Infinity;
          if (cos > 0.0001) tX = (maxX - centerX) / cos;
          else if (cos < -0.0001) tX = (minX - centerX) / cos;

          let tY = Infinity;
          if (sin > 0.0001) tY = (maxY - centerY) / sin;
          else if (sin < -0.0001) tY = (minY - centerY) / sin;

          const t = Math.min(tX, tY);
          const edgeX = Math.max(minX, Math.min(maxX, centerX + cos * t));
          const edgeY = Math.max(minY, Math.min(maxY, centerY + sin * t));

          const cityColor = v.dungeonEntrance ? v.dungeonEntrance.color : '#2ec4b6';
          const icon = v.dungeonEntrance ? v.dungeonEntrance.icon : '🏛️';

          this.ctx.save();
          this.ctx.translate(edgeX, edgeY);

          const pulse = Math.sin(this.gameTime * 4) * 3;

          // Disque sombre d'arrière-plan
          this.ctx.fillStyle = 'rgba(10, 16, 28, 0.92)';
          this.ctx.strokeStyle = cityColor;
          this.ctx.lineWidth = 2.5;
          this.ctx.beginPath();
          this.ctx.arc(0, 0, 22, 0, Math.PI * 2);
          this.ctx.fill();
          this.ctx.stroke();

          // Flèche orientée vers la cité
          this.ctx.rotate(angle);
          this.ctx.fillStyle = cityColor;
          this.ctx.beginPath();
          this.ctx.moveTo(15 + pulse, 0);
          this.ctx.lineTo(-9, -10);
          this.ctx.lineTo(-4, 0);
          this.ctx.lineTo(-9, 10);
          this.ctx.closePath();
          this.ctx.fill();

          this.ctx.restore();

          // Badge texte avec nom de la cité et distance
          const distM = Math.round(dist / 40) + 'm';
          const label = `${icon} ${v.name} • ${distM}`;
          
          this.ctx.save();
          this.ctx.font = "bold 12px sans-serif";
          const metrics = this.ctx.measureText(label);
          const pillW = metrics.width + 16;
          const pillH = 22;
          const pillX = edgeX - pillW / 2;
          const pillY = (edgeY < centerY ? edgeY + 26 : edgeY - 26 - pillH);

          this.ctx.fillStyle = 'rgba(8, 12, 24, 0.94)';
          this.ctx.strokeStyle = cityColor;
          this.ctx.lineWidth = 1.5;
          this.ctx.beginPath();
          if (this.ctx.roundRect) {
            this.ctx.roundRect(pillX, pillY, pillW, pillH, 11);
          } else {
            this.ctx.rect(pillX, pillY, pillW, pillH);
          }
          this.ctx.fill();
          this.ctx.stroke();

          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fillText(label, edgeX, pillY + pillH / 2);
          this.ctx.restore();
        }
      }
    }

    // 2. Si un Boss est vivant et hors de l'écran, flèche de Boss Titan 🔥
    if (this.activeBoss && this.activeBoss.hp > 0) {
      const bossScreenX = centerX + (this.activeBoss.x - this.camera.x) * this.zoom;
      const bossScreenY = centerY + (this.activeBoss.y - this.camera.y) * this.zoom;
      const isBossVisible = (
        bossScreenX >= minX && bossScreenX <= maxX &&
        bossScreenY >= minY && bossScreenY <= maxY
      );

      if (!isBossVisible) {
        const bossAngle = Math.atan2(bossScreenY - centerY, bossScreenX - centerX);
        const bossDist = Math.hypot(this.activeBoss.x - this.player.x, this.activeBoss.y - this.player.y);
        const cos = Math.cos(bossAngle);
        const sin = Math.sin(bossAngle);

        let tX = Infinity;
        if (cos > 0.0001) tX = (maxX - centerX) / cos;
        else if (cos < -0.0001) tX = (minX - centerX) / cos;

        let tY = Infinity;
        if (sin > 0.0001) tY = (maxY - centerY) / sin;
        else if (sin < -0.0001) tY = (minY - centerY) / sin;

        const t = Math.min(tX, tY);
        const edgeX = Math.max(minX, Math.min(maxX, centerX + cos * t));
        const edgeY = Math.max(minY, Math.min(maxY, centerY + sin * t));

        this.ctx.save();
        this.ctx.translate(edgeX, edgeY);

        const pulse = Math.sin(this.gameTime * 12) * 6;
        const waveProgress = (this.gameTime * 2.5) % 1;

        // Onde radar orange/feu
        this.ctx.strokeStyle = `rgba(255, 69, 0, ${(1 - waveProgress) * 0.55})`;
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 26 + waveProgress * 22, 0, Math.PI * 2);
        this.ctx.stroke();

        // Disque sombre haute visibilité avec bord doré/flamboyant
        this.ctx.fillStyle = 'rgba(15, 10, 20, 0.92)';
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 26, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Flèche flamboyante
        this.ctx.rotate(bossAngle);
        this.ctx.fillStyle = '#ff2a00';
        this.ctx.strokeStyle = '#ffd700';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(19 + pulse, 0);
        this.ctx.lineTo(-13, -15);
        this.ctx.lineTo(-6, 0);
        this.ctx.lineTo(-13, 15);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();

        // Badge texte Boss
        const distM = Math.round(bossDist / 40) + 'm';
        const label = `🔥 BOSS TITAN • ${distM}`;
        
        this.ctx.save();
        this.ctx.font = "bold 14px 'Rajdhani', sans-serif";
        const metrics = this.ctx.measureText(label);
        const pillW = metrics.width + 20;
        const pillH = 24;
        const pillX = edgeX - pillW / 2;
        const pillY = (edgeY < centerY ? edgeY + 30 : edgeY - 30 - pillH);

        this.ctx.fillStyle = 'rgba(18, 8, 10, 0.92)';
        this.ctx.strokeStyle = 'rgba(255, 180, 0, 0.7)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(pillX, pillY, pillW, pillH, 12);
        } else {
          this.ctx.rect(pillX, pillY, pillW, pillH);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillStyle = '#ffd700';
        this.ctx.fillText(label, edgeX, pillY + pillH / 2);
        this.ctx.restore();
      }
    }
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
