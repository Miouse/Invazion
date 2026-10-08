/**
 * Module Ennemis - Monstres et Colosse Boss
 */
import { Projectile } from './entities.js';

export class Enemy {
  constructor(x, y, type, gameTime) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.hitFlash = 0;
    this.attackTimer = 0;

    const hpScale = 1 + (gameTime / 90) * 1.5;

    switch(type) {
      case 'bat':
        this.radius = 14;
        this.speed = 145 + Math.random() * 30;
        this.hp = 14 * hpScale;
        this.damage = 8;
        this.color = '#bf55ec';
        break;
      case 'skeleton':
        this.radius = 18;
        this.speed = 100 + Math.random() * 20;
        this.hp = 35 * hpScale;
        this.damage = 14;
        this.color = '#e0e6ed';
        break;
      case 'zombie':
        this.radius = 22;
        this.speed = 70 + Math.random() * 15;
        this.hp = 75 * hpScale;
        this.damage = 20;
        this.color = '#2ecc71';
        break;
      case 'demon':
        this.radius = 26;
        this.speed = 115 + Math.random() * 20;
        this.hp = 130 * hpScale;
        this.damage = 25;
        this.color = '#e74c3c';
        break;
      case 'boss':
        // BOSS 3 FOIS PLUS GROS (Radius 95px)
        this.radius = 95;
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
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed * dt;
    this.y += Math.sin(angle) * this.speed * dt;

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
    // RENDU DES ENNEMIS STANDARDS
    // ==========================================
    ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Ailes chauve-souris
    if (this.type === 'bat') {
      const flap = Math.sin(Date.now() * 0.02) * 8;
      ctx.fillStyle = '#7a22a8';
      ctx.beginPath();
      ctx.ellipse(-this.radius * 1.2, flap, this.radius * 0.9, 6, 0.4, 0, Math.PI * 2);
      ctx.ellipse(this.radius * 1.2, flap, this.radius * 0.9, 6, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cornes démons
    if (this.type === 'demon') {
      ctx.fillStyle = '#ffd23f';
      ctx.beginPath();
      ctx.moveTo(-10, -this.radius);
      ctx.lineTo(-16, -this.radius - 10);
      ctx.lineTo(-4, -this.radius - 4);
      ctx.moveTo(10, -this.radius);
      ctx.lineTo(16, -this.radius - 10);
      ctx.lineTo(4, -this.radius - 4);
      ctx.fill();
    }

    // Yeux rouges menaçants
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(-this.radius * 0.35, -2, 2.5, 0, Math.PI * 2);
    ctx.arc(this.radius * 0.35, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();

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
