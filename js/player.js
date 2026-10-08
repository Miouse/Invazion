/**
 * Module Joueur - Héros Médiéval, Déplacements, Dash et Compétences Actives d'Armes
 */
import { sfx } from './audio.js';
import { Projectile } from './entities.js';
import { CHARACTERS, spriteLoader, getSpriteRowFromAngle } from './sprites.js';

export class Player {
  constructor(x, y, characterId = 'warrior') {
    this.x = x;
    this.y = y;
    this.radius = 23;

    // Configuration de la classe / Héros
    const char = CHARACTERS[characterId] || CHARACTERS.warrior;
    this.characterId = characterId;
    this.characterConfig = char;
    this.spriteSrc = char.sprite;

    this.baseSpeed = 265 * (char.speedMult || 1.0);
    this.speed = this.baseSpeed;
    this.maxHp = 100 + (char.hpBonus || 0);
    this.hp = this.maxHp;
    this.regen = char.regenBonus || 0;
    this.invulnTimer = 0;
    this.magnetRadius = 140;
    this.damageMultiplier = char.dmgMult || 1.0;
    this.facingAngle = Math.PI / 2; // Face vers le bas/Sud par défaut

    // Économie médiévale (Pièces d'or récoltées)
    this.gold = 0;

    // Dash / Esquive
    this.dashCooldown = 1.3 * (char.dashCdMult || 1.0);
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashDuration = 0.16;
    this.dashRemaining = 0;

    // Animation de marche & spritesheet
    this.walkTimer = 0;
    this.isMoving = false;

    // Armes & Compétences Actives Médiévales
    this.mainWeapon = char.mainWeapon || 'sword';
    this.mainAttackTimer = 0;

    this.specialSkill = char.specialSkill || 'shield_bash';
    this.specialCd = char.specialCd || 3.5;
    this.specialTimer = 0;

    // Buff temporaire de garde au bouclier
    this.shieldGuardTimer = 0;

    // Effets visuels des attaques au corps-à-corps (traînées de coups)
    this.attackVisuals = [];
  }

  // ==========================================
  // DASH / ESQUIVE
  // ==========================================
  triggerDash(engine) {
    if (this.dashTimer <= 0) {
      this.dashTimer = this.dashCooldown;
      this.dashRemaining = this.dashDuration;
      this.isDashing = true;
      this.invulnTimer = 0.22;
      sfx.playDash();

      if (engine) {
        engine.createHitParticles(this.x, this.y, '#00f0ff', 12);
        engine.addShockwave(this.x, this.y, 80, '#00f0ff', 3);
      }
    }
  }

  // ==========================================
  // ATTAQUE PRINCIPALE (Clic Gauche)
  // ==========================================
  triggerMainAttack(engine, targetX, targetY) {
    if (this.mainAttackTimer > 0) return;

    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    switch (this.mainWeapon) {
      case 'sword': {
        // Valérian : Coup d'Épée Royale en arc de cercle
        this.mainAttackTimer = 0.32;
        sfx.playSword();
        const range = 85;
        const arc = 1.9; // ~110 degrés
        this.attackVisuals.push({
          type: 'slash',
          angle,
          radius: range,
          arc,
          color: '#e0f7fa',
          edgeColor: '#00f0ff',
          time: 0,
          duration: 0.14
        });
        this.hitConeEnemies(engine, angle, range, arc, 42 * this.damageMultiplier, 32);
        break;
      }

      case 'spear': {
        // Marcus : Estoc Perforant de Lance
        this.mainAttackTimer = 0.38;
        sfx.playSpear();
        const length = 150;
        const width = 36;
        this.attackVisuals.push({
          type: 'thrust',
          angle,
          length,
          width,
          color: '#ffd700',
          time: 0,
          duration: 0.15
        });
        this.hitLineEnemies(engine, angle, length, width, 48 * this.damageMultiplier, 22);
        break;
      }

      case 'bow': {
        // Sylvia : Tir de Flèche Véloce
        this.mainAttackTimer = 0.28;
        sfx.playBow();
        if (engine && engine.projectiles) {
          engine.projectiles.push(
            new Projectile(this.x, this.y, angle, 980, 36 * this.damageMultiplier, 1, 'arrow')
          );
        }
        break;
      }

      case 'arcane_bolt': {
        // Eldrin : Éclair d'Arcane
        this.mainAttackTimer = 0.36;
        sfx.playMagic();
        if (engine && engine.projectiles) {
          engine.projectiles.push(
            new Projectile(this.x, this.y, angle, 860, 42 * this.damageMultiplier, 1, 'arcane_bolt')
          );
        }
        break;
      }

      case 'fireball': {
        // Ignis : Boule de Feu Explosive
        this.mainAttackTimer = 0.46;
        sfx.playFireball();
        if (engine && engine.projectiles) {
          engine.projectiles.push(
            new Projectile(this.x, this.y, angle, 760, 50 * this.damageMultiplier, 1, 'fireball')
          );
        }
        break;
      }

      case 'greatsword': {
        // Gorak : Fendoir Barbare Lourd
        this.mainAttackTimer = 0.50;
        sfx.playHeavySlam();
        if (engine) engine.triggerScreenShake(4);
        const range = 105;
        const arc = 2.6; // ~150 degrés
        this.attackVisuals.push({
          type: 'slash',
          angle,
          radius: range,
          arc,
          color: '#ff7b00',
          edgeColor: '#e63946',
          time: 0,
          duration: 0.18
        });
        this.hitConeEnemies(engine, angle, range, arc, 65 * this.damageMultiplier, 50);
        break;
      }
    }
  }

  // ==========================================
  // COMPÉTENCE SPÉCIALE (Touche E / Clic Droit)
  // ==========================================
  triggerSpecialSkill(engine, targetX, targetY) {
    if (this.specialTimer > 0) return;

    this.specialTimer = this.specialCd;
    const angle = Math.atan2(targetY - this.y, targetX - this.x);
    this.facingAngle = angle;

    switch (this.specialSkill) {
      case 'shield_bash': {
        // Valérian : Coup de Bouclier étourdissant & Parade renforcée
        sfx.playShield();
        this.shieldGuardTimer = 2.2;
        const range = 95;
        const arc = 2.1;
        this.attackVisuals.push({
          type: 'shield',
          angle,
          radius: range,
          arc,
          color: '#00f0ff',
          time: 0,
          duration: 0.25
        });
        this.hitConeEnemies(engine, angle, range, arc, 65 * this.damageMultiplier, 60, 1.2);
        if (engine) {
          engine.addShockwave(this.x, this.y, 95, '#00f0ff', 4);
          engine.addFloatingText(this.x, this.y - 45, '🛡️ PARADE (-60%)', '#00f0ff', 18);
        }
        break;
      }

      case 'spear_charge': {
        // Marcus : Charge de Lance Traversante
        sfx.playSpear();
        const chargeDist = 190;
        const targetPosX = this.x + Math.cos(angle) * chargeDist;
        const targetPosY = this.y + Math.sin(angle) * chargeDist;
        if (engine && engine.worldMap) {
          const resolved = engine.worldMap.resolveMove(this.x, this.y, targetPosX, targetPosY, this.radius, true);
          this.x = resolved.x;
          this.y = resolved.y;
        } else {
          this.x = targetPosX;
          this.y = targetPosY;
        }
        this.invulnTimer = 0.25;
        this.hitRadialEnemies(engine, 100, 80 * this.damageMultiplier, 40);
        if (engine) {
          engine.addShockwave(this.x, this.y, 80, '#ffd700', 4);
          engine.createHitParticles(this.x, this.y, '#ffd700', 16);
          engine.addFloatingText(this.x, this.y - 45, '⚡ CHARGE DE LANCE', '#ffd700', 18);
        }
        break;
      }

      case 'multishot': {
        // Sylvia : Volée de 5 Flèches en éventail
        sfx.playBow();
        const arrowCount = 5;
        const spread = 0.16; // rad
        for (let i = 0; i < arrowCount; i++) {
          const aOffset = (i - (arrowCount - 1) / 2) * spread;
          engine.projectiles.push(
            new Projectile(this.x, this.y, angle + aOffset, 980, 32 * this.damageMultiplier, 1, 'arrow')
          );
        }
        if (engine) {
          engine.addFloatingText(this.x, this.y - 45, '🏹 VOLÉE SYLVESTRE', '#2ecc71', 18);
        }
        break;
      }

      case 'arcane_nova': {
        // Eldrin : Nova Stellaire à 360 degrés
        sfx.playMagic();
        if (engine) {
          engine.triggerScreenShake(6);
          engine.addShockwave(this.x, this.y, 150, '#9b5de5', 6);
          engine.createHitParticles(this.x, this.y, '#00f0ff', 20);
          engine.addFloatingText(this.x, this.y - 45, '💫 NOVA STELLAIRE', '#00f0ff', 20);
        }
        this.hitRadialEnemies(engine, 150, 90 * this.damageMultiplier, 80);
        break;
      }

      case 'flame_wave': {
        // Ignis : Vague Incendiaire
        sfx.playFireball();
        const count = 7;
        const spread = 0.18;
        for (let i = 0; i < count; i++) {
          const aOffset = (i - (count - 1) / 2) * spread;
          engine.projectiles.push(
            new Projectile(this.x, this.y, angle + aOffset, 760, 45 * this.damageMultiplier, 1, 'fireball')
          );
        }
        if (engine) {
          engine.triggerScreenShake(7);
          engine.addFloatingText(this.x, this.y - 45, '🔥 VAGUE INCENDIAIRE', '#ff4d00', 20);
        }
        break;
      }

      case 'ground_slam': {
        // Gorak : Séisme Terrestre Étourdissant
        sfx.playHeavySlam();
        if (engine) {
          engine.triggerScreenShake(12);
          engine.addShockwave(this.x, this.y, 140, '#ff4500', 7);
          engine.createHitParticles(this.x, this.y, '#e63946', 30);
          engine.addFloatingText(this.x, this.y - 45, '💥 SÉISME TERRESTRE', '#ff7b00', 20);
        }
        this.hitRadialEnemies(engine, 140, 100 * this.damageMultiplier, 70, 1.5);
        break;
      }
    }
  }

  // Helpers de détection d'impact
  hitConeEnemies(engine, centerAngle, range, arcAngle, damage, knockbackDist, stunDuration = 0) {
    if (!engine || !engine.enemies) return;
    for (const e of engine.enemies) {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= range + e.radius) {
        let diff = Math.atan2(dy, dx) - centerAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) <= arcAngle / 2) {
          this.applyHit(e, damage, knockbackDist, dx, dy, engine, stunDuration);
        }
      }
    }
  }

  hitLineEnemies(engine, angle, length, width, damage, knockbackDist) {
    if (!engine || !engine.enemies) return;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const e of engine.enemies) {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const localX = dx * cos + dy * sin;
      const localY = -dx * sin + dy * cos;
      if (localX >= 0 && localX <= length + e.radius && Math.abs(localY) <= width / 2 + e.radius) {
        this.applyHit(e, damage, knockbackDist, cos, sin, engine);
      }
    }
  }

  hitRadialEnemies(engine, radius, damage, knockbackDist, stunDuration = 0) {
    if (!engine || !engine.enemies) return;
    for (const e of engine.enemies) {
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= radius + e.radius) {
        this.applyHit(e, damage, knockbackDist, dx, dy, engine, stunDuration);
      }
    }
  }

  applyHit(e, damage, knockbackDist, dirX, dirY, engine, stunDuration = 0) {
    e.hp -= damage;
    e.hitFlash = 0.12;

    if (stunDuration > 0) {
      e.stunTimer = Math.max(e.stunTimer || 0, stunDuration);
    }

    const len = Math.hypot(dirX, dirY) || 1;
    const kbX = (dirX / len) * knockbackDist;
    const kbY = (dirY / len) * knockbackDist;

    if (engine && engine.worldMap) {
      const res = engine.worldMap.resolveMove(e.x, e.y, e.x + kbX, e.y + kbY, e.radius, false);
      e.x = res.x;
      e.y = res.y;
    } else {
      e.x += kbX;
      e.y += kbY;
    }

    if (engine) {
      engine.addFloatingText(e.x, e.y - 15, Math.round(damage), '#ffffff', 16);
      engine.createHitParticles(e.x, e.y, '#ffd700', 4);
    }
    sfx.playHit();
  }

  // ==========================================
  // MISE À JOUR (UPDATE)
  // ==========================================
  update(dt, moveX, moveY, worldSize, engine) {
    let currentSpeed = this.speed;

    // Décompte Dash
    if (this.dashRemaining > 0) {
      this.dashRemaining -= dt;
      currentSpeed = this.speed * 2.75;
      if (this.dashRemaining <= 0) {
        this.isDashing = false;
      }
    }
    if (this.dashTimer > 0) {
      this.dashTimer -= dt;
    }

    // Décompte Cooldowns de Combat
    if (this.mainAttackTimer > 0) {
      this.mainAttackTimer -= dt;
    }
    if (this.specialTimer > 0) {
      this.specialTimer -= dt;
    }
    if (this.shieldGuardTimer > 0) {
      this.shieldGuardTimer -= dt;
    }

    // Animation des visuels d'attaques
    for (let i = this.attackVisuals.length - 1; i >= 0; i--) {
      this.attackVisuals[i].time += dt;
      if (this.attackVisuals[i].time >= this.attackVisuals[i].duration) {
        this.attackVisuals.splice(i, 1);
      }
    }

    // Déplacement & collision
    if (moveX !== 0 || moveY !== 0) {
      const length = Math.hypot(moveX, moveY);
      const nx = moveX / length;
      const ny = moveY / length;
      const targetX = this.x + nx * currentSpeed * dt;
      const targetY = this.y + ny * currentSpeed * dt;

      if (engine && engine.worldMap) {
        const resolved = engine.worldMap.resolveMove(this.x, this.y, targetX, targetY, this.radius, true);
        this.x = resolved.x;
        this.y = resolved.y;
      } else {
        this.x = targetX;
        this.y = targetY;
      }

      this.facingAngle = Math.atan2(ny, nx);
      this.walkTimer += dt * 8.5;
      this.isMoving = true;
    } else {
      this.isMoving = false;
    }

    this.x = Math.max(this.radius, Math.min(worldSize - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(worldSize - this.radius, this.y));

    if (this.invulnTimer > 0) {
      this.invulnTimer -= dt;
    }

    if (this.regen > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.regen * dt);
    }
  }

  takeDamage(amount) {
    if (this.shieldGuardTimer > 0) {
      amount *= 0.40; // Réduction de 60% des dégâts pendant la parade
      sfx.playShield();
    }
    this.hp -= amount;
    this.invulnTimer = 0.35;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  // ==========================================
  // RENDU DU HÉROS & VISUELS DE COMBAT
  // ==========================================
  draw(ctx) {
    if (this.invulnTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Ombre au sol
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 18, this.radius, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Traînée lumineuse si en Dash
    if (this.isDashing) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 24;
    }

    // Halo protecteur de parade au bouclier
    if (this.shieldGuardTimer > 0) {
      ctx.save();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
      ctx.fill();
      ctx.restore();
    }

    // Sprite 8-directions du héros
    const img = spriteLoader.getImage(this.spriteSrc);
    if (img && img.complete && img.naturalWidth > 0) {
      const row = getSpriteRowFromAngle(this.facingAngle);
      const col = this.isMoving ? (Math.floor(this.walkTimer) % 4) : 0;

      ctx.imageSmoothingEnabled = false;
      const drawSize = 62;
      ctx.drawImage(
        img,
        col * 32, row * 32, 32, 32,
        -drawSize / 2, -drawSize / 2 - 2, drawSize, drawSize
      );
    } else {
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tracé des effets visuels d'attaques actives (traînées de coups)
    for (const v of this.attackVisuals) {
      const progress = v.time / v.duration;
      const alpha = Math.max(0, 1 - progress);

      if (v.type === 'slash') {
        ctx.save();
        ctx.rotate(v.angle);
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 5 * alpha;
        ctx.beginPath();
        ctx.arc(0, 0, v.radius, -v.arc / 2, v.arc / 2);
        ctx.stroke();

        // Lame brillante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5 * alpha;
        ctx.stroke();
        ctx.restore();
      } else if (v.type === 'thrust') {
        ctx.save();
        ctx.rotate(v.angle);
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 4 * alpha;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(v.length, 0);
        ctx.stroke();

        // Pointe d'acier
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(v.length, 0);
        ctx.lineTo(v.length - 18, -8);
        ctx.lineTo(v.length - 18, 8);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (v.type === 'shield') {
        ctx.save();
        ctx.rotate(v.angle);
        ctx.strokeStyle = v.color;
        ctx.lineWidth = 6 * alpha;
        ctx.beginPath();
        ctx.arc(0, 0, v.radius, -v.arc / 2, v.arc / 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    ctx.restore();
  }
}
