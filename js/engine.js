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

    // Dimensions arène
    this.worldSize = 3400;
    this.camera = { x: 0, y: 0 };
    this.screenShake = 0;

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

    // Création Joueur
    this.player = new Player(this.worldSize / 2, this.worldSize / 2);
    
    // Débloque l'arme de départ (Baguette magique niveau 1)
    this.player.upgrades['wand'] = 1;
    this.updateEquipmentHud();

    this.state = 'PLAYING';
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
  // MONTÉE DE NIVEAU & AMÉLIORATIONS
  // ==========================================
  triggerLevelUp() {
    this.state = 'LEVELUP';
    sfx.playLevelUp();

    const available = UPGRADE_CATALOG.filter(up => {
      const currentLvl = this.player.upgrades[up.id] || 0;
      return currentLvl < up.maxLevel;
    });

    if (available.length === 0) {
      this.player.heal(this.player.maxHp);
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

    this.levelupScreen.classList.remove('active');
    this.updateEquipmentHud();
    this.updateHUD();
    this.state = 'PLAYING';
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
  // SPAWNER D'ENNEMIS & BOSS COLOSSAL (3X)
  // ==========================================
  handleSpawning(dt) {
    const minutes = this.gameTime / 60;
    const spawnRate = 1.6 + minutes * 2.2; 
    const maxEnemies = Math.min(360, Math.floor(50 + minutes * 65));

    if (this.enemies.length < maxEnemies) {
      if (Math.random() < spawnRate * dt) {
        this.spawnEnemy();
      }
    }

    // Apparition du BOSS Titan colossal toutes les 75 secondes
    if (Math.floor(this.gameTime) > 0 && Math.floor(this.gameTime) % 75 === 0 && !this.bossSpawnedThisInterval) {
      this.spawnColossalBoss();
      this.bossSpawnedThisInterval = true;
    } else if (Math.floor(this.gameTime) % 75 !== 0) {
      this.bossSpawnedThisInterval = false;
    }
  }

  spawnEnemy() {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(this.width, this.height) * 0.65 + Math.random() * 150;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const r = Math.random();
    const t = this.gameTime;

    let type = 'bat';
    if (t > 120 && r < 0.3) {
      type = 'demon';
    } else if (t > 60 && r < 0.5) {
      type = 'zombie';
    } else if (t > 20 && r < 0.7) {
      type = 'skeleton';
    }

    this.enemies.push(new Enemy(x, y, type, this.gameTime));
  }

  spawnColossalBoss() {
    const angle = Math.random() * Math.PI * 2;
    const dist = 550;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;
    
    const boss = new Enemy(x, y, 'boss', this.gameTime);
    this.enemies.push(boss);
    this.activeBoss = boss;

    this.bossHud.classList.remove('hidden');
    this.bossName.textContent = "MALGOK • SEIGNEUR DU CRIMSON";
    this.triggerScreenShake(12);
    this.addFloatingText(this.player.x, this.player.y - 70, "⚠️ TITAN DÉMONIAQUE RÉVEILLÉ !", '#ff0055', 28);
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

    // Caméra lisse centrée sur le joueur
    this.camera.x += (this.player.x - this.width / 2 - this.camera.x) * 0.12;
    this.camera.y += (this.player.y - this.height / 2 - this.camera.y) * 0.12;

    // Screen Shake
    if (this.screenShake > 0) {
      this.screenShake -= dt * 25;
      if (this.screenShake < 0) this.screenShake = 0;
    }

    // Gestion des armes & pouvoirs de zone du joueur
    this.player.updateWeapons(dt, this);

    // Spawner
    this.handleSpawning(dt);

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

          for (let g = 0; g < 10; g++) {
            const angle = (g / 10) * Math.PI * 2;
            const distG = 40 + Math.random() * 80;
            this.gems.push(new Gem(enemy.x + Math.cos(angle) * distG, enemy.y + Math.sin(angle) * distG, 50, 'red'));
          }
          this.gems.push(new Gem(enemy.x, enemy.y, 0, 'heart'));
        } else {
          let gemType = 'blue';
          let gemValue = 1;
          if (enemy.type === 'zombie' || enemy.type === 'demon') {
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
            this.triggerLevelUp();
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
    this.ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);

    // 1. Dalles de donjon gothique & runes anciennes
    this.renderDungeonFloor();

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
    const tileSize = 120;
    const startX = Math.floor(this.camera.x / tileSize) * tileSize;
    const endX = startX + this.width + tileSize * 2;
    const startY = Math.floor(this.camera.y / tileSize) * tileSize;
    const endY = startY + this.height + tileSize * 2;

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        const tileHash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        this.ctx.fillStyle = tileHash > 0.5 ? '#0c0f1c' : '#0e1222';
        this.ctx.fillRect(x, y, tileSize, tileSize);

        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, tileSize, tileSize);

        if (tileHash > 0.85) {
          this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.08)';
          this.ctx.beginPath();
          this.ctx.arc(x + tileSize / 2, y + tileSize / 2, 22, 0, Math.PI * 2);
          this.ctx.stroke();
        }
      }
    }

    const runeCenters = [
      { x: this.worldSize / 2, y: this.worldSize / 2 },
      { x: 800, y: 800 }, { x: 2600, y: 800 },
      { x: 800, y: 2600 }, { x: 2600, y: 2600 }
    ];

    for (const rc of runeCenters) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.15)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(rc.x, rc.y, 140, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(rc.x, rc.y, 90, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const rx = rc.x + Math.cos(a) * 90;
        const ry = rc.y + Math.sin(a) * 90;
        if (i === 0) this.ctx.moveTo(rx, ry);
        else this.ctx.lineTo(rx, ry);
      }
      this.ctx.closePath();
      this.ctx.stroke();
      this.ctx.restore();
    }

    this.ctx.strokeStyle = 'rgba(255, 42, 85, 0.8)';
    this.ctx.lineWidth = 8;
    this.ctx.shadowColor = '#ff2a55';
    this.ctx.shadowBlur = 20;
    this.ctx.strokeRect(0, 0, this.worldSize, this.worldSize);
    this.ctx.shadowBlur = 0;
  }

  renderDynamicLighting() {
    this.ctx.save();
    const light = this.ctx.createRadialGradient(
      this.player.x, this.player.y, 40,
      this.player.x, this.player.y, 750
    );
    light.addColorStop(0, 'rgba(0, 0, 0, 0)');
    light.addColorStop(0.5, 'rgba(4, 6, 12, 0.25)');
    light.addColorStop(1, 'rgba(2, 3, 6, 0.7)');

    this.ctx.fillStyle = light;
    this.ctx.fillRect(
      this.camera.x, this.camera.y,
      this.width, this.height
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
