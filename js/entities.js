/**
 * Module Entités - Projectiles Médiévaux et Butin (Pièces d'Or & Cœurs)
 */

export class Projectile {
  constructor(x, y, angle, speed, damage, pierce = 1, type = 'arrow', isEnemy = false) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.damage = damage;
    this.pierce = pierce;
    this.type = type;
    this.isEnemy = isEnemy;
    this.radius = (type === 'fireball' || type === 'fire_orb') ? 12 : (type === 'wind_blade' ? 10 : (isEnemy ? 9 : 7));
    this.knockback = (type === 'fireball' || type === 'fire_orb') ? 26 : (type === 'arrow' ? 16 : 14);
    this.life = type === 'arrow' ? 1.8 : ((type === 'fireball' || type === 'fire_orb') ? 1.2 : 1.5);
    this.hitList = new Set();
    this.dead = false;
  }

  update(dt, engine) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (engine) {
      if (this.type === 'fireball' || this.type === 'fire_orb') {
        if (Math.random() < 0.6) {
          engine.createHitParticles(this.x, this.y, Math.random() < 0.5 ? '#ff4d00' : '#ffaa00', 1);
        }
      } else if (this.type === 'arcane_bolt') {
        if (Math.random() < 0.4) {
          engine.createHitParticles(this.x, this.y, Math.random() < 0.5 ? '#00f0ff' : '#9b5de5', 1);
        }
      } else if (this.type === 'lightning_bolt') {
        if (Math.random() < 0.5) {
          engine.createHitParticles(this.x, this.y, Math.random() < 0.5 ? '#fffb00' : '#00f0ff', 1);
        }
      } else if (this.type === 'frost_bolt') {
        if (Math.random() < 0.45) {
          engine.createHitParticles(this.x, this.y, '#38bdf8', 1);
        }
      } else if (this.type === 'wind_blade') {
        if (Math.random() < 0.4) {
          engine.createHitParticles(this.x, this.y, '#2dd4bf', 1);
        }
      } else if (this.isEnemy) {
        if (Math.random() < 0.3) {
          engine.createHitParticles(this.x, this.y, '#ff0055', 1);
        }
      }
    }
  }

  isExpired() {
    return this.life <= 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.isEnemy) {
      // Orbe sombre des monstres
      ctx.fillStyle = 'rgba(255, 0, 85, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff0055';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'arrow') {
      // Flèche médiévale de l'archère (empennage, fût en bois, pointe en acier)
      ctx.rotate(this.angle);

      // Fût en bois
      ctx.strokeStyle = '#8b5a2b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(8, 0);
      ctx.stroke();

      // Pointe d'acier affûtée
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(6, -4);
      ctx.lineTo(8, 0);
      ctx.lineTo(6, 4);
      ctx.closePath();
      ctx.fill();

      // Empennage (plumes blanches sylvestres)
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(-8, -4);
      ctx.lineTo(-11, 0);
      ctx.lineTo(-8, 4);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'fireball') {
      // Boule de feu du Pyromancien
      ctx.rotate(this.angle);

      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius * 1.8);
      glow.addColorStop(0, '#fff3b0');
      glow.addColorStop(0.35, '#ff7700');
      glow.addColorStop(0.7, '#d90429');
      glow.addColorStop(1, 'rgba(217, 4, 41, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Traînée de flammes arrière
      ctx.fillStyle = '#ff9900';
      ctx.beginPath();
      ctx.moveTo(-4, -6);
      ctx.lineTo(-16, 0);
      ctx.lineTo(-4, 6);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'arcane_bolt') {
      // Éclair d'Arcane du Mage
      const pulse = Math.sin(Date.now() * 0.015) * 2;
      const r = this.radius + pulse;

      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, r * 1.6);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.4, '#00f0ff');
      glow.addColorStop(0.8, '#7b2cbf');
      glow.addColorStop(1, 'rgba(123, 44, 191, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Étoile d'énergie
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'lightning_bolt') {
      // Arc Voltaïque / Éclair de Foudre
      ctx.rotate(this.angle);
      
      // Halo jaune et blanc éclatant
      ctx.fillStyle = 'rgba(255, 230, 0, 0.28)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2, 0, Math.PI * 2);
      ctx.fill();

      // Zigzag d'éclair stylisé
      ctx.strokeStyle = '#fffb00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(2, 4);
      ctx.lineTo(16, 0);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(2, 4);
      ctx.lineTo(16, 0);
      ctx.stroke();
    } else if (this.type === 'frost_bolt') {
      // Javelot de Givre cristallin
      ctx.rotate(this.angle);

      // Halo glacé cyan
      const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, this.radius * 1.8);
      glow.addColorStop(0, '#ffffff');
      glow.addColorStop(0.5, '#38bdf8');
      glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Pieu de glace taillé
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(0, -5);
      ctx.lineTo(-12, 0);
      ctx.lineTo(0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.type === 'fire_orb') {
      // Météore Ardent
      ctx.rotate(this.angle);

      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius * 2.0);
      glow.addColorStop(0, '#fffbeb');
      glow.addColorStop(0.35, '#f59e0b');
      glow.addColorStop(0.7, '#dc2626');
      glow.addColorStop(1, 'rgba(220, 38, 38, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 2.0, 0, Math.PI * 2);
      ctx.fill();

      // Cœur magmatique
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'wind_blade') {
      // Lame Zéphyr (Croissant tranchant de vent)
      ctx.rotate(this.angle);

      ctx.fillStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Croissant de vent
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(4, 0, 14, -Math.PI / 2.2, Math.PI / 2.2);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, 0, 12, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();
    } else {
      // Projectile standard
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

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
  constructor(x, y, value, type = 'coin') {
    this.x = x;
    this.y = y;
    this.value = value;
    this.type = type; // 'coin' | 'heart' | 'red'
    this.radius = type === 'heart' ? 11 : 9;
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
      this.speed += 1150 * dt;
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    const bob = Math.sin(Date.now() * 0.006 + this.floatOffset) * 3;
    ctx.translate(this.x, this.y + bob);

    if (this.type === 'heart') {
      // Cœur de vie réparateur
      ctx.fillStyle = 'rgba(255, 42, 85, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff2a55';
      ctx.beginPath();
      ctx.arc(-4, -3, 5, Math.PI, 0, false);
      ctx.arc(4, -3, 5, Math.PI, 0, false);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();

      // Reflet brillant
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -4, 1.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 🪙 Pièce d'or médiévale étincelante
      // Lueur d'or
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Tranche dorée
      ctx.fillStyle = '#b8860b';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Face de la pièce
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 2, 0, Math.PI * 2);
      ctx.fill();

      // Emblème royal intérieur
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius - 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Croix / Étoile centrale
      ctx.fillStyle = '#fff3b0';
      ctx.fillRect(-1.5, -3.5, 3, 7);
      ctx.fillRect(-3.5, -1.5, 7, 3);
    }

    ctx.restore();
  }
}
