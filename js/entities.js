/**
 * Module Entités - Projectiles et Gemmes d'Âme
 */

export class Projectile {
  constructor(x, y, angle, speed, damage, pierce = 1, type = 'wand', isEnemy = false) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.pierce = pierce;
    this.type = type;
    this.isEnemy = isEnemy;
    this.radius = isEnemy ? 9 : 6.5;
    this.knockback = 14;
    this.life = 1.6;
    this.hitList = new Set();
    this.dead = false;
  }

  update(dt, engine) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (Math.random() < 0.25 && engine) {
      engine.createHitParticles(this.x, this.y, this.isEnemy ? '#ff0055' : '#00f0ff', 1);
    }
  }

  isExpired() {
    return this.life <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isEnemy) {
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    ctx.restore();
  }
}

export class Gem {
  constructor(x, y, value, type = 'blue') {
    this.x = x;
    this.y = y;
    this.value = value;
    this.type = type;
    this.radius = type === 'heart' ? 10 : 8;
    this.magnetized = false;
    this.speed = 0;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  update(dt, player) {
    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    if (dist < player.magnetRadius) {
      this.magnetized = true;
    }

    if (this.magnetized) {
      const angle = Math.atan2(player.y - this.y, player.x - this.x);
      this.speed += 1050 * dt;
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(Date.now() * 0.005 + this.floatOffset) * 3;
    ctx.translate(this.x, this.y + bob);

    if (this.type === 'heart') {
      ctx.fillStyle = '#ff2a55';
      ctx.shadowColor = '#ff2a55';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-4, -3, 5, Math.PI, 0, false);
      ctx.arc(4, -3, 5, Math.PI, 0, false);
      ctx.lineTo(0, 7);
      ctx.closePath();
      ctx.fill();
    } else {
      let color = '#00f0ff';
      let shadow = '#00f0ff';
      if (this.type === 'green') { color = '#2ecc71'; shadow = '#2ecc71'; }
      if (this.type === 'red') { color = '#ff0055'; shadow = '#ff0055'; }

      ctx.fillStyle = color;
      ctx.shadowColor = shadow;
      ctx.shadowBlur = 9;
      
      // Losange facetté
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius, 0);
      ctx.lineTo(0, this.radius);
      ctx.lineTo(-this.radius, 0);
      ctx.closePath();
      ctx.fill();

      // Facette brillante
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, -this.radius);
      ctx.lineTo(this.radius * 0.4, 0);
      ctx.lineTo(0, this.radius * 0.4);
      ctx.lineTo(-this.radius * 0.4, 0);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
