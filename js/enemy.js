/**
 * Module Ennemis - Monstres et Colosse Boss
 */
import { Projectile } from './entities.js';
import { MONSTER_SPRITES, spriteLoader, getSpriteRowFromAngle } from './sprites.js';

export class Enemy {
  constructor(x, y, type, gameTime = 0, wave = 1) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.hitFlash = 0;
    this.attackTimer = 0;
    this.animTimer = Math.random() * 10;
    this.facingAngle = 0;

    const hpScale = (1 + (gameTime / 150) * 0.6) * (1 + (wave - 1) * 0.15);

    switch(type) {
      case 'bat':
        this.radius = 16;
        this.speed = 145 + Math.random() * 30;
        this.hp = 14 * hpScale;
        this.damage = 8;
        this.color = '#bf55ec';
        break;
      case 'skeleton':
        this.radius = 20;
        this.speed = 100 + Math.random() * 20;
        this.hp = 35 * hpScale;
        this.damage = 14;
        this.color = '#e0e6ed';
        break;
      case 'zombie':
        this.radius = 25;
        this.speed = 70 + Math.random() * 15;
        this.hp = 75 * hpScale;
        this.damage = 20;
        this.color = '#2ecc71';
        break;
      case 'demon':
        this.radius = 30;
        this.speed = 115 + Math.random() * 20;
        this.hp = 130 * hpScale;
        this.damage = 25;
        this.color = '#e74c3c';
        break;
      case 'boss':
        // BOSS TITANESQUE (Radius 108px)
        this.radius = 108;
        this.speed = 85;
        this.hp = 1400 * hpScale;
        this.maxHp = this.hp;
        this.damage = 40;
        this.color = '#ff0055';
        break;
    }

    this.maxHp = this.hp;
    this.baseSpeed = this.speed;
  }

  update(dt, player, engine) {
    let aimX = player.x;
    let aimY = player.y;

    // Navigation intelligente de la horde vers les ponts si séparée par la rivière
    if (engine && engine.worldMap && engine.worldMap.getMonsterNavTarget) {
      const navTarget = engine.worldMap.getMonsterNavTarget(this.x, this.y, player.x, player.y);
      aimX = navTarget.x;
      aimY = navTarget.y;
    }

    const angle = Math.atan2(aimY - this.y, aimX - this.x);
    let vx = Math.cos(angle) * this.speed;
    let vy = Math.sin(angle) * this.speed;

    // Répulsion légère pour fluidifier la horde sans collision lourde
    if (this.type !== 'boss' && engine && engine.enemies) {
      const sampleCount = Math.min(engine.enemies.length, 25);
      for (let i = 0; i < sampleCount; i++) {
        const other = engine.enemies[i];
        if (other !== this) {
          const dx = this.x - other.x;
          const dy = this.y - other.y;
          const distSq = dx * dx + dy * dy;
          const minDist = this.radius + other.radius;
          if (distSq < minDist * minDist && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const push = (minDist - dist) * 1.8;
            vx += (dx / dist) * push;
            vy += (dy / dist) * push;
            break;
          }
        }
      }
    }

    const targetX = this.x + vx * dt;
    const targetY = this.y + vy * dt;

    if (engine && engine.worldMap) {
      const resolved = engine.worldMap.resolveMove(this.x, this.y, targetX, targetY, this.radius, false);
      this.x = resolved.x;
      this.y = resolved.y;
    } else {
      this.x = targetX;
      this.y = targetY;
    }

    this.facingAngle = angle;
    this.animTimer += dt;

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
    }

    // Comportement d'attaque spéciale du BOSS
    if (this.type === 'boss') {
      this.attackTimer += dt;
      // Toutes les 3.5s, le Boss frappe le sol et libère un anneau de projectiles
      if (this.attackTimer >= 3.5) {
        this.attackTimer = 0;
        engine.triggerScreenShake(12);
        engine.addShockwave(this.x, this.y, 240, '#ff0055', 6);
        engine.addFloatingText(this.x, this.y - this.radius, "🔥 SOUFFLE INFERNAL !", '#ff0055', 24);

        // Tire un cercle de 12 projectiles sombres
        const count = 12;
        for (let i = 0; i < count; i++) {
          const a = (i * Math.PI * 2) / count;
          engine.projectiles.push(new Projectile(this.x, this.y, a, 320, 20, 1, 'boss', true));
        }
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Ombre au sol
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, this.radius * 0.85, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ==========================================
    // RENDU DU BOSS TITANESQUE (95px)
    // ==========================================
    if (this.type === 'boss') {
      // 1. Cercle runique tournoyant sous le Boss
      const runeAngle = Date.now() * 0.0015;
      ctx.save();
      ctx.rotate(runeAngle);
      ctx.strokeStyle = 'rgba(255, 42, 85, 0.4)';
      ctx.lineWidth = 3;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 2. Ailes démoniaques gigantesques
      const wingFlap = Math.sin(Date.now() * 0.006) * 16;
      ctx.fillStyle = '#4a0011';
      ctx.strokeStyle = '#ff0055';
      ctx.lineWidth = 3;

      // Aile Gauche
      ctx.beginPath();
      ctx.moveTo(-20, -10);
      ctx.quadraticCurveTo(-this.radius * 1.8, -this.radius * 1.5 + wingFlap, -this.radius * 1.6, -10 + wingFlap);
      ctx.quadraticCurveTo(-this.radius * 0.9, 10, -20, 10);
      ctx.fill();
      ctx.stroke();

      // Aile Droite
      ctx.beginPath();
      ctx.moveTo(20, -10);
      ctx.quadraticCurveTo(this.radius * 1.8, -this.radius * 1.5 + wingFlap, this.radius * 1.6, -10 + wingFlap);
      ctx.quadraticCurveTo(this.radius * 0.9, 10, 20, 10);
      ctx.fill();
      ctx.stroke();

      // 3. Corps titanesque en obsidienne
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#1a050e';
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // 4. Armure et cornes titanesques
      ctx.fillStyle = '#ff0055';
      // Corne Gauche
      ctx.beginPath();
      ctx.moveTo(-this.radius * 0.5, -this.radius * 0.7);
      ctx.quadraticCurveTo(-this.radius * 1.1, -this.radius * 1.5, -this.radius * 0.3, -this.radius * 1.3);
      ctx.fill();

      // Corne Droite
      ctx.beginPath();
      ctx.moveTo(this.radius * 0.5, -this.radius * 0.7);
      ctx.quadraticCurveTo(this.radius * 1.1, -this.radius * 1.5, this.radius * 0.3, -this.radius * 1.3);
      ctx.fill();

      // 5. Cœur démoniaque ardent
      const heartPulse = Math.sin(Date.now() * 0.01) * 6;
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(0, 10, 22 + heartPulse, 0, Math.PI * 2);
      ctx.fill();

      // 6. Yeux de braise géants
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.35, -20, 9, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.35, -20, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.35, -20, 3.5, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.35, -20, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return;
    }

    // ==========================================
    // RENDU DES MONSTRES AVEC SPRITESHEETS
    // ==========================================
    const cfg = MONSTER_SPRITES[this.type];
    const img = cfg ? spriteLoader.getImage(cfg.path) : null;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.imageSmoothingEnabled = false;

      // Flash blanc quand blessé
      if (this.hitFlash > 0) {
        ctx.filter = 'brightness(3) saturate(0.2)';
      }

      const size = cfg.drawSize;

      if (cfg.isSlime) {
        // Slime : 15 images sur 1 ligne avec effet rebond squash & stretch
        const col = Math.floor(this.animTimer * 10) % cfg.cols;
        const squash = 1 + Math.sin(this.animTimer * 10) * 0.12;
        ctx.drawImage(
          img,
          col * 32, 0, 32, 32,
          -size / 2, -size / 2 * squash - 2, size, size * squash
        );
      } else {
        // Monstres 8 directions (Araignée, Loup, Orc)
        const row = getSpriteRowFromAngle(this.facingAngle);
        const col = Math.floor(this.animTimer * 8) % 4; // 4 frames de marche
        ctx.drawImage(
          img,
          col * 32, row * 32, 32, 32,
          -size / 2, -size / 2 - 2, size, size
        );
      }

      if (this.hitFlash > 0) {
        ctx.filter = 'none';
      }
    } else {
      // Fallback procédural si le sprite est en chargement
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Yeux rouges menaçants
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(-this.radius * 0.35, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(this.radius * 0.35, -2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Barre de vie des monstres blessés
    if (this.hp < this.maxHp) {
      const barWidth = this.radius * 2.2;
      const barHeight = 4;
      const yOffset = -this.radius - 8;

      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(-barWidth / 2, yOffset, barWidth, barHeight);

      const hpRatio = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = '#00ff88';
      ctx.fillRect(-barWidth / 2, yOffset, barWidth * hpRatio, barHeight);
    }

    ctx.restore();
  }
}
