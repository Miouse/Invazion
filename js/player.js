/**
 * Module Joueur - Héros, Déplacements, Dash et Armes / Pouvoirs de Zone
 */
import { sfx } from './audio.js';
import { Projectile } from './entities.js';
import { CHARACTERS, spriteLoader, getSpriteRowFromAngle } from './sprites.js';

export class Player {
  constructor(x, y, characterId = 'warrior') {
    this.x = x;
    this.y = y;
    this.radius = 20;

    // Configuration de la classe / skin
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
    this.magnetRadius = 110 * (char.magnetMult || 1.0);
    this.damageMultiplier = char.dmgMult || 1.0;
    this.facingAngle = Math.PI / 2; // Face vers le bas/Sud par défaut

    // Dash
    this.dashCooldown = 1.3 * (char.dashCdMult || 1.0);
    this.dashTimer = 0;
    this.isDashing = false;
    this.dashDuration = 0.16;
    this.dashRemaining = 0;

    // Animation de marche & spritesheet
    this.walkTimer = 0;
    this.isMoving = false;

    // Progression
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 35;
    this.upgrades = {};

    // Cadences d'armes & Pouvoirs
    this.wandTimer = 0;
    this.meteorTimer = 0;
    this.auraTimer = 0;
    this.orbitAngle = 0;
  }

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

  update(dt, moveX, moveY, worldSize) {
    let currentSpeed = this.speed;
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

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.hypot(moveX, moveY);
      const nx = moveX / length;
      const ny = moveY / length;
      this.x += nx * currentSpeed * dt;
      this.y += ny * currentSpeed * dt;
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

    // Rotation des orbes
    this.orbitAngle += dt * 6.8;
  }

  updateWeapons(dt, engine) {
    // 1. BAGUETTE ÉTHÉRÉE (Rafales continues ultra-rapides)
    if (this.upgrades['wand'] > 0) {
      const lvl = this.upgrades['wand'];
      const cooldown = Math.max(0.08, 0.20 - (lvl - 1) * 0.03);
      this.wandTimer += dt;

      if (this.wandTimer >= cooldown) {
        this.wandTimer = 0;
        const target = this.findNearestEnemy(engine.enemies);
        if (target) {
          const baseAngle = Math.atan2(target.y - this.y, target.x - this.x);
          const dmg = (12 + lvl * 4) * this.damageMultiplier;
          
          const projCount = Math.min(5, lvl);
          const spread = 0.14;

          for (let i = 0; i < projCount; i++) {
            const offset = (i - (projCount - 1) / 2) * spread;
            const angle = baseAngle + offset;
            engine.projectiles.push(new Projectile(this.x, this.y, angle, 840, dmg, 1, 'wand'));
          }

          sfx.playLaser();
        }
      }
    }

    // 2. PLUIE DE MÉTÉORES (POUVOIR DE ZONE DÉVASTATEUR)
    if (this.upgrades['meteor'] > 0) {
      const lvl = this.upgrades['meteor'];
      const cooldown = Math.max(0.6, 1.4 - (lvl - 1) * 0.18);
      this.meteorTimer += dt;

      if (this.meteorTimer >= cooldown) {
        this.meteorTimer = 0;
        const meteorCount = Math.min(4, 1 + Math.floor(lvl / 2));
        
        for (let m = 0; m < meteorCount; m++) {
          let targetX = this.x + (Math.random() - 0.5) * 600;
          let targetY = this.y + (Math.random() - 0.5) * 600;
          
          if (engine.enemies.length > 0) {
            const randomEnemy = engine.enemies[Math.floor(Math.random() * engine.enemies.length)];
            targetX = randomEnemy.x + (Math.random() - 0.5) * 60;
            targetY = randomEnemy.y + (Math.random() - 0.5) * 60;
          }

          setTimeout(() => {
            sfx.playMeteor();
            engine.triggerScreenShake(9);
            const radius = 130 + lvl * 25;
            const dmg = (45 + lvl * 18) * this.damageMultiplier;

            engine.addShockwave(targetX, targetY, radius, '#ff3300', 5);
            engine.createHitParticles(targetX, targetY, '#ff9900', 20);
            engine.createHitParticles(targetX, targetY, '#ff2a55', 15);

            for (const enemy of engine.enemies) {
              const d = Math.hypot(enemy.x - targetX, enemy.y - targetY);
              if (d <= radius + enemy.radius) {
                enemy.hp -= dmg;
                enemy.hitFlash = 0.15;
                const ang = Math.atan2(enemy.y - targetY, enemy.x - targetX);
                enemy.x += Math.cos(ang) * 35;
                enemy.y += Math.sin(ang) * 35;
                engine.addFloatingText(enemy.x, enemy.y - 15, `💥${Math.round(dmg)}`, '#ff9900', 20);
              }
            }
          }, m * 140);
        }
      }
    }

    // 3. ORBES GARDIENS (Zone orbitale de contact)
    if (this.upgrades['orbit'] > 0) {
      const lvl = this.upgrades['orbit'];
      const count = 1 + lvl;
      const orbitDist = 75;
      const dmg = (16 + lvl * 6) * this.damageMultiplier * dt * 5;

      for (let i = 0; i < count; i++) {
        const angle = this.orbitAngle + (i * (Math.PI * 2 / count));
        const ox = this.x + Math.cos(angle) * orbitDist;
        const oy = this.y + Math.sin(angle) * orbitDist;

        for (const enemy of engine.enemies) {
          const d = Math.hypot(enemy.x - ox, enemy.y - oy);
          if (d < 18 + enemy.radius) {
            enemy.hp -= dmg;
            enemy.hitFlash = 0.08;
            if (Math.random() < 0.25) {
              engine.createHitParticles(ox, oy, '#00f0ff', 2);
            }
          }
        }
      }
    }

    // 4. VORTEX DE SANG ARCANE (Zone de proximité continue)
    if (this.upgrades['aura'] > 0) {
      const lvl = this.upgrades['aura'];
      this.auraTimer += dt;
      if (this.auraTimer >= 0.12) {
        this.auraTimer = 0;
        const radius = 90 + lvl * 24;
        const dmg = (7 + lvl * 3.5) * this.damageMultiplier;

        for (const enemy of engine.enemies) {
          const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
          if (d <= radius + enemy.radius) {
            enemy.hp -= dmg;
            enemy.hitFlash = 0.08;
            if (Math.random() < 0.3) {
              engine.createHitParticles(enemy.x, enemy.y, '#ff2a55', 2);
            }
          }
        }
      }
    }
  }

  findNearestEnemy(enemies) {
    let nearest = null;
    let minDist = 580; // Détecte seulement les ennemis clairement visibles à l'écran
    for (const e of enemies) {
      const d = Math.hypot(e.x - this.x, e.y - this.y);
      if (d < minDist) {
        minDist = d;
        nearest = e;
      }
    }
    return nearest;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.invulnTimer = 0.40;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  addXp(amount) {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.level++;
      this.xp -= this.xpToNext;
      this.xpToNext = Math.floor(35 * Math.pow(1.35, this.level - 1));
      return true;
    }
    return false;
  }

  applyUpgrade(id) {
    switch(id) {
      case 'speed':
        this.speed = this.baseSpeed * (1 + (this.upgrades['speed'] || 0) * 0.15);
        break;
      case 'power':
        this.damageMultiplier = 1 + (this.upgrades['power'] || 0) * 0.20;
        break;
      case 'health':
        this.maxHp += 35;
        this.heal(45);
        break;
      case 'magnet':
        this.magnetRadius = 110 * (1 + (this.upgrades['magnet'] || 0) * 0.50);
        break;
      case 'regen':
        this.regen = (this.upgrades['regen'] || 0) * 1.2;
        break;
    }
  }

  draw(ctx) {
    if (this.invulnTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(this.x, this.y);

    // Ombre sous le héros
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 16, this.radius, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Traînée lumineuse si en Dash
    if (this.isDashing) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 24;
    }

    // Halo d'énergie mystique
    const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 2.5);
    glow.addColorStop(0, this.isDashing ? 'rgba(0, 240, 255, 0.85)' : 'rgba(0, 240, 255, 0.45)');
    glow.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. Rendu du sprite 8-directions du héros
    const img = spriteLoader.getImage(this.spriteSrc);
    if (img && img.complete && img.naturalWidth > 0) {
      const row = getSpriteRowFromAngle(this.facingAngle);
      const col = this.isMoving ? (Math.floor(this.walkTimer) % 4) : 0;

      ctx.imageSmoothingEnabled = false;
      const drawSize = 54;
      ctx.drawImage(
        img,
        col * 32, row * 32, 32, 32,
        -drawSize / 2, -drawSize / 2 - 2, drawSize, drawSize
      );
    } else {
      // Fallback
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Orbes en orbite
    if (this.upgrades['orbit'] > 0) {
      const lvl = this.upgrades['orbit'];
      const count = 1 + lvl;
      const orbitDist = 75;

      for (let i = 0; i < count; i++) {
        const angle = this.orbitAngle + (i * (Math.PI * 2 / count));
        const ox = Math.cos(angle) * orbitDist;
        const oy = Math.sin(angle) * orbitDist;

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ox, oy, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ox, oy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }
}
