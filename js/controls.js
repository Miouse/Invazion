/**
 * Module Contrôles & Entrées - ControlsManager
 * Centralise et gère tous les modes de déplacement et périphériques du jeu :
 * 1. ⌨️ Mode Clavier Classique (ZQSD / WASD / Flèches directionnelles, Espace pour Dash)
 * 2. 🖱️ Mode Souris Style League of Legends (Clic Gauche au sol, marqueur vert LoL animé, suivi en continu, Clic Droit / Espace pour Dash)
 * 3. 🎮 Mode Manette / Gamepad (Stick analogique 360° fluide, D-Pad, gâchettes, vibrations & détection automatique)
 * 4. 📱 Joystick Tactile Virtuel (pour écrans tactiles et mobiles)
 * 5. ⚙️ Interface et Modale de Réglages interactive avec persistance localStorage
 */

import { sfx } from './audio.js';

export class ControlsManager {
  constructor(engine) {
    this.engine = engine;

    // Mode actuel : 'keyboard' | 'mouse_lol' | 'gamepad'
    this.mode = 'keyboard';
    try {
      this.mode = localStorage.getItem('invazion_control_mode') || 'keyboard';
    } catch (e) {
      this.mode = 'keyboard';
    }

    // État clavier
    this.keys = {};

    // État souris (Mode League of Legends avec Pathfinding A*)
    this.mouseTarget = null;
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.lastMouseWorld = { x: 3500, y: 3500 };
    this.pathWaypoints = [];
    this.currentWaypointIndex = 0;
    this.lastPathCalcTime = 0;
    this.clickMarkers = [];
    this.lastPlayerPos = null;
    this.stuckTimer = 0;

    // État manette (Gamepad API)
    this.gamepadConnected = false;
    this.gamepadId = '';
    this.lastGpDashPressed = false;
    this.lastGpAttackPressed = false;
    this.lastGpSkillPressed = false;
    this.lastGpPausePressed = false;

    // État tactile
    this.joystickVector = { x: 0, y: 0 };

    // Éléments du DOM (UI)
    this.settingsScreen = document.getElementById('settings-screen');
    this.btnSettings = document.getElementById('btn-settings');
    this.btnStartSettings = document.getElementById('btn-start-settings');
    this.btnPauseSettings = document.getElementById('btn-pause-settings');
    this.btnSaveSettings = document.getElementById('btn-save-settings');
    this.startControlLabel = document.getElementById('start-control-mode-label');
    this.gamepadStatusDot = document.getElementById('gamepad-status-dot');
    this.gamepadStatusText = document.getElementById('gamepad-status-text');

    this.init();
  }

  init() {
    this.setupKeyboard();
    this.setupMouseLoL();
    this.setupGamepad();
    this.setupTouchJoystick();
    this.setupSettingsUI();
    this.setMode(this.mode, false);
  }

  // ==========================================
  // 1. CLAVIER (ZQSD / FLÈCHES)
  // ==========================================
  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;

      // Dash avec Barre Espace
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (this.engine.player && this.engine.state === 'PLAYING') {
          // En mode LoL, le Dash propulse vers le curseur de la souris
          if (this.mode === 'mouse_lol' && this.lastMouseWorld) {
            const dx = this.lastMouseWorld.x - this.engine.player.x;
            const dy = this.lastMouseWorld.y - this.engine.player.y;
            if (Math.hypot(dx, dy) > 10) {
              this.engine.player.facingAngle = Math.atan2(dy, dx);
            }
          }
          this.engine.player.triggerDash(this.engine);
        }
      }

      // Compétence Spéciale avec touche E
      if (e.key === 'e' || e.key === 'E') {
        if (this.engine.player && this.engine.state === 'PLAYING' && this.lastMouseWorld) {
          this.engine.player.triggerSpecialSkill(this.engine, this.lastMouseWorld.x, this.lastMouseWorld.y);
        }
      }

      // Interaction universelle avec touche F (Entrer dans les maisons, coffres, sanctuaires, lit)
      if (e.key === 'f' || e.key === 'F') {
        if (this.engine.state === 'PLAYING') {
          this.engine.triggerInteraction();
        }
      }

      // Bibliothèque des Arcanes avec touche B
      if (e.key === 'b' || e.key === 'B') {
        if (this.engine.state === 'PLAYING' || this.engine.state === 'LIBRARY') {
          this.engine.toggleLibrary();
        }
      }

      // Pause avec Échap ou P
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.engine.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
    });
  }

  // ==========================================
  // 2. SOURIS (MODE LEAGUE OF LEGENDS)
  // ==========================================
  setupMouseLoL() {
    // Désactiver le menu contextuel par défaut du navigateur
    window.addEventListener('contextmenu', (e) => {
      if (this.engine.state === 'PLAYING') {
        e.preventDefault();
      }
    });

    this.engine.canvas.addEventListener('pointerdown', (e) => {
      if (this.engine.state !== 'PLAYING') return;

      const worldCoords = this.screenToWorld(e.clientX, e.clientY);
      this.lastMouseWorld = worldCoords;

      if (this.mode === 'mouse_lol') {
        // Clic Droit (Bouton 2) = Déplacement style League of Legends (MOBA)
        if (e.button === 2) {
          e.preventDefault();
          this.isRightMouseDown = true;
          this.setMouseDestination(worldCoords.x, worldCoords.y);
        }
        // Clic Gauche (Bouton 0) = Attaque Principale vers la position de la souris
        else if (e.button === 0) {
          if (this.engine.player) {
            this.engine.player.triggerMainAttack(this.engine, worldCoords.x, worldCoords.y);
          }
        }
      } else {
        // Mode Clavier (ZQSD) :
        // Clic Gauche (Bouton 0) = Attaque Principale
        if (e.button === 0) {
          if (this.engine.player) {
            this.engine.player.triggerMainAttack(this.engine, worldCoords.x, worldCoords.y);
          }
        }
        // Clic Droit (Bouton 2) = Compétence Spéciale
        else if (e.button === 2) {
          e.preventDefault();
          if (this.engine.player) {
            this.engine.player.triggerSpecialSkill(this.engine, worldCoords.x, worldCoords.y);
          }
        }
      }
    });

    window.addEventListener('pointermove', (e) => {
      const worldCoords = this.screenToWorld(e.clientX, e.clientY);
      this.lastMouseWorld = worldCoords;

      // Maintien du clic droit en mode LoL : suit le curseur en direct avec recherche de chemin fluide
      if (this.isRightMouseDown && this.mode === 'mouse_lol' && this.engine.state === 'PLAYING') {
        const now = performance.now();
        if (now - this.lastPathCalcTime > 120) {
          this.lastPathCalcTime = now;
          if (this.engine.worldMap && this.engine.player) {
            const path = this.engine.worldMap.findPath(
              this.engine.player.x,
              this.engine.player.y,
              worldCoords.x,
              worldCoords.y,
              this.engine.player.radius || 18
            );
            if (path && path.length > 0) {
              this.pathWaypoints = path;
              this.currentWaypointIndex = 0;
              this.mouseTarget = path[0];
            } else {
              this.pathWaypoints = [];
              this.mouseTarget = { x: worldCoords.x, y: worldCoords.y };
            }
          } else {
            this.mouseTarget = { x: worldCoords.x, y: worldCoords.y };
          }
        }
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });
  }

  // Projection coordonnées écran -> monde
  screenToWorld(clientX, clientY) {
    const rect = this.engine.canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;
    const worldX = this.engine.camera.x + (canvasX - this.engine.width / 2) / this.engine.zoom;
    const worldY = this.engine.camera.y + (canvasY - this.engine.height / 2) / this.engine.zoom;
    return { x: worldX, y: worldY };
  }

  setMouseDestination(x, y) {
    // Calcul du plus court chemin A* évitant rivières, maisons et traversant les ponts
    if (this.engine.worldMap && this.engine.player) {
      const path = this.engine.worldMap.findPath(
        this.engine.player.x,
        this.engine.player.y,
        x,
        y,
        this.engine.player.radius || 18
      );
      if (path && path.length > 0) {
        this.pathWaypoints = path;
        this.currentWaypointIndex = 0;
        this.mouseTarget = path[0];
      } else {
        this.pathWaypoints = [];
        this.mouseTarget = { x, y };
      }
      this.lastPlayerPos = null;
      this.stuckTimer = 0;
    } else {
      this.pathWaypoints = [];
      this.mouseTarget = { x, y };
    }

    // Ajouter le marqueur visuel vert LoL animé
    this.clickMarkers.push({
      x,
      y,
      time: 0,
      duration: 0.42
    });

    // Petit clic sonore réactif
    sfx.playPickup();
  }

  // ==========================================
  // 3. MANETTE / GAMEPAD API (HTML5 STANDARD)
  // ==========================================
  setupGamepad() {
    window.addEventListener('gamepadconnected', (e) => {
      this.gamepadConnected = true;
      this.gamepadId = e.gamepad.id;
      this.updateGamepadStatusUI();
      if (this.engine.player) {
        this.engine.addFloatingText(this.engine.player.x, this.engine.player.y - 45, "🎮 MANETTE CONNECTÉE", '#00f0ff', 22);
      }
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.gamepadConnected = false;
      this.updateGamepadStatusUI();
    });
  }

  pollGamepad() {
    if (!navigator.getGamepads) return { moveX: 0, moveY: 0 };
    const gamepads = navigator.getGamepads();
    let moveX = 0, moveY = 0;
    let anyConnected = false;

    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp && gp.connected) {
        anyConnected = true;
        this.gamepadConnected = true;
        this.gamepadId = gp.id;

        // 1. Stick analogique gauche (360°)
        const axisX = gp.axes[0] || 0;
        const axisY = gp.axes[1] || 0;
        const deadzone = 0.18;
        if (Math.hypot(axisX, axisY) > deadzone) {
          moveX = axisX;
          moveY = axisY;
        }

        // 2. Croix directionnelle (D-Pad)
        if (gp.buttons[12] && gp.buttons[12].pressed) moveY -= 1;
        if (gp.buttons[13] && gp.buttons[13].pressed) moveY += 1;
        if (gp.buttons[14] && gp.buttons[14].pressed) moveX -= 1;
        if (gp.buttons[15] && gp.buttons[15].pressed) moveX += 1;

        // 3. Bouton A (Croix) / RB : Dash
        const dashBtn = (gp.buttons[0] && gp.buttons[0].pressed) ||
                        (gp.buttons[5] && gp.buttons[5].pressed);
        if (dashBtn) {
          if (!this.lastGpDashPressed) {
            if (this.engine.player && this.engine.state === 'PLAYING') {
              this.engine.player.triggerDash(this.engine);
            }
          }
          this.lastGpDashPressed = true;
        } else {
          this.lastGpDashPressed = false;
        }

        // 4. Bouton X (Carré) / Gâchette RT (R2) : Attaque Principale
        const attackBtn = (gp.buttons[2] && gp.buttons[2].pressed) ||
                          (gp.buttons[7] && gp.buttons[7].pressed);
        if (attackBtn) {
          if (!this.lastGpAttackPressed) {
            if (this.engine.player && this.engine.state === 'PLAYING') {
              let aimAngle = this.engine.player.facingAngle;
              const rx = gp.axes[2] || 0;
              const ry = gp.axes[3] || 0;
              if (Math.hypot(rx, ry) > 0.25) {
                aimAngle = Math.atan2(ry, rx);
              }
              const targetX = this.engine.player.x + Math.cos(aimAngle) * 150;
              const targetY = this.engine.player.y + Math.sin(aimAngle) * 150;
              this.engine.player.triggerMainAttack(this.engine, targetX, targetY);
            }
          }
          this.lastGpAttackPressed = true;
        } else {
          this.lastGpAttackPressed = false;
        }

        // 5. Bouton B (Rond) / Y (Triangle) / Gâchette LT (L2) : Compétence Spéciale
        const skillBtn = (gp.buttons[1] && gp.buttons[1].pressed) ||
                         (gp.buttons[3] && gp.buttons[3].pressed) ||
                         (gp.buttons[6] && gp.buttons[6].pressed);
        if (skillBtn) {
          if (!this.lastGpSkillPressed) {
            if (this.engine.player && this.engine.state === 'PLAYING') {
              let aimAngle = this.engine.player.facingAngle;
              const rx = gp.axes[2] || 0;
              const ry = gp.axes[3] || 0;
              if (Math.hypot(rx, ry) > 0.25) {
                aimAngle = Math.atan2(ry, rx);
              }
              const targetX = this.engine.player.x + Math.cos(aimAngle) * 150;
              const targetY = this.engine.player.y + Math.sin(aimAngle) * 150;
              this.engine.player.triggerSpecialSkill(this.engine, targetX, targetY);
            }
          }
          this.lastGpSkillPressed = true;
        } else {
          this.lastGpSkillPressed = false;
        }

        // 6. Bouton Start / Options (Index 9) : Pause
        const pauseBtn = gp.buttons[9] && gp.buttons[9].pressed;
        if (pauseBtn) {
          if (!this.lastGpPausePressed) {
            this.engine.togglePause();
          }
          this.lastGpPausePressed = true;
        } else {
          this.lastGpPausePressed = false;
        }
        break;
      }
    }

    if (!anyConnected) {
      this.gamepadConnected = false;
    }

    this.updateGamepadStatusUI();
    return { moveX, moveY };
  }

  // ==========================================
  // 4. JOYSTICK VIRTUEL TACTILE
  // ==========================================
  setupTouchJoystick() {
    const joystick = document.getElementById('virtual-joystick');
    const knob = document.getElementById('joystick-knob');
    if (!joystick || !knob) return;

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

  // ==========================================
  // 5. INTERFACE & MODALE DES RÉGLAGES
  // ==========================================
  setupSettingsUI() {
    if (this.btnSettings) {
      this.btnSettings.addEventListener('click', () => this.openSettings());
    }
    if (this.btnStartSettings) {
      this.btnStartSettings.addEventListener('click', () => this.openSettings());
    }
    if (this.btnPauseSettings) {
      this.btnPauseSettings.addEventListener('click', () => this.openSettings());
    }
    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => this.closeSettings());
    }

    const cards = document.querySelectorAll('.control-card');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const selected = card.dataset.mode;
        if (selected) {
          this.setMode(selected);
          sfx.playPickup();
        }
      });
    });
  }

  setMode(mode, save = true) {
    this.mode = mode;
    if (save) {
      try {
        localStorage.setItem('invazion_control_mode', mode);
      } catch (e) {}
    }

    // Mise à jour visuelle des cartes
    document.querySelectorAll('.control-card').forEach((c) => {
      if (c.dataset.mode === mode) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Mise à jour du label au menu de départ
    if (this.startControlLabel) {
      const labels = {
        keyboard: 'Clavier (ZQSD)',
        mouse_lol: 'Souris (Mode LoL)',
        gamepad: 'Manette (Gamepad)'
      };
      this.startControlLabel.textContent = labels[mode] || mode;
    }

    // Réinitialisation des déplacements souris en cours
    this.mouseTarget = null;
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.pathWaypoints = [];
    this.currentWaypointIndex = 0;
    this.lastPlayerPos = null;
    this.stuckTimer = 0;
  }

  resetMovement() {
    this.mouseTarget = null;
    this.isMouseDown = false;
    this.isRightMouseDown = false;
    this.pathWaypoints = [];
    this.currentWaypointIndex = 0;
    this.clickMarkers = [];
    this.joystickVector = { x: 0, y: 0 };
    this.lastPlayerPos = null;
    this.stuckTimer = 0;
  }

  openSettings() {
    this.previousState = this.engine.state;
    if (this.engine.state === 'PLAYING') {
      this.engine.state = 'PAUSED';
    }
    if (this.settingsScreen) {
      this.settingsScreen.classList.add('active');
    }
    this.updateGamepadStatusUI();
    sfx.playPickup();
  }

  closeSettings() {
    if (this.settingsScreen) {
      this.settingsScreen.classList.remove('active');
    }
    if (this.previousState === 'PLAYING') {
      this.engine.state = 'PLAYING';
    }
    sfx.playPickup();
  }

  updateGamepadStatusUI() {
    if (!this.gamepadStatusText || !this.gamepadStatusDot) return;
    if (this.gamepadConnected) {
      this.gamepadStatusDot.classList.add('connected');
      const cleanName = this.gamepadId ? this.gamepadId.split('(')[0].trim() : 'Manette Active';
      this.gamepadStatusText.textContent = `Connectée : ${cleanName}`;
      this.gamepadStatusText.style.color = '#00f0ff';
    } else {
      this.gamepadStatusDot.classList.remove('connected');
      this.gamepadStatusText.textContent = 'En attente d\'une manette (appuyez sur une touche)...';
      this.gamepadStatusText.style.color = 'var(--text-muted)';
    }
  }

  // ==========================================
  // CALCUL DES VECTEURS DE DÉPLACEMENT
  // ==========================================
  getMovementVector(dt) {
    let moveX = 0, moveY = 0;

    // 1. Clavier (ZQSD / WASD / Flèches)
    const isKeyboardPressed = (
      this.keys['z'] || this.keys['w'] || this.keys['arrowup'] ||
      this.keys['s'] || this.keys['arrowdown'] ||
      this.keys['q'] || this.keys['a'] || this.keys['arrowleft'] ||
      this.keys['d'] || this.keys['arrowright']
    );

    if (this.keys['z'] || this.keys['w'] || this.keys['arrowup']) moveY -= 1;
    if (this.keys['s'] || this.keys['arrowdown']) moveY += 1;
    if (this.keys['q'] || this.keys['a'] || this.keys['arrowleft']) moveX -= 1;
    if (this.keys['d'] || this.keys['arrowright']) moveX += 1;

    // Si le clavier est utilisé, il annule la cible souris et le chemin A*
    if (isKeyboardPressed) {
      this.mouseTarget = null;
      this.pathWaypoints = [];
    }

    // 2. Manette (Gamepad)
    const gpMove = this.pollGamepad();
    if (gpMove.moveX !== 0 || gpMove.moveY !== 0) {
      moveX = gpMove.moveX;
      moveY = gpMove.moveY;
      this.mouseTarget = null;
      this.pathWaypoints = [];
    }

    // 3. Joystick tactile
    if (this.joystickVector.x !== 0 || this.joystickVector.y !== 0) {
      moveX = this.joystickVector.x;
      moveY = this.joystickVector.y;
      this.mouseTarget = null;
      this.pathWaypoints = [];
    }

    // 4. Mode Souris (League of Legends avec Pathfinding A* intelligent)
    if (this.mouseTarget && !isKeyboardPressed && (gpMove.moveX === 0 && gpMove.moveY === 0) && (this.joystickVector.x === 0 && this.joystickVector.y === 0)) {
      if (this.engine.player) {
        const p = this.engine.player;

        // Watchdog anti-blocage (Fail-safe)
        if (this.lastPlayerPos) {
          const movedDist = Math.hypot(p.x - this.lastPlayerPos.x, p.y - this.lastPlayerPos.y);
          if (movedDist < 0.25 * (p.speed || 180) * dt) {
            this.stuckTimer += dt;
          } else {
            this.stuckTimer = 0;
          }
        }
        this.lastPlayerPos = { x: p.x, y: p.y };

        let dx = this.mouseTarget.x - p.x;
        let dy = this.mouseTarget.y - p.y;
        let dist = Math.hypot(dx, dy);

        // Rayon de transition vers le waypoint suivant (élargi pour un passage fluide)
        const isIntermediate = this.pathWaypoints.length > 0 && this.currentWaypointIndex < this.pathWaypoints.length - 1;
        const arriveDist = isIntermediate ? 42 : 18;

        // Déblocage automatique en cas d'obstacle imprévu (> 0.20s sans progression réelle)
        if (this.stuckTimer > 0.20) {
          this.stuckTimer = 0;
          if (isIntermediate) {
            // Passer immédiatement au point de passage suivant
            this.currentWaypointIndex++;
            this.mouseTarget = this.pathWaypoints[this.currentWaypointIndex];
            dx = this.mouseTarget.x - p.x;
            dy = this.mouseTarget.y - p.y;
            dist = Math.hypot(dx, dy);
          } else {
            // Fin de trajectoire bloquée : arrêt propre
            this.mouseTarget = null;
            this.pathWaypoints = [];
            this.lastPlayerPos = null;
            return { moveX: 0, moveY: 0 };
          }
        }

        // Raccourci de trajectoire dynamique (Line-of-Sight Shortcut)
        if (isIntermediate && this.engine.worldMap && this.currentWaypointIndex + 1 < this.pathWaypoints.length) {
          const nextWp = this.pathWaypoints[this.currentWaypointIndex + 1];
          if (this.engine.worldMap.hasLineOfSight(p.x, p.y, nextWp.x, nextWp.y, p.radius || 16, 14)) {
            this.currentWaypointIndex++;
            this.mouseTarget = nextWp;
            dx = this.mouseTarget.x - p.x;
            dy = this.mouseTarget.y - p.y;
            dist = Math.hypot(dx, dy);
          }
        }

        if (dist <= arriveDist) {
          if (isIntermediate) {
            this.currentWaypointIndex++;
            this.mouseTarget = this.pathWaypoints[this.currentWaypointIndex];
            dx = this.mouseTarget.x - p.x;
            dy = this.mouseTarget.y - p.y;
            dist = Math.hypot(dx, dy);
            if (dist > 0) {
              moveX = dx / dist;
              moveY = dy / dist;
            }
          } else {
            this.mouseTarget = null;
            this.pathWaypoints = [];
            this.lastPlayerPos = null;
          }
        } else {
          moveX = dx / dist;
          moveY = dy / dist;
        }
      }
    } else {
      this.lastPlayerPos = null;
      this.stuckTimer = 0;
    }

    // Mise à jour de la durée des marqueurs LoL
    for (let i = this.clickMarkers.length - 1; i >= 0; i--) {
      this.clickMarkers[i].time += dt;
      if (this.clickMarkers[i].time >= this.clickMarkers[i].duration) {
        this.clickMarkers.splice(i, 1);
      }
    }

    return { moveX, moveY };
  }

  // ==========================================
  // RENDU DES MARQUEURS DE CLIC ET TRACÉ A* STYLE LEAGUE OF LEGENDS
  // ==========================================
  renderClickMarkers(ctx) {
    // 1. Tracé pointillé du chemin A* planifié (style MOBA / RTS)
    if (this.pathWaypoints && this.pathWaypoints.length > 1 && this.engine.player) {
      ctx.save();
      ctx.strokeStyle = 'rgba(46, 213, 115, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(this.engine.player.x, this.engine.player.y);
      for (let i = this.currentWaypointIndex; i < this.pathWaypoints.length; i++) {
        ctx.lineTo(this.pathWaypoints[i].x, this.pathWaypoints[i].y);
      }
      ctx.stroke();

      // Petits repères lumineux sur chaque point de passage (ex: sur le pont)
      ctx.fillStyle = '#2ed573';
      for (let i = this.currentWaypointIndex; i < this.pathWaypoints.length - 1; i++) {
        const wp = this.pathWaypoints[i];
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (!this.clickMarkers || this.clickMarkers.length === 0) return;

    for (let i = 0; i < this.clickMarkers.length; i++) {
      const m = this.clickMarkers[i];
      const progress = m.time / m.duration; // 0 à 1
      if (progress >= 1) continue;

      const alpha = 1 - progress;
      const radius = 24 * (1 - progress * 0.45); // Cercle qui rétrécit vers le centre
      const rotation = progress * 1.5;

      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(rotation);

      // 1. Cercle pulsé vert émeraude LoL
      ctx.strokeStyle = `rgba(46, 213, 115, ${alpha * 0.95})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();

      // 2. 4 Chevrons intérieurs iconiques (style curseur de déplacement LoL)
      ctx.fillStyle = `rgba(38, 222, 129, ${alpha})`;
      for (let a = 0; a < 4; a++) {
        const ang = (a * Math.PI) / 2;
        ctx.save();
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.moveTo(radius + 4, 0);
        ctx.lineTo(radius + 11, -5);
        ctx.lineTo(radius + 8, 0);
        ctx.lineTo(radius + 11, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 3. Éclat lumineux central
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
